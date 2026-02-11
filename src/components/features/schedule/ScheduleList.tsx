import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface ScheduleItem {
  id: number;
  medicine_name: string;
  time: string;
  is_taken?: boolean;
}

export const ScheduleList = ({ schedules }: { schedules: ScheduleItem[] }) => {
  if (schedules.length === 0) {
    return (
        <div className="text-center py-6">
            <p className="text-sm text-slate-500 italic">Tidak ada jadwal minum obat hari ini.</p>
        </div>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0 space-y-3">
        {schedules.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-3 rounded-xl bg-white/80 border border-white/50 shadow-sm hover:shadow-md hover:bg-white transition-all backdrop-blur-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm line-clamp-1">{item.medicine_name}</p>
                <p className="text-xs text-slate-500 font-medium">Pukul {item.time}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};