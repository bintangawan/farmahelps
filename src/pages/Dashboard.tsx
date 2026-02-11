import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pill, AlertTriangle, CalendarCheck, Loader2, BellRing, Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ScheduleList } from "@/components/features/schedule/ScheduleList";
import api, { getData } from "@/services/api"; 
import { toast } from "sonner";

// Import Recharts
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

// --- Tipe Data ---
interface ChartData {
    date: string;     // "Mon"
    fullDate: string; // "2023-10-25"
    taken: number;
    target: number;
}

interface DashboardData {
    total_medicines: number;
    attention_needed: number;
    active_schedules: number;
    today_schedules: {
        id: number;
        medicine_name: string;
        time: string;
    }[];
    chart_data: ChartData[];
}

// --- Helper VAPID ---
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// --- KOMPONEN CUSTOM TICK UTK SUMBU X ---
// Ini yang bikin teks ada 2 baris (Hari & Jumlah)
const CustomXAxisTick = ({ x, y, payload, chartData }: any) => {
    // Cari data yang cocok dengan label hari ini (payload.value = "Mon", "Tue", dll)
    const dataEntry = chartData.find((d: ChartData) => d.date === payload.value);
    
    // Default 0 jika data tidak ditemukan (safety)
    const taken = dataEntry ? dataEntry.taken : 0;
    const target = dataEntry ? dataEntry.target : 0;

    // Warna teks angka: Hijau jika target tercapai, Abu jika belum
    const isComplete = taken >= target && target > 0;
    const textColor = isComplete ? "#10b981" : "#94a3b8"; 

    return (
        <g transform={`translate(${x},${y})`}>
            {/* Baris 1: Nama Hari */}
            <text x={0} y={0} dy={16} textAnchor="middle" fill="#475569" fontSize={12} fontWeight="bold">
                {payload.value}
            </text>
            {/* Baris 2: Jumlah (Taken / Target) */}
            <text x={0} y={0} dy={32} textAnchor="middle" fill={textColor} fontSize={11} fontWeight="500">
                {taken} / {target}
            </text>
        </g>
    );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
        try {
            const result = await getData<DashboardData>('/medicines/dashboard-stats');
            setData(result);
        } catch (error) {
            console.error("Dashboard Error:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchDashboard();
  }, []);

  // Logic Notifikasi & SW
  useEffect(() => {
    const checkAndResubscribe = async () => {
        if (!('serviceWorker' in navigator) || !('Notification' in window)) return;
        const permission = Notification.permission;
        if (permission === 'default') {
            const timer = setTimeout(() => setShowNotifModal(true), 1500);
            return () => clearTimeout(timer);
        } 
        if (permission === 'granted') {
            try {
                const register = await navigator.serviceWorker.ready;
                let subscription = await register.pushManager.getSubscription();
                if (!subscription) {
                    subscription = await register.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
                    });
                }
                await api.post('/notifications/subscribe', subscription);
            } catch (error) {
                console.error("Gagal sinkronisasi notifikasi:", error);
            }
        }
    };
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(() => checkAndResubscribe());
    }
  }, []);

  const handleEnableNotification = async () => {
    setIsSubscribing(true);
    try {
        const register = await navigator.serviceWorker.register('/sw.js');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            toast.error("Izin notifikasi ditolak.");
            setShowNotifModal(false);
            return;
        }
        const subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
        });
        await api.post('/notifications/subscribe', subscription);
        toast.success("Notifikasi aktif!");
        setShowNotifModal(false);
    } catch (error) {
        toast.error("Gagal aktifkan notifikasi.");
    } finally {
        setIsSubscribing(false);
    }
  };

  const stats = [
    { title: "Total Obat", value: data?.total_medicines || 0, icon: Pill, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Perlu Perhatian", value: data?.attention_needed || 0, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
    { title: "Jadwal Aktif", value: data?.active_schedules || 0, icon: CalendarCheck, color: "text-teal-600", bg: "bg-teal-100" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-teal-400/20 blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Halo, {user?.name}! 👋</h1>
          <p className="text-slate-600 mt-2">Berikut ringkasan apotek pribadi Anda hari ini.</p>
        </div>

        {loading ? (
            <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        ) : (
            <>
                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-3 mb-8">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-white/40 bg-white/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                        <div className={`p-2 rounded-lg ${stat.bg}`}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                    </CardContent>
                    </Card>
                ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                
                {/* --- GRAFIK KEPATUHAN (RECHARTS) --- */}
                <Card className="border-white/40 bg-white/60 backdrop-blur-xl shadow-sm h-full min-h-[350px]">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            Kepatuhan 7 Hari Terakhir
                        </CardTitle>
                        <CardDescription>Grafik jumlah obat yang diminum vs jadwal.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full pt-2">
                        {data?.chart_data && data.chart_data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={data.chart_data} 
                                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }} // Tambah margin bottom biar teks muat
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    
                                    {/* X AXIS YANG DIMODIFIKASI */}
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        interval={0} 
                                        height={60} // Tinggi axis diperbesar utk 2 baris teks
                                        // Gunakan custom tick component, kirim data chart untuk akses 'target'
                                        tick={(props) => <CustomXAxisTick {...props} chartData={data.chart_data} />}
                                    />
                                    
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 12 }} 
                                        allowDecimals={false}
                                    />
                                    
                                    <Tooltip 
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        // Custom Tooltip Label
                                        labelFormatter={(label) => `Hari: ${label}`}
                                        formatter={(value: any, name: any, item: any) => {
                                            // Tampilkan target juga di tooltip
                                            if (name === "Obat Diminum") {
                                                return [`${value} dari ${item.payload.target} Obat`, "Status"];
                                            }
                                            return [value, name];
                                        }}
                                    />
                                    
                                    <Bar dataKey="taken" name="Obat Diminum" radius={[6, 6, 0, 0]} barSize={35}>
                                        {data.chart_data.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                // Hijau jika tercapai, Biru jika belum
                                                fill={entry.taken >= entry.target && entry.target > 0 ? '#10b981' : '#3b82f6'} 
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <CalendarCheck className="h-10 w-10 mb-2 opacity-50" />
                                <p>Belum ada data kepatuhan</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                
                {/* List Jadwal Hari Ini */}
                <Card className="border-white/40 bg-white/60 backdrop-blur-xl shadow-sm h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-800">Jadwal Hari Ini</CardTitle>
                        <CardDescription>Obat yang perlu diminum hari ini.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto max-h-[300px] pr-2">
                        <ScheduleList schedules={data?.today_schedules || []} />
                    </CardContent>
                </Card>
                </div>
            </>
        )}
      </main>

      {/* Modal Notifikasi */}
      <Dialog open={showNotifModal} onOpenChange={setShowNotifModal}>
        <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl border-white/50">
            <DialogHeader>
                <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-2">
                    <BellRing className="h-6 w-6 text-blue-600" />
                </div>
                <DialogTitle className="text-center text-xl">Aktifkan Notifikasi?</DialogTitle>
                <DialogDescription className="text-center pt-2">
                    Agar Anda tidak lupa jadwal minum obat, izinkan kami mengirimkan notifikasi langsung ke perangkat ini.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center mt-4">
                <Button variant="outline" onClick={() => setShowNotifModal(false)} className="w-full sm:w-auto">
                    Nanti Saja
                </Button>
                <Button onClick={handleEnableNotification} disabled={isSubscribing} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                    {isSubscribing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengaktifkan...</> : "Ya, Aktifkan"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;