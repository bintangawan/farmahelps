import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Package, Scale, Info, Activity, Pill, AlertTriangle } from "lucide-react";
import type { Medicine } from "@/types";
import { format, parseISO, differenceInDays } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface MedicineDetailModalProps {
  medicine: Medicine | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MedicineDetailModal = ({ medicine, isOpen, onClose }: MedicineDetailModalProps) => {
  if (!medicine) return null;

  const today = new Date();
  const expDate = parseISO(medicine.expired_date);
  const daysToExpire = differenceInDays(expDate, today);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white rounded-2xl border-none shadow-2xl overflow-hidden p-0">
        {/* Header dengan Warna Background */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-6 text-white">
            <DialogHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <DialogTitle className="text-2xl font-bold">{medicine.name}</DialogTitle>
                        <DialogDescription className="text-blue-100 mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-white border-white/40 bg-white/10">
                                {medicine.medicine_type || "Obat Umum"}
                            </Badge>
                            <span>•</span>
                            <span className="opacity-90 flex items-center gap-1">
                                {/* FIX: Gunakan Activity disini */}
                                <Activity className="w-3 h-3" />
                                {medicine.indication || "Tidak ada keterangan kegunaan"}
                            </span>
                        </DialogDescription>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Pill className="h-8 w-8 text-white" />
                    </div>
                </div>
            </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
            {/* Status Section */}
            <div className="flex gap-4">
                <div className={`flex-1 p-3 rounded-xl border ${daysToExpire <= 30 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        <CalendarDays className="h-3 w-3" /> Expired Date
                    </div>
                    <div className={`text-lg font-bold ${daysToExpire <= 30 ? 'text-red-600' : 'text-slate-800'}`}>
                        {format(expDate, "d MMMM yyyy", { locale: localeId })}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        {daysToExpire < 0 ? "Sudah Kadaluarsa" : `${daysToExpire} hari lagi`}
                    </div>
                </div>

                <div className="flex-1 p-3 rounded-xl border bg-slate-50 border-slate-200">
                    {/* FIX: Gunakan Scale disini */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        <Scale className="h-3 w-3" /> Stok Saat Ini
                    </div>
                    <div className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Package className="h-4 w-4 text-slate-400" />
                        {medicine.stock} <span className="text-sm font-normal text-slate-500">{medicine.unit}</span>
                    </div>
                </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" /> Deskripsi & Dosis
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600 leading-relaxed border border-slate-100">
                    {medicine.description || "Belum ada deskripsi yang ditambahkan untuk obat ini."}
                </div>
            </div>

            {/* BUD Section (Jika dibuka) */}
            {medicine.is_opened && medicine.opened_at && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-yellow-800">Perhatian: Segel Terbuka</h4>
                        <p className="text-xs text-yellow-700 mt-1">
                            Obat dibuka pada <strong>{format(parseISO(medicine.opened_at), "d MMM yyyy", { locale: localeId })}</strong>. 
                            {medicine.bud_days && ` Masa simpan ${medicine.bud_days} hari setelah dibuka.`}
                        </p>
                    </div>
                </div>
            )}
        </div>

        <DialogFooter className="p-6 pt-0">
            <Button onClick={onClose} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800">
                Tutup
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};