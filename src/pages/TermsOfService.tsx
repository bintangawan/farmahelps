import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pill } from "lucide-react";

export const TermsOfService = () => {
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
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-slate-500 mb-8">Terakhir diperbarui: 11 Februari 2026</p>

          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Penerimaan Syarat</h2>
              <p>
                Dengan mengakses atau menggunakan aplikasi FarmaHelps, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju, mohon untuk tidak menggunakan layanan kami.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Penggunaan Layanan</h2>
              <p>Anda setuju untuk menggunakan aplikasi ini hanya untuk tujuan pribadi dan non-komersial, yaitu pengelolaan jadwal obat dan kesehatan pribadi. Anda dilarang menyalahgunakan layanan untuk tindakan ilegal.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Akun Pengguna</h2>
              <p>
                Untuk mengakses fitur tertentu, Anda perlu mendaftar menggunakan akun Google. Anda bertanggung jawab untuk menjaga kerahasiaan akun Anda dan semua aktivitas yang terjadi di dalamnya.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Penafian Medis (Medical Disclaimer)</h2>
              <p className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500 text-red-900">
                <strong>PENTING:</strong> FarmaHelps adalah alat bantu manajemen, BUKAN pengganti saran medis profesional. Selalu konsultasikan dengan dokter atau apoteker mengenai dosis dan penggunaan obat Anda. Kami tidak bertanggung jawab atas kesalahan penggunaan obat.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Perubahan Layanan</h2>
              <p>
                Kami berhak untuk mengubah, menangguhkan, atau menghentikan layanan kapan saja dengan atau tanpa pemberitahuan sebelumnya.
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