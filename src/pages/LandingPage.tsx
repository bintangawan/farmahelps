import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Pill, 
  CalendarCheck, 
  BookOpen, 
  ShieldCheck, 
  ArrowRight, 
  LayoutDashboard, 
  CheckCircle2, 
  Bell, 
  Activity,
  Menu
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

export const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Efek Scroll untuk Navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans selection:bg-blue-100 overflow-x-hidden">
      
      {/* --- BACKGROUND ACCENTS --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute top-[40%] left-[-10%] h-[500px] w-[500px] rounded-full bg-teal-400/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[20%] h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 shadow-sm" : "bg-transparent py-6"
      }`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="bg-gradient-to-br from-blue-600 to-teal-500 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <Pill className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">FarmaHelps</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Fitur</a>
            <a href="#benefits" className="hover:text-blue-600 transition-colors">Manfaat</a>
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Button onClick={() => navigate("/dashboard")} className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 transition-all hover:shadow-lg">
                <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")} className="hidden sm:flex text-slate-600 hover:text-slate-900 font-semibold">
                  Masuk
                </Button>
                <Button onClick={() => navigate("/register")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-lg shadow-blue-200 transition-transform hover:scale-105">
                  Daftar Gratis
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Text Content */}
            <div className="lg:w-1/2 text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-700">
                <ShieldCheck className="h-3.5 w-3.5" /> 
                Aman & Terpercaya
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                Kesehatan Anda, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500">
                  Prioritas Utama.
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                Jangan biarkan kesibukan membuat Anda lupa minum obat. FarmaHelps hadir sebagai asisten pribadi untuk mengatur jadwal obat, stok, dan jurnal kesehatan Anda.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                <Button 
                  size="lg" 
                  onClick={() => navigate(user ? "/dashboard" : "/register")}
                  className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 w-full sm:w-auto"
                >
                  Mulai Sekarang <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Gratis selamanya
                </div>
              </div>
            </div>

            {/* Visual Abstract Mockup (CSS Only) */}
            <div className="lg:w-1/2 w-full relative animate-in fade-in zoom-in duration-1000 delay-300">
              <div className="relative mx-auto w-full max-w-[500px] aspect-square lg:aspect-[4/3]">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-teal-50 rounded-full blur-3xl opacity-60 animate-pulse" />
                
                {/* Main Card (Glassmorphism) */}
                <div className="absolute inset-4 bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-slate-200/50 p-6 flex flex-col gap-4 transform transition-transform hover:-rotate-1 hover:scale-[1.02] duration-500">
                  
                  {/* Fake Header */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-8 w-32 bg-white/60 rounded-lg" />
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bell className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>

                  {/* Fake Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 p-4 rounded-2xl h-24" />
                    <div className="bg-white/60 p-4 rounded-2xl h-24" />
                  </div>

                  {/* Fake List */}
                  <div className="bg-white/70 rounded-2xl flex-1 p-4 space-y-3">
                    <div className="h-4 w-24 bg-slate-200/50 rounded" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                            <div className="h-10 w-10 bg-teal-50 rounded-lg flex items-center justify-center">
                                <Pill className="h-5 w-5 text-teal-500" />
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <div className="h-3 w-20 bg-slate-200 rounded" />
                                <div className="h-2 w-12 bg-slate-100 rounded" />
                            </div>
                            <div className="h-6 w-12 bg-blue-500 rounded-full" />
                        </div>
                    ))}
                  </div>
                </div>

                {/* Floating Card */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 flex items-center gap-4 animate-bounce duration-[3000ms]">
                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-800">Obat Diminum</p>
                        <p className="text-xs text-slate-500">Tepat waktu 08:00 WIB</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-24 bg-white relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Fitur Unggulan</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">Semua yang Anda butuhkan</h3>
            <p className="text-slate-600 mt-4">Kami menyediakan alat lengkap untuk membantu manajemen pengobatan Anda sehari-hari.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Pill,
                color: "text-blue-600 bg-blue-50",
                title: "Inventory Obat",
                desc: "Kelola stok, tanggal kadaluarsa, dan masa simpan (BUD) agar obat selalu aman dikonsumsi."
              },
              {
                icon: Bell,
                color: "text-teal-600 bg-teal-50",
                title: "Pengingat Pintar",
                desc: "Notifikasi Web Push dan Email yang memastikan Anda tidak pernah melewatkan dosis obat."
              },
              {
                icon: BookOpen,
                color: "text-purple-600 bg-purple-50",
                title: "Jurnal Kesehatan",
                desc: "Catat keluhan, efek samping, dan perkembangan kesehatan harian untuk konsultasi dokter."
              },
              {
                icon: Activity,
                color: "text-red-600 bg-red-50",
                title: "Analitik Kepatuhan",
                desc: "Pantau grafik kedisiplinan minum obat Anda dalam 7 hari terakhir."
              },
              {
                icon: ShieldCheck,
                color: "text-indigo-600 bg-indigo-50",
                title: "Data Aman",
                desc: "Privasi Anda prioritas kami. Data tersimpan aman dan hanya dapat diakses oleh Anda."
              },
              {
                icon: CalendarCheck,
                color: "text-orange-600 bg-orange-50",
                title: "Jadwal Fleksibel",
                desc: "Atur frekuensi minum obat (1x, 3x, dll) dengan mudah dan antarmuka yang intuitif."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.color}`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] p-12 md:p-20 text-center shadow-2xl shadow-blue-900/20 text-white relative overflow-hidden">
            {/* Decor Circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                Siap untuk hidup lebih sehat dan teratur?
              </h2>
              <p className="text-blue-100 text-lg md:text-xl">
                Bergabunglah sekarang dan rasakan kemudahan mengelola kesehatan Anda secara gratis.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate("/register")}
                className="h-14 px-10 text-blue-700 bg-white hover:bg-blue-50 text-lg font-bold rounded-full shadow-lg transition-transform hover:scale-105"
              >
                Buat Akun Gratis
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-slate-900 p-2 rounded-lg text-white">
                  <Pill className="h-5 w-5" />
                </div>
                <span className="font-bold text-xl text-slate-900">FarmaHelps</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Platform manajemen kesehatan pribadi yang membantu Anda tetap patuh pada jadwal pengobatan.
              </p>
            </div>
            
            <div className="flex gap-12 text-sm">
              <div className="space-y-4">
                <h5 className="font-bold text-slate-900">Produk</h5>
                <ul className="space-y-2 text-slate-600">
                  <li><a href="#features" className="hover:text-blue-600">Fitur</a></li>
                  <li><Link to="/register" className="hover:text-blue-600">Daftar</Link></li>
                  <li><Link to="/login" className="hover:text-blue-600">Masuk</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="font-bold text-slate-900">Legal</h5>
                <ul className="space-y-2 text-slate-600">
                  <li><Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>&copy; {new Date().getFullYear()} FarmaHelps. All rights reserved.</p>
            <div className="flex gap-4">
                <span>Dibuat dengan ❤️ untuk kesehatan Indonesia.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};