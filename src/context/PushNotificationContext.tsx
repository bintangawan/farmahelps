import { createContext, useContext, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, BellRing } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

// --- Helper VAPID ---
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushNotificationContextType {
  /** 
   * Cek apakah user punya push subscription aktif.
   * Jika tidak → tampilkan popup.
   * Panggil ini di Dashboard mount, setelah create obat/jadwal, dll.
   */
  checkAndPrompt: () => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);

export const usePushNotification = () => {
  const ctx = useContext(PushNotificationContext);
  if (!ctx) throw new Error("usePushNotification must be used within PushNotificationProvider");
  return ctx;
};

export const PushNotificationProvider = ({ children }: { children: ReactNode }) => {
  const [showModal, setShowModal] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Debounce: Jangan check berkali-kali dalam waktu singkat
  const lastCheckRef = useRef<number>(0);
  // Jangan tampilkan popup jika sudah dismiss di sesi ini
  const dismissedRef = useRef(false);

  // ================================================================
  // checkAndPrompt — bisa dipanggil dari mana saja
  // Langkah:
  //   1. Cek browser support
  //   2. Jika permission 'denied' → skip (user sudah block permanen)
  //   3. Jika permission 'default' → tampilkan popup (belum pernah pilih)
  //   4. Jika permission 'granted':
  //      a. Coba cek apakah browser masih punya subscription
  //      b. Jika ada → kirim ke server (silent sync) → selesai
  //      c. Jika tidak ada → tanya server
  //         - Server punya? → coba subscribe ulang dari browser
  //         - Server juga tidak punya? → tampilkan popup
  // ================================================================
  const checkAndPrompt = useCallback(async () => {
    // Jangan check terlalu sering (minimal 5 detik antar check)
    const now = Date.now();
    if (now - lastCheckRef.current < 5000) return;
    lastCheckRef.current = now;

    // Jangan tampilkan lagi jika user sudah dismiss di sesi ini
    if (dismissedRef.current) return;

    // Jangan tampilkan jika modal sudah terbuka
    if (showModal) return;

    // Browser support check
    if (!("Notification" in window)) return;

    const permission = Notification.permission;

    // User sudah block permanen → tidak bisa berbuat apa-apa
    if (permission === "denied") return;

    // Belum pernah memilih → langsung tampilkan popup
    if (permission === "default") {
      setShowModal(true);
      return;
    }

    // permission === 'granted' — cek subscription status
    try {
      // Coba cek browser subscription (jika SW sudah ready)
      if ("serviceWorker" in navigator) {
        const swReg = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)), // timeout 3 detik
        ]);

        if (swReg && swReg instanceof ServiceWorkerRegistration) {
          const localSub = await swReg.pushManager.getSubscription();
          if (localSub) {
            // Browser punya subscription → sinkronkan ke server secara diam-diam
            try {
              await api.post("/notifications/subscribe", localSub);
            } catch {
              // Gagal sync, tapi subscription masih valid di browser
            }
            return; // Selesai, tidak perlu popup
          }
        }
      }

      // Browser TIDAK punya subscription — cek server
      try {
        const resp = await api.get("/notifications/check-subscription");
        const hasServerSub = resp.data?.hasSubscription;

        if (hasServerSub) {
          // Server punya tapi browser tidak — coba subscribe ulang dari browser
          await silentBrowserSubscribe();
          return;
        }
      } catch {
        // Gagal cek server — fall through ke popup
      }

      // Tidak ada subscription di manapun → tampilkan popup
      setShowModal(true);
    } catch (error) {
      console.error("Push check error:", error);
      // Jika ada error apapun dan kita tidak yakin statusnya → tampilkan popup
      setShowModal(true);
    }
  }, [showModal]);

  // Helper: Subscribe browser tanpa interaksi user (permission sudah granted)
  const silentBrowserSubscribe = async () => {
    try {
      if (!("serviceWorker" in navigator)) return;

      const swReg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
      ]);

      if (!swReg || !(swReg instanceof ServiceWorkerRegistration)) return;

      const subscription = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
      });

      await api.post("/notifications/subscribe", subscription);
    } catch (error) {
      console.error("Silent subscribe error:", error);
    }
  };

  // Handler tombol "Ya, Aktifkan" di popup
  const handleEnable = async () => {
    setIsSubscribing(true);
    try {
      // Request permission (jika masih 'default')
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        toast.error("Izin notifikasi ditolak oleh browser.");
        setShowModal(false);
        return;
      }

      if (!("serviceWorker" in navigator)) {
        toast.error("Browser tidak mendukung Service Worker.");
        setShowModal(false);
        return;
      }

      // Pastikan SW terdaftar — jika belum (misal setelah clear data), register manual
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations.length === 0) {
        // SW belum terdaftar — register manual (vite-plugin-pwa belum sempat)
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      }

      // Tunggu SW ready dengan timeout 10 detik
      const swReg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("SW timeout")), 10000)),
      ]);

      // Subscribe push
      let subscription = await swReg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await swReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
        });
      }

      // Kirim ke server
      await api.post("/notifications/subscribe", subscription);

      toast.success("Notifikasi berhasil diaktifkan! 🔔");
      setShowModal(false);
    } catch (error) {
      console.error("Enable notification error:", error);
      toast.error("Gagal mengaktifkan notifikasi. Coba lagi nanti.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    dismissedRef.current = true;
    setShowModal(false);
  };

  return (
    <PushNotificationContext.Provider value={{ checkAndPrompt }}>
      {children}

      {/* Modal Notifikasi — tersedia di seluruh aplikasi */}
      <Dialog open={showModal} onOpenChange={(open) => { if (!open) handleDismiss(); }}>
        <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl border-white/50">
          <DialogHeader>
            <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-2">
              <BellRing className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-center text-xl">Aktifkan Notifikasi?</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Agar Anda tidak lupa jadwal minum obat, izinkan kami mengirimkan notifikasi langsung ke perangkat ini.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center mt-4">
            <Button variant="outline" onClick={handleDismiss} className="w-full sm:w-auto">
              Nanti Saja
            </Button>
            <Button
              onClick={handleEnable}
              disabled={isSubscribing}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubscribing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengaktifkan...
                </>
              ) : (
                "Ya, Aktifkan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PushNotificationContext.Provider>
  );
};
