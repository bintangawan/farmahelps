import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pill, Loader2, ArrowRight } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth'; 

const Login = () => {
  const { login, googleLogin: authGoogleLogin } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if(!email || !password) {
        toast.warning("Mohon isi email dan password.");
        return;
    }

    setIsLoading(true);
    try {
        await login({ email, password });
        navigate('/dashboard');
    } catch (error: any) {
        const msg = error.response?.data?.message || "Email atau password salah.";
        toast.error(msg);
    } finally {
        setIsLoading(false);
    }
  };

  const googleLoginHandler = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      setIsLoading(true);
      try {
        await authGoogleLogin(codeResponse.code);
        navigate('/dashboard'); 
      } catch (error) {
        // Error handled in useAuth
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Login dibatalkan.");
      setIsLoading(false);
    },
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 font-sans">
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-400/30 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-teal-400/30 blur-[100px]" />

      <Card className="z-10 w-full max-w-md border-white/40 bg-white/60 shadow-2xl backdrop-blur-xl">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 shadow-lg text-white">
              <Pill className="h-8 w-8" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-800">
              FarmaHelps
            </CardTitle>
            <CardDescription className="text-slate-600 text-base mt-2">
              Masuk untuk mengelola jadwal obat Anda.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          
          <Button 
            variant="outline" 
            className="group relative w-full h-12 text-base font-medium border-slate-200 bg-white/80 hover:bg-white hover:border-blue-300 transition-all duration-300 shadow-sm"
            onClick={() => googleLoginHandler()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
            ) : (
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="mr-3 h-5 w-5" alt="Google" />
            )}
            Masuk dengan Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-300/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold">
              <span className="bg-transparent px-3 text-slate-500 backdrop-blur-sm">Atau manual</span>
            </div>
          </div>

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nama@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-white/50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-white/50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all"
                required
              />
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full h-11 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 group cursor-pointer">
              {isLoading ? "Memproses..." : "Masuk Sekarang"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-600 mt-4">
            Belum punya akun?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-all">
              Daftar disini
            </Link>
          </div>

          {/* Link Privacy & Terms */}
          <p className="text-center text-xs text-slate-400 mt-6 px-4 leading-relaxed">
            Dengan masuk, Anda menyetujui{" "}
            <Link to="/terms" className="underline hover:text-blue-600">Terms of Service</Link>
            {" "}dan{" "}
            <Link to="/privacy" className="underline hover:text-blue-600">Privacy Policy</Link>
            {" "}FarmaHelps.
          </p>

        </CardContent>
      </Card>
      
      <div className="absolute bottom-6 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} FarmaHelps Inc.
      </div>
    </div>
  );
};

export default Login;