import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { PushNotificationProvider } from '@/context/PushNotificationContext';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

// Scroll ke atas setiap kali pindah halaman
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- Import Halaman ---
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import { Inventory } from '@/pages/Inventory';
import { SchedulePage } from '@/pages/SchedulePage';
import { Journaling } from '@/pages/Journaling'; 
import { DetailJournal } from '@/components/features/Journal/DetailJournal'; 

// --- Import Halaman Publik Baru ---
import { LandingPage } from '@/pages/LandingPage';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { TermsOfService } from '@/pages/TermsOfService';

// --- Komponen Protected Route (Halaman Khusus Member) ---
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// --- Komponen Public Route (Halaman Auth - Login/Register) ---
// Redirect ke dashboard jika sudah login
const PublicAuthRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// --- Komponen Utama AppRoutes ---
function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ================= PUBLIC PAGES (Bebas Akses) ================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* ================= AUTH PAGES (Redirect if Logged In) ================= */}
        <Route 
          path="/login" 
          element={
            <PublicAuthRoute>
              <Login />
            </PublicAuthRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicAuthRoute>
              <Register />
            </PublicAuthRoute>
          } 
        />

        {/* ================= PROTECTED ROUTES ================= */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/inventory" 
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/schedule" 
          element={
            <ProtectedRoute>
              <SchedulePage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/journal" 
          element={
            <ProtectedRoute>
              <Journaling />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/journal/:slug" 
          element={
            <ProtectedRoute>
              <DetailJournal />
            </ProtectedRoute>
          } 
        />

        {/* ================= DEFAULT ROUTES ================= */}
        {/* Jika route tidak dikenal, redirect ke Landing Page (atau Dashboard jika login) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <Toaster 
        position="top-center" 
        richColors 
        duration={3000}    
        closeButton        
      />
    </>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <PushNotificationProvider>
            <AppRoutes />
          </PushNotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;