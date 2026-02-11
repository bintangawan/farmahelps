import { createContext, useContext, useState, useEffect } from 'react';
// Import 'type' untuk ReactNode agar aman di TypeScript terbaru
import type { ReactNode } from 'react'; 
import api from '@/services/api'; 
import { toast } from 'sonner';

// Import tipe dari index.ts
import type { User, LoginResponse } from '@/types'; 

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (credentials: any) => Promise<void>;
  googleLogin: (code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Cek Login Saat Aplikasi Dimulai
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Gagal memuat sesi user", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // 2. Login Manual
  const login = async (credentials: any) => {
    try {
      const response = await api.post<{ data: LoginResponse }>('/auth/login', credentials);
      const { token, ...userData } = response.data.data;

      const userToStore: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar_url: userData.avatar
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userToStore));
      setUser(userToStore);
      
      toast.success(`Selamat datang kembali, ${userData.name}!`);
    } catch (error: any) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  // 3. Register
  const register = async (credentials: any) => {
    try {
      const response = await api.post<{ data: LoginResponse }>('/auth/register', credentials);
      const { token, ...userData } = response.data.data;

      const userToStore: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar_url: userData.avatar
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userToStore));
      setUser(userToStore);
      
      toast.success("Akun berhasil dibuat!");
    } catch (error: any) {
      console.error("Register Error:", error);
      throw error;
    }
  };

  // 4. Google Login
  const googleLogin = async (code: string) => {
    try {
      const response = await api.post<{ data: LoginResponse }>('/auth/google', { code });
      const { token, ...userData } = response.data.data;

      const userToStore: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar_url: userData.avatar
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userToStore));
      setUser(userToStore);
      
      toast.success("Login Google berhasil!");
    } catch (error: any) {
      console.error("Google Login Error:", error);
      throw error;
    }
  };

  // 5. Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    api.post('/auth/logout').catch(err => console.error("Logout log error:", err));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};