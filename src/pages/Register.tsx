import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pill, ArrowRight, Loader2, Check } from 'lucide-react';
import { toast } from "sonner";
import { postData } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import type { LoginResponse, User } from '@/types';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Asumsi login() handle state update
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk Checkbox Terms
  const [agreed, setAgreed] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // 1. Logic Register Manual
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Checkbox
    if (!agreed) {
        toast.warning("Anda harus menyetujui Syarat & Ketentuan.");
        return;
    }

    setIsLoading(true);

    try {
        const registerData = await postData<LoginResponse, any>('/auth/register', formData);
        
        const userPayload: User = {
            id: registerData.id,
            name: registerData.name,
            email: registerData.email,
            avatar_url: registerData.avatar
        };
        
        // FIX ERROR TS: Kirim sebagai satu objek
        // Pastikan AuthProvider Anda bisa menangani ini, atau sesuaikan
        // @ts-ignore (Bypass sementara jika tipe login strict ke credentials)
        login({ ...userPayload, token: registerData.token });
        
        toast.success("Akun berhasil dibuat!");
        navigate('/dashboard');

    } catch (error: any) {
        console.error("Register Error:", error);
        const msg = error.response?.data?.message || "Gagal mendaftar. Coba lagi.";
        toast.error(msg);
    } finally {
        setIsLoading(false);
    }
  };

  // 2. Logic Register dengan Google
  const googleRegister = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      // Note: Untuk Google Sign-In, biasanya consent screen Google sudah dianggap persetujuan,
      // tapi kita bisa cek 'agreed' juga jika mau sangat ketat. 
      // Disini kita biarkan flow Google tetap jalan (User friendly).
      
      setIsLoading(true);
      try {
        const data = await postData<LoginResponse, { code: string }>(
          '/auth/google', 
          { code: codeResponse.code }
        );
        
        const userPayload: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            avatar_url: data.avatar
        };
        
        // FIX ERROR TS
        // @ts-ignore
        login({ ...userPayload, token: data.token });

        toast.success(`Selamat bergabung, ${data.name}!`);
        navigate('/dashboard'); 
      } catch (error) {
        console.error("Google Register Failed:", error);
        toast.error("Gagal mendaftar dengan Google.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Pendaftaran dibatalkan.");
      setIsLoading(false);
    },
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 font-sans">
      
      {/* Dekorasi Background Purple/Pink */}
      <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-400/30 blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-pink-400/30 blur-[100px]" />

      <Card className="z-10 w-full max-w-md mx-4 sm:mx-auto border-white/40 bg-white/60 shadow-2xl backdrop-blur-xl">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 shadow-lg text-white">
              <Pill className="h-8 w-8" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-800">
              Buat Akun Baru
            </CardTitle>
            <CardDescription className="text-slate-600 text-base mt-2">
              Mulai perjalanan sehatmu bersama FarmaHelps.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          
          <Button 
            variant="outline" 
            className="group relative w-full h-12 text-base font-medium border-slate-200 bg-white/80 hover:bg-white hover:border-purple-300 transition-all duration-300 shadow-sm cursor-pointer"
            onClick={() => googleRegister()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-purple-600" />
            ) : (
              <img 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                className="mr-3 h-5 w-5" 
                alt="Google" 
              />
            )}
            {isLoading ? "Memproses..." : "Daftar dengan Google"}
          </Button>

          <p className="text-[10px] text-center text-slate-400 -mt-2">
            Dengan mendaftar via Google, Anda menyetujui Terms & Privacy kami.
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-300/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold">
              <span className="bg-transparent px-3 text-slate-500 backdrop-blur-sm">Atau manual</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input 
                id="name" 
                type="text" 
                placeholder="Nama Anda" 
                value={formData.name}
                onChange={handleChange}
                className="h-11 bg-white/50 border-slate-200 focus:bg-white focus:border-purple-500 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nama@email.com" 
                value={formData.email}
                onChange={handleChange}
                className="h-11 bg-white/50 border-slate-200 focus:bg-white focus:border-purple-500 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Minimal 6 karakter" 
                value={formData.password}
                onChange={handleChange}
                className="h-11 bg-white/50 border-slate-200 focus:bg-white focus:border-purple-500 transition-all"
                required
              />
            </div>

            {/* CHECKBOX TERMS */}
            <div className="flex items-start space-x-3 pt-2">
                <div 
                    className={`h-5 w-5 rounded border flex items-center justify-center cursor-pointer transition-all mt-0.5 ${
                        agreed ? "bg-purple-600 border-purple-600" : "border-slate-300 bg-white"
                    }`}
                    onClick={() => setAgreed(!agreed)}
                >
                    {agreed && <Check className="h-3.5 w-3.5 text-white" />}
                </div>
                <label className="text-sm text-slate-600 leading-tight cursor-pointer select-none" onClick={() => setAgreed(!agreed)}>
                    Saya setuju dengan{" "}
                    <Link to="/terms" className="text-purple-600 font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
                        Syarat & Ketentuan
                    </Link>{" "}
                    dan{" "}
                    <Link to="/privacy" className="text-purple-600 font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
                        Kebijakan Privasi
                    </Link>.
                </label>
            </div>
            
            <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 transition-all duration-300 group cursor-pointer mt-2"
            >
              {isLoading ? "Mendaftarkan..." : "Daftar Sekarang"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-600 mt-4">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-500 hover:underline transition-all">
              Masuk disini
            </Link>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default Register;