import { CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2, AlertTriangle, CircleDashed } from "lucide-react";

interface ScheduleItem {
  id: number;
  medicine_name: string;
  time: string;
  is_taken?: boolean;
  taken_at?: string | null;
}

// Helper: hitung status jadwal
type ScheduleStatus = 'taken' | 'late' | 'missed' | 'upcoming';

function getScheduleStatus(item: ScheduleItem): ScheduleStatus {
  if (item.is_taken) return 'taken';

  // Bandingkan waktu jadwal dengan waktu sekarang
  const now = new Date();
  const [h, m] = item.time.split(':').map(Number);
  const scheduledTime = new Date();
  scheduledTime.setHours(h, m, 0, 0);

  const diffMs = now.getTime() - scheduledTime.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours >= 2) return 'missed';   // Lebih dari 2 jam lewat → Terlewat
  if (diffHours > 0) return 'late';       // Sudah lewat tapi belum 2 jam → masih bisa minum
  return 'upcoming';                      // Belum sampai waktunya
}

const STATUS_CONFIG = {
  taken:    { label: 'Sudah',    color: 'bg-green-100 text-green-700', icon: CheckCircle2, iconColor: 'text-green-500' },
  late:     { label: 'Terlambat', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle, iconColor: 'text-amber-500' },
  missed:   { label: 'Terlewat', color: 'bg-red-100 text-red-700',    icon: AlertTriangle, iconColor: 'text-red-500' },
  upcoming: { label: 'Belum',    color: 'bg-slate-100 text-slate-600', icon: CircleDashed, iconColor: 'text-slate-400' },
};

export const ScheduleList = ({ schedules }: { schedules: ScheduleItem[] }) => {
  if (schedules.length === 0) {
    return (
        <div className="text-center py-6">
            <p className="text-sm text-slate-500 italic">Tidak ada jadwal minum obat hari ini.</p>
        </div>
    );
  }

  return (
    <CardContent className="p-0 space-y-3">
      {schedules.map((item) => {
        const status = getScheduleStatus(item);
        const cfg = STATUS_CONFIG[status];
        const StatusIcon = cfg.icon;

        return (
          <div 
            key={item.id} 
            className={`flex items-center justify-between p-3 rounded-xl border shadow-sm transition-all ${
              status === 'taken' 
                ? 'bg-green-50/80 border-green-100' 
                : status === 'missed' 
                  ? 'bg-red-50/50 border-red-100' 
                  : 'bg-white/80 border-white/50 hover:shadow-md hover:bg-white'
            } backdrop-blur-sm group`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-2 rounded-xl shrink-0 ${
                status === 'taken' ? 'bg-green-100 text-green-600' 
                : status === 'missed' ? 'bg-red-100 text-red-500'
                : 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600'
              }`}>
                {status === 'taken' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <p className={`font-semibold text-sm line-clamp-1 ${
                  status === 'taken' ? 'text-green-800' : status === 'missed' ? 'text-red-800' : 'text-slate-800'
                }`}>{item.medicine_name}</p>
                <p className="text-xs text-slate-500 font-medium">Pukul {item.time}</p>
              </div>
            </div>
            <div className="shrink-0 ml-2">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${cfg.color}`}>
                <StatusIcon className={`h-3 w-3 ${cfg.iconColor}`} />
                <span className="hidden sm:inline">{cfg.label}</span>
              </span>
            </div>
          </div>
        );
      })}
    </CardContent>
  );
};