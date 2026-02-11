import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  LogOut,
  Pill,
  LayoutDashboard,
  Archive,
  Calendar,
  Menu,
  User,
  Bell,
  CheckCircle2,
  Mail,
  BellRing,
  NotebookPen,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { getData } from "@/services/api";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// Definisi Tipe Data Notifikasi sesuai Database
interface NotificationLog {
  id: number;
  title: string;
  message: string;
  type: "email" | "push" | "system";
  created_at: string;
}

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // BEST PRACTICE 1: Inisialisasi state dengan Array Kosong []
  // Jangan pernah null/undefined agar tidak error "reading length"
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);

  const handleLogout = () => {
    logout();
    toast.info("Anda telah keluar.");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  // --- FETCH NOTIFIKASI (SAFE MODE) ---
  const fetchNotifications = async () => {
    try {
      const data = await getData<NotificationLog[]>("/notifications");

      // BEST PRACTICE 2: Validasi Tipe Data
      // Pastikan 'data' benar-benar Array sebelum dipakai
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.warn("API Notifikasi tidak mengembalikan array:", data);
        setNotifications([]); // Fallback ke array kosong jika format salah
      }
    } catch (error) {
      console.error("Gagal load notifikasi navbar:", error);
      setNotifications([]); // Fallback aman
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Polling setiap 30 detik (Auto Refresh)
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Inventory", path: "/inventory", icon: Archive },
    { name: "Jadwal", path: "/schedule", icon: Calendar },
    { name: "Jurnaling", path: "/journal", icon: NotebookPen },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-xl shadow-sm transition-all">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        {/* ================= KIRI: LOGO & MOBILE MENU ================= */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-600 hover:bg-slate-100"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-[300px] bg-white/95 backdrop-blur-xl border-r border-slate-200 p-0"
              >
                <SheetHeader className="p-6 text-left border-b border-slate-100">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 text-white">
                      <Pill className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-slate-800 text-lg">
                      FarmaHelps
                    </span>
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigasi utama
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-1 p-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive(item.path)
                          ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-100"
                          : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                      }`}
                    >
                      <item.icon
                        className={`h-5 w-5 ${isActive(item.path) ? "text-blue-600" : "text-slate-400"}`}
                      />
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3 px-2 mb-4">
                    <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm overflow-hidden">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full justify-center gap-2 shadow-red-100 shadow-lg"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" /> Keluar
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-md group-hover:scale-105 transition-transform">
              <Pill className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent hidden md:block">
              FarmaHelps
            </span>
          </Link>
        </div>

        {/* ================= TENGAH: MENU DESKTOP ================= */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 text-sm font-medium transition-all relative py-1 group ${
                isActive(item.path)
                  ? "text-blue-600 font-semibold"
                  : "text-slate-600 hover:text-blue-600"
              }`}
            >
              <item.icon
                className={`h-4 w-4 ${isActive(item.path) ? "stroke-[2.5px]" : ""}`}
              />
              {item.name}
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full transform transition-transform duration-300 origin-left ${
                  isActive(item.path)
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          ))}
        </div>

        {/* ================= KANAN: ACTIONS & PROFILE ================= */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* 1. Notification Bell */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
              >
                <Bell className="h-5 w-5" />

                {/* BEST PRACTICE 3: Safe Length Check */}
                {notifications?.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              className="w-80 p-0 bg-white/95 backdrop-blur-xl border-slate-200 shadow-xl max-h-[400px] flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h4 className="font-semibold text-slate-800 text-sm">
                  Notifikasi
                </h4>
                {notifications?.length > 0 && (
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                    {notifications.length} Terbaru
                  </span>
                )}
              </div>

              <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {/* BEST PRACTICE 4: Conditional Rendering yang Aman */}
                {Array.isArray(notifications) && notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-full mt-1 ${
                            notif.type === "email"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-purple-100 text-purple-600"
                          }`}
                        >
                          {notif.type === "email" ? (
                            <Mail className="h-3 w-3" />
                          ) : (
                            <BellRing className="h-3 w-3" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
                            {formatDistanceToNow(new Date(notif.created_at), {
                              addSuffix: true,
                              locale: idLocale,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">
                      Belum ada notifikasi baru.
                    </p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>

          {/* 2. Desktop Profile */}
          <div className="hidden md:flex items-center gap-3 pl-1">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800 leading-none">
                {user?.name}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-none">
                {user?.email}
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 border border-white shadow-sm flex items-center justify-center overflow-hidden">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-slate-600" />
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all ml-1"
            title="Keluar"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};
