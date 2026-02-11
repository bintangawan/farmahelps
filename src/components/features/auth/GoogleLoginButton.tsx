import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; 

export const GoogleLoginButton = () => {
  // 1. Ambil fungsi 'googleLogin' dari useAuth
  // Kita rename jadi 'authGoogleLogin' biar gak bentrok sama variabel di bawah
  const { googleLogin: authGoogleLogin } = useAuth();
  
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      setIsLoading(true);
      try {
        // 2. GUNAKAN FUNGSI DARI USEAUTH
        // Fungsi ini sudah handle: postData ke backend, simpan localStorage, dan set User State
        await authGoogleLogin(codeResponse.code);
        
        navigate('/dashboard');
      } catch (error) {
        console.error('Google Login Error:', error);
        // Error handling tambahan jika perlu (toast biasanya sudah ada di useAuth)
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      console.error('Google Login Failed');
      setIsLoading(false);
    },
  });

  return (
    <Button
      variant="outline"
      className="w-full py-6 text-md font-medium flex items-center gap-3 hover:bg-slate-50 transition-colors"
      onClick={() => googleLogin()}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          className="w-5 h-5"
          alt="Google"
        />
      )}
      {isLoading ? 'Sedang masuk...' : 'Masuk dengan Google'}
    </Button>
  );
};