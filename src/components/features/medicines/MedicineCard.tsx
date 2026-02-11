import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, LockOpen, AlertTriangle, CheckCircle2, PackageOpen, Info } from "lucide-react";
import type { Medicine } from "@/types";
import { format, differenceInDays, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface MedicineCardProps {
  medicine: Medicine;
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
  onClickDetail: (medicine: Medicine) => void; 
}

export const MedicineCard = ({ medicine, onOpen, onDelete, onClickDetail }: MedicineCardProps) => {
  const today = new Date();
  const expDate = parseISO(medicine.expired_date);
  const daysToExpire = differenceInDays(expDate, today);

  let budDate = null;
  let daysToBud = null;
  if (medicine.is_opened && medicine.opened_at && medicine.bud_days) {
    const openedDate = parseISO(medicine.opened_at);
    budDate = new Date(openedDate);
    budDate.setDate(budDate.getDate() + medicine.bud_days);
    daysToBud = differenceInDays(budDate, today);
  }

  const isCritical = daysToExpire <= 7 || (daysToBud !== null && daysToBud <= 3);
  const isWarning = !isCritical && (daysToExpire <= 30 || (daysToBud !== null && daysToBud <= 7));
  const isSafe = !isCritical && !isWarning;

  let borderClass = 'border-white/40 shadow-sm hover:border-blue-300';
  if (isCritical) borderClass = 'border-red-200 shadow-red-100 bg-red-50/30';
  else if (isWarning) borderClass = 'border-yellow-200 shadow-yellow-100 bg-yellow-50/30';
  else borderClass = 'border-green-100 shadow-sm bg-white/70';

  return (
    <Card 
        className={`relative overflow-hidden border transition-all hover:shadow-lg backdrop-blur-sm cursor-pointer group ${borderClass}`}
        onClick={() => onClickDetail(medicine)}
    >
      {isCritical && <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />}
      {isWarning && <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400" />}
      {isSafe && <div className="absolute top-0 left-0 w-full h-1 bg-teal-500" />}
      
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-2">
            {medicine.name}
            {/* FIX: Info icon untuk indikator detail */}
            <Info className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 transition-colors" />
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
             <p className="text-sm text-slate-500 font-medium">{medicine.stock} {medicine.unit}</p>
             {medicine.medicine_type && (
                 <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200">
                    {medicine.medicine_type}
                 </span>
             )}
             {/* FIX: Gunakan CheckCircle2 jika aman */}
             {isSafe && <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />}
          </div>
        </div>
        <div className="flex gap-1">
          {medicine.is_opened ? (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
              <PackageOpen className="w-3 h-3 mr-1" /> Terbuka
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
              Segel
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Info Tanggal */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center p-2 bg-slate-50/80 rounded-lg">
            <span className="text-slate-500">Expired Pabrik</span>
            <span className={`font-semibold ${daysToExpire < 0 ? 'text-red-600' : 'text-slate-700'}`}>
              {format(expDate, "d MMM yyyy", { locale: localeId })}
            </span>
          </div>

          {medicine.is_opened && budDate && daysToBud !== null && (
            <div className="flex justify-between items-center p-2 bg-yellow-50/80 rounded-lg border border-yellow-100">
              <span className="text-yellow-700 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> BUD Habis
              </span>
              <span className={`font-bold ${daysToBud < 0 ? 'text-red-600' : 'text-yellow-800'}`}>
                {daysToBud < 0 ? "Sudah Lewat!" : `${daysToBud} Hari Lagi`}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons (Stop Propagation agar tidak memicu klik card) */}
        <div className="flex gap-2 pt-2">
          {!medicine.is_opened && (
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 bg-white/50"
              onClick={(e) => { e.stopPropagation(); onOpen(medicine.id); }}
            >
              <LockOpen className="w-4 h-4 mr-2" /> Buka Segel
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-red-400 hover:text-red-600 hover:bg-red-50 px-2 ml-auto"
            onClick={(e) => { e.stopPropagation(); onDelete(medicine.id); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};