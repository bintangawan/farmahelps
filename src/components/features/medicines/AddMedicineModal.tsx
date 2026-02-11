import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, Loader2, Pill, Package, Scale, CalendarDays, Hourglass, FileText, Tag, Activity 
} from "lucide-react";
import { toast } from "sonner";
import { postData } from '@/services/api';

interface AddMedicineModalProps {
  onSuccess: () => void;
}

export const AddMedicineModal = ({ onSuccess }: AddMedicineModalProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    medicine_type: '',
    indication: '',
    stock: '',
    unit: 'Tablet',
    expired_date: '',
    bud_days: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await postData('/medicines', {
        ...formData,
        stock: Number(formData.stock),
        bud_days: formData.bud_days ? Number(formData.bud_days) : null
      });
      
      toast.success("Obat berhasil ditambahkan!");
      setFormData({ name: '', description: '', medicine_type: '', indication: '', stock: '', unit: 'Tablet', expired_date: '', bud_days: '' });
      setOpen(false);
      onSuccess(); 
    } catch (error) {
      toast.error("Gagal menambahkan obat.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-lg shadow-blue-500/20 rounded-xl px-6 transition-all w-full sm:w-auto h-11">
          <Plus className="mr-2 h-5 w-5" /> Tambah Obat
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] bg-white p-0 rounded-2xl shadow-2xl border-none gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Pill className="h-5 w-5" />
            </div>
            <div>
                <DialogTitle className="text-xl font-bold text-slate-800">Tambah Obat Baru</DialogTitle>
                <DialogDescription className="text-slate-500">
                    Lengkapi detail obat untuk manajemen yang lebih baik.
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Nama Obat */}
            <div className="space-y-2">
                <Label htmlFor="name">Nama Obat</Label>
                <div className="relative">
                    <Pill className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input id="name" placeholder="Contoh: Paracetamol 500mg" value={formData.name} onChange={handleChange} required className="pl-10 h-11 bg-slate-50 border-slate-200" />
                </div>
            </div>

            {/* Grid: Jenis & Kegunaan */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="medicine_type" className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-blue-500" /> Jenis Obat
                    </Label>
                    <Input id="medicine_type" placeholder="Ex: Tablet, Sirup" value={formData.medicine_type} onChange={handleChange} className="h-11 bg-slate-50 border-slate-200" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="indication" className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-green-500" /> Kegunaan
                    </Label>
                    <Input id="indication" placeholder="Ex: Demam, Flu" value={formData.indication} onChange={handleChange} className="h-11 bg-slate-50 border-slate-200" />
                </div>
            </div>

            {/* Grid: Stok & Satuan */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="stock">Stok Awal</Label>
                    <div className="relative">
                        <Package className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input id="stock" type="number" placeholder="0" value={formData.stock} onChange={handleChange} required className="pl-10 h-11 bg-slate-50 border-slate-200" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="unit">Satuan</Label>
                    <div className="relative">
                        <Scale className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input id="unit" placeholder="Pcs/Botol" value={formData.unit} onChange={handleChange} required className="pl-10 h-11 bg-slate-50 border-slate-200" />
                    </div>
                </div>
            </div>

            {/* Tanggal Expired */}
            <div className="space-y-2">
                <Label htmlFor="expired_date">Tanggal Expired</Label>
                <div className="relative">
                    <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input id="expired_date" type="date" value={formData.expired_date} onChange={handleChange} required className="pl-10 h-11 bg-slate-50 border-slate-200 cursor-pointer" />
                </div>
            </div>

            {/* Deskripsi (Menggunakan Native Textarea dengan styling Tailwind) */}
            <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-500" /> Deskripsi & Catatan
                </Label>
                <textarea 
                    id="description" 
                    className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tuliskan dosis anjuran atau catatan tambahan..."
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>

            {/* BUD */}
            <div className="space-y-2 bg-amber-50 p-4 rounded-xl border border-amber-100">
                <Label htmlFor="bud_days" className="text-amber-800 font-medium flex items-center gap-2">
                    <Hourglass className="h-4 w-4" /> Masa Simpan Setelah Dibuka (BUD)
                </Label>
                <div className="relative">
                    <Input id="bud_days" type="number" placeholder="Opsional" value={formData.bud_days} onChange={handleChange} className="h-11 bg-white border-amber-200 focus:border-amber-500 pr-12" />
                    <span className="absolute right-3 top-3 text-sm text-amber-500 font-medium">Hari</span>
                </div>
                <p className="text-[11px] text-amber-700/70 mt-1.5 ml-1">
                    *Isi jika obat memiliki batas waktu penyimpanan khusus setelah segel dibuka.
                </p>
            </div>

            <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8 rounded-xl shadow-md w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Obat"}
                </Button>
            </div>
            </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};