import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pill } from "lucide-react";

export const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Pill className="h-5 w-5" />
            </div>
            <span className="font-bold text-slate-800">FarmaHelps</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-500 mb-8">Terakhir diperbarui: 11 Februari 2026</p>

          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Pendahuluan</h2>
              <p>
                Selamat datang di FarmaHelps. Privasi Anda sangat penting bagi kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan aplikasi kami.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Informasi yang Kami Kumpulkan</h2>
              <p>Kami dapat mengumpulkan jenis informasi berikut:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Informasi Akun:</strong> Nama, alamat email, dan foto profil (via Google Login).</li>
                <li><strong>Data Kesehatan:</strong> Daftar obat, jadwal minum obat, dan catatan jurnal kesehatan yang Anda input.</li>
                <li><strong>Data Penggunaan:</strong> Log aktivitas untuk meningkatkan performa aplikasi.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Penggunaan Data</h2>
              <p>Kami menggunakan data Anda semata-mata untuk:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Menyediakan layanan pengingat jadwal obat.</li>
                <li>Mengelola inventaris obat pribadi Anda.</li>
                <li>Menyimpan riwayat jurnal refleksi diri Anda.</li>
                <li>Mengirimkan notifikasi (jika diizinkan).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Keamanan Data</h2>
              <p>
                Kami menerapkan langkah-langkah keamanan standar industri untuk melindungi data Anda dari akses yang tidak sah. Data sensitif Anda disimpan dengan aman di database kami.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Hubungi Kami</h2>
              <p>
                Jika Anda memiliki pertanyaan tentang kebijakan ini, silakan hubungi kami di <a href="mailto:support@farmahelps.com" className="text-blue-600 hover:underline">support@farmahelps.com</a>.
              </p>
            </section>
          </div>
        </div>

        <footer className="mt-12 text-center text-slate-500 text-sm">
          &copy; 2026 FarmaHelps. All rights reserved.
        </footer>
      </main>
    </div>
  );
};