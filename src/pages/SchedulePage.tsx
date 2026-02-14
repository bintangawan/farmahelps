import { useEffect, useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AddScheduleModal } from "@/components/features/schedule/AddScheduleModal";
import { Card, CardContent } from "@/components/ui/card"; // Used
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CalendarDays, 
  Trash2, 
  Bell, 
  Loader2, 
  CalendarX, 
  CalendarRange, 
  CheckCircle2, 
  Circle,
  Pill,
  ChevronDown, // Used
  ChevronUp    // Used
} from "lucide-react";
import { toast } from "sonner";
import api, { getData } from "@/services/api"; 
import type { Schedule } from "@/types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Helper map hari
const DAY_MAP: Record<string, string> = {
  "Mon": "Sen", "Tue": "Sel", "Wed": "Rab", "Thu": "Kam", "Fri": "Jum", "Sat": "Sab", "Sun": "Min"
};

// Interface baru untuk Grouped Schedule
interface GroupedSchedule {
  medicine_id: number;
  medicine_name: string;
  medicine_unit: string;
  schedules: Schedule[];
  is_active: boolean; 
  days: string | string[]; 
  start_date: string;
  end_date: string;
}

export const SchedulePage = () => {
  const [rawSchedules, setRawSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk accordion (Menyimpan ID medicine yang sedang dibuka)
  const [expandedCard, setExpandedCard] = useState<number | null>(null); 

  // --- 1. Fetch Data ---
  const fetchSchedules = async () => {
    try {
      const data = await getData<Schedule[]>('/schedules');
      setRawSchedules(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat jadwal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // --- 2. Grouping Logic ---
  const groupedSchedules = useMemo(() => {
    const groups: Record<number, GroupedSchedule> = {};

    rawSchedules.forEach((sch) => {
      if (!groups[sch.medicine_id]) {
        groups[sch.medicine_id] = {
          medicine_id: sch.medicine_id,
          medicine_name: sch.medicine_name || "Obat Tanpa Nama",
          medicine_unit: "Tablet",
          schedules: [],
          is_active: Boolean(sch.is_active),
          days: sch.days,
          start_date: sch.start_date,
          end_date: sch.end_date
        };
      }
      groups[sch.medicine_id].schedules.push(sch);
    });

    return Object.values(groups);
  }, [rawSchedules]);

  // --- 3. Actions ---
  
  // Toggle Expand/Collapse Card
  const toggleDetails = (medicineId: number) => {
    setExpandedCard(prev => prev === medicineId ? null : medicineId);
  };

  const handleToggleGroup = async (medicineId: number, currentStatus: boolean, schedules: Schedule[]) => {
    setRawSchedules(prev => prev.map(s => s.medicine_id === medicineId ? { ...s, is_active: !currentStatus } : s));
    try {
      await Promise.all(schedules.map(s => api.put(`/schedules/${s.id}/toggle`)));
      toast.success(currentStatus ? "Pengingat dimatikan" : "Pengingat diaktifkan");
    } catch (error) {
      toast.error("Gagal update status.");
      fetchSchedules();
    }
  };

  const handleTakeMedicine = async (scheduleId: number) => {
    try {
      setRawSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, is_taken: true } : s));
      await api.post(`/schedules/${scheduleId}/take`);
      toast.success("Obat diminum! 💊");
    } catch (error) {
      toast.error("Gagal mencatat.");
      fetchSchedules();
    }
  };

  const handleSmartTake = async (schedules: Schedule[]) => {
    const nextSchedule = schedules.find(s => !s.is_taken);
    if (nextSchedule) {
      handleTakeMedicine(nextSchedule.id);
    } else {
      toast.info("Semua jadwal hari ini sudah selesai! 🎉");
    }
  };

  const handleDeleteGroup = async (medicineId: number, schedules: Schedule[]) => {
    if (!confirm("Hapus semua jadwal untuk obat ini?")) return;
    try {
      await Promise.all(schedules.map(s => api.delete(`/schedules/${s.id}`)));
      setRawSchedules(prev => prev.filter(s => s.medicine_id !== medicineId));
      toast.success("Jadwal dihapus.");
    } catch (error) {
      toast.error("Gagal menghapus.");
    }
  };

  // Helper UI
  const renderDays = (days: string | string[]) => {
    let parsedDays: string[] = [];
    if (typeof days === 'string') {
        try { parsedDays = JSON.parse(days); } catch { parsedDays = []; }
    } else {
        parsedDays = days;
    }
    if (parsedDays.length === 7) return "Setiap Hari";
    return parsedDays.map(d => DAY_MAP[d] || d).join(", ");
  };

  const renderDateRange = (start: string, end: string) => {
    if (!start || !end) return "-";
    return `${format(new Date(start), "d MMM", { locale: idLocale })} - ${format(new Date(end), "d MMM yyyy", { locale: idLocale })}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[20%] h-[600px] w-[600px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[20%] h-[600px] w-[600px] rounded-full bg-teal-400/20 blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Jadwal Pengingat</h1>
            <p className="text-slate-600 text-sm">Kelola kapan Anda menerima notifikasi minum obat.</p>
          </div>
          <AddScheduleModal onSuccess={fetchSchedules} />
        </div>

        {/* Content */}
        {loading ? (
           <div className="flex justify-center py-20">
             <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
           </div>
        ) : groupedSchedules.length > 0 ? (
          <div className="grid gap-4">
            {groupedSchedules.map((group) => {
                // Logic Status
                const allTaken = group.schedules.every(s => s.is_taken);
                const nextToTake = group.schedules.find(s => !s.is_taken);
                const isExpanded = expandedCard === group.medicine_id;
                
                return (
                  <Card 
                    key={group.medicine_id} 
                    className={`border transition-all duration-300 hover:shadow-md backdrop-blur-sm overflow-hidden ${
                        allTaken 
                            ? 'bg-green-50/60 border-green-200' 
                            : 'bg-white/80 border-slate-200'
                    }`}
                  >
                    {/* --- CARD HEADER (Ringkasan) --- */}
                    <div 
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                        onClick={() => toggleDetails(group.medicine_id)}
                    >
                        <div className="flex gap-4 items-center">
                            {/* Icon Obat */}
                            <div className={`p-3 rounded-2xl shrink-0 ${allTaken ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                {allTaken ? <CheckCircle2 className="h-6 w-6" /> : <Pill className="h-6 w-6" />}
                            </div>
                            
                            {/* Info Utama */}
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                    {group.medicine_name}
                                    {allTaken && <Badge className="bg-green-500 hover:bg-green-600 text-[10px] h-5">Selesai Hari Ini</Badge>}
                                </h3>
                                
                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{group.schedules.length}x Sehari</span>
                                    </div>
                                    {!allTaken && nextToTake && (
                                        <span className="text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full text-xs">
                                            Selanjutnya: {nextToTake.time}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Controls (Switch & Chevron) */}
                        <div className="flex items-center gap-4 ml-auto sm:ml-0" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Status</span>
                                <Switch 
                                    checked={group.is_active}
                                    disabled={allTaken}
                                    onCheckedChange={() => handleToggleGroup(group.medicine_id, group.is_active, group.schedules)}
                                />
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                                onClick={() => toggleDetails(group.medicine_id)}
                            >
                                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>

                    {/* --- CARD CONTENT (Detail yang bisa di-expand) --- */}
                    {isExpanded && (
                        <CardContent className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-200">
                            {/* Garis Pemisah */}
                            <div className="h-px bg-slate-100 mb-4" />

                            {/* Info Tanggal Lengkap */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-blue-500 shrink-0" />
                                    <span className="text-xs sm:text-sm">{renderDays(group.days)}</span>
                                </div>
                                <div className="hidden sm:block w-px h-4 bg-slate-300" />
                                <div className="flex items-center gap-2">
                                    <CalendarRange className="h-4 w-4 text-blue-500 shrink-0" />
                                    <span className="text-xs sm:text-sm">{renderDateRange(group.start_date, group.end_date)}</span>
                                </div>
                            </div>

                            {/* GRID JADWAL */}
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 ml-1">Checklist Hari Ini</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {group.schedules.map((sch) => (
                                    <div 
                                        key={sch.id}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                                            sch.is_taken 
                                                ? "bg-green-50 border-green-200" 
                                                : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm"
                                        )}
                                        onClick={() => !sch.is_taken && handleTakeMedicine(sch.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-1.5 rounded-full", sch.is_taken ? "bg-green-100" : "bg-slate-100")}>
                                                <Clock className={cn("h-4 w-4", sch.is_taken ? "text-green-600" : "text-slate-500")} />
                                            </div>
                                            <span className={cn("font-semibold text-sm", sch.is_taken ? "text-green-800" : "text-slate-700")}>
                                                {sch.time} WIB
                                            </span>
                                        </div>
                                        {sch.is_taken ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <Circle className="h-5 w-5 text-slate-300 group-hover:text-blue-400" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* FOOTER ACTIONS */}
                            <div className="mt-6 flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-100">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 w-full sm:w-auto"
                                    onClick={() => handleDeleteGroup(group.medicine_id, group.schedules)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Hapus Jadwal
                                </Button>

                                {/* Tombol Pintar: Minum Sekarang */}
                                {!allTaken && nextToTake && (
                                    <Button 
                                        size="sm"
                                        disabled={!group.is_active}
                                        onClick={() => handleSmartTake(group.schedules)}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-200 rounded-lg px-6 w-full sm:w-auto"
                                    >
                                        <Bell className="h-4 w-4 mr-2 animate-pulse" />
                                        Minum Sekarang ({nextToTake.time})
                                    </Button>
                                )}
                                
                                {allTaken && (
                                    <span className="text-sm font-medium text-green-600 flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 w-full sm:w-auto justify-center">
                                        <CheckCircle2 className="h-4 w-4" /> Semua Selesai
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    )}
                  </Card>
                )
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-slate-300">
            <CalendarX className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Belum ada jadwal dibuat.</p>
            <p className="text-sm text-slate-400">Buat jadwal baru agar Anda tidak lupa minum obat.</p>
          </div>
        )}
      </main>
    </div>
  );
};