import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Pill,
  AlertTriangle,
  CalendarCheck,
  Loader2,
  Activity,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePushNotification } from "@/context/PushNotificationContext";
import { ScheduleList } from "@/components/features/schedule/ScheduleList";
import { getData } from "@/services/api";

// Import Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// --- Tipe Data ---
interface ChartData {
  date: string; // "Mon"
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
    is_taken: boolean;
    taken_at: string | null;
  }[];
  chart_data: ChartData[];
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
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill="#475569"
        fontSize={12}
        fontWeight="bold"
      >
        {payload.value}
      </text>
      {/* Baris 2: Jumlah (Taken / Target) */}
      <text
        x={0}
        y={0}
        dy={32}
        textAnchor="middle"
        fill={textColor}
        fontSize={11}
        fontWeight="500"
      >
        {taken} / {target}
      </text>
    </g>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { checkAndPrompt } = usePushNotification();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await getData<DashboardData>(
          "/medicines/dashboard-stats",
        );
        setData(result);
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Delay chart render sampai container punya dimensi (fix Recharts -1 error)
  useEffect(() => {
    if (!loading && data) {
      const timer = setTimeout(() => setChartReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  // Cek push notification saat masuk Dashboard (delay 1.5 detik agar halaman load dulu)
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAndPrompt();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      title: "Total Obat",
      value: data?.total_medicines || 0,
      icon: Pill,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Perlu Perhatian",
      value: data?.attention_needed || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      title: "Jadwal Aktif",
      value: data?.active_schedules || 0,
      icon: CalendarCheck,
      color: "text-teal-600",
      bg: "bg-teal-100",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-teal-400/20 blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Halo, {user?.name}! 👋
          </h1>
          <p className="text-slate-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Berikut ringkasan apotek pribadi Anda hari ini.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            {/* Stats Grid */}
            <div className="grid gap-3 sm:gap-6 grid-cols-3 mb-6 sm:mb-8">
              {stats.map((stat, i) => (
                <Card
                  key={i}
                  className="border-white/40 bg-white/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all"
                >
                  <CardHeader className="flex flex-row items-start justify-between pb-1 sm:pb-2 p-3 sm:p-6 gap-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 leading-tight break-words flex-1">
                      {stat.title}
                    </CardTitle>
                    <div
                      className={`p-1.5 sm:p-2 rounded-lg ${stat.bg} shrink-0`}
                    >
                      <stat.icon
                        className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${stat.color}`}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                    <div className="text-xl sm:text-2xl font-bold text-slate-800">
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {/* --- GRAFIK KEPATUHAN (RECHARTS) --- */}
              <Card className="border-white/40 bg-white/60 backdrop-blur-xl shadow-sm h-full min-h-[300px] sm:min-h-[350px]">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500 shrink-0" />
                    <span className="truncate">Kepatuhan 7 Hari Terakhir</span>
                  </CardTitle>
                  <CardDescription>
                    Grafik jumlah obat yang diminum vs jadwal.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] sm:h-[300px] w-full pt-2 px-2 sm:px-6">
                  {chartReady &&
                  data?.chart_data &&
                  data.chart_data.length > 0 ? (
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      minWidth={0}
                      minHeight={0}
                    >
                      <BarChart
                        data={data.chart_data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 20 }} // Tambah margin bottom biar teks muat
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e2e8f0"
                        />

                        {/* X AXIS YANG DIMODIFIKASI */}
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          interval={0}
                          height={60} // Tinggi axis diperbesar utk 2 baris teks
                          // Gunakan custom tick component, kirim data chart untuk akses 'target'
                          tick={(props) => (
                            <CustomXAxisTick
                              {...props}
                              chartData={data.chart_data}
                            />
                          )}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          allowDecimals={false}
                        />

                        <Tooltip
                          cursor={{ fill: "#f1f5f9" }}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                          // Custom Tooltip Label
                          labelFormatter={(label) => `Hari: ${label}`}
                          formatter={(value: any, name: any, item: any) => {
                            // Tampilkan target juga di tooltip
                            if (name === "Obat Diminum") {
                              return [
                                `${value} dari ${item.payload.target} Obat`,
                                "Status",
                              ];
                            }
                            return [value, name];
                          }}
                        />

                        <Bar
                          dataKey="taken"
                          name="Obat Diminum"
                          radius={[6, 6, 0, 0]}
                          barSize={35}
                        >
                          {data.chart_data.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              // Hijau jika tercapai, Biru jika belum
                              fill={
                                entry.taken >= entry.target && entry.target > 0
                                  ? "#10b981"
                                  : "#3b82f6"
                              }
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
                  <CardTitle className="text-lg font-bold text-slate-800">
                    Jadwal Hari Ini
                  </CardTitle>
                  <CardDescription>
                    Obat yang perlu diminum hari ini.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto max-h-[300px] pr-2">
                  <ScheduleList schedules={data?.today_schedules || []} />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
