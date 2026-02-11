// Re-export tipe response
export * from './api-response';

// Definisi User
export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  google_id?: string;
}

// Definisi Obat (Medicine)
export interface Medicine {
  id: number;
  user_id: number;
  name: string;
  description?: string;   // Baru
  medicine_type?: string; // Baru
  indication?: string;    // Baru
  stock: number;
  unit: string;
  expired_date: string;
  is_opened: boolean;
  opened_at?: string | null;
  bud_days?: number | null;
}

// Definisi Jadwal (Schedule)
export interface Schedule {
  id: number;
  medicine_id: number;
  medicine_name?: string;
  user_id: number;
  time: string;
  days: string | string[];
  is_active: boolean | number;
  start_date: string; // Add this
  end_date: string;   // Add this
  is_taken?: boolean;
}

// Tipe untuk Journal Interface
export interface Journal {
  id: number;
  user_id: number;
  title: string;
  slug: string; // <--- Tambahkan ini
  content: string;
  mood: string;
  created_at: string;
}

// Tipe untuk Login Response
export interface LoginResponse {
  token: string;
  id: number;
  name: string;
  email: string;
  avatar?: string;
}