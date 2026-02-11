import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Loader2, 
  Check, 
  ChevronsUpDown, 
  Search, 
  Clock,  // <--- Kita pakai ini sekarang
  CalendarIcon, 
  Trash2,
  CalendarDays 
} from "lucide-react";
import { toast } from "sonner";
import { getData, postData } from '@/services/api';
import type { Medicine } from '@/types';
import { cn } from "@/lib/utils";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddScheduleModalProps {
  onSuccess: () => void;
}

const DAYS = [
  { id: "Mon", label: "Senin" },
  { id: "Tue", label: "Selasa" },
  { id: "Wed", label: "Rabu" },
  { id: "Thu", label: "Kamis" },
  { id: "Fri", label: "Jumat" },
  { id: "Sat", label: "Sabtu" },
  { id: "Sun", label: "Minggu" },
];

export const AddScheduleModal = ({ onSuccess }: AddScheduleModalProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  
  // Form State
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  
  // Multiple Time State
  const [times, setTimes] = useState<string[]>(["07:00"]);

  // Date Range State
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  
  // UI States
  const [openCombobox, setOpenCombobox] = useState(false);

  useEffect(() => {
    if (open) {
      getData<Medicine[]>('/medicines').then(setMedicines).catch(console.error);
      if (!endDate) {
         const nextWeek = new Date();
         nextWeek.setDate(nextWeek.getDate() + 7);
         setEndDate(nextWeek.toISOString().slice(0, 10));
      }
    }
  }, [open]);

  // --- LOGIC HARI ---
  const toggleDay = (dayId: string) => {
    setSelectedDays(prev => {
      if (prev.includes(dayId)) return prev.filter(d => d !== dayId);
      return [...prev, dayId];
    });
  };

  // Logic "Setiap Hari"
  const isEveryDaySelected = DAYS.every(d => selectedDays.includes(d.id));

  const toggleEveryDay = () => {
    if (isEveryDaySelected) {
        // Jika sudah semua, kosongkan
        setSelectedDays([]);
    } else {
        // Jika belum semua, pilih semua
        setSelectedDays(DAYS.map(d => d.id));
    }
  };
  // ------------------

  // --- LOGIC WAKTU ---
  const addTimeSlot = () => {
    setTimes([...times, "12:00"]);
  };

  const removeTimeSlot = (index: number) => {
    const newTimes = times.filter((_, i) => i !== index);
    setTimes(newTimes);
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };
  // -------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMedicine || selectedDays.length === 0 || !startDate || !endDate || times.length === 0) {
        toast.warning("Mohon lengkapi semua data (Obat, Hari, Tanggal, Jam).");
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        toast.warning("Tanggal selesai tidak boleh sebelum tanggal mulai.");
        return;
    }

    setIsLoading(true);
    try {
      await postData('/schedules', {
        medicine_id: Number(selectedMedicine),
        times: times,
        days: selectedDays,
        start_date: startDate,
        end_date: endDate
      });
      
      toast.success(`Berhasil membuat ${times.length} jadwal!`);
      setOpen(false);
      
      // Reset Form
      setSelectedMedicine("");
      setTimes(["07:00"]);
      setSelectedDays([]);
      
      onSuccess();
    } catch (error) {
      toast.error("Gagal membuat jadwal.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-lg shadow-blue-500/20 rounded-xl px-6 transition-all w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Buat Jadwal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-white p-0 rounded-2xl shadow-2xl border-none gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <DialogTitle className="text-xl font-bold text-slate-800">Atur Pengingat Obat</DialogTitle>
          <DialogDescription>
            Bisa atur frekuensi (misal: 3x sehari) sekaligus.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* 1. Pilih Obat */}
            <div className="space-y-2 flex flex-col">
                <Label>Pilih Obat</Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                    <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between bg-white border-slate-300 h-11 text-slate-700 hover:bg-slate-50"
                    >
                    {selectedMedicine
                        ? medicines.find((med) => med.id.toString() === selectedMedicine)?.name
                        : "Cari obat dari inventory..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border-slate-200 shadow-xl z-[60]" align="start">
                    <Command>
                    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <CommandInput placeholder="Ketik nama obat..." className="h-10" />
                    </div>
                    <CommandList className="max-h-[200px] overflow-y-auto bg-white">
                        <CommandEmpty className="py-6 text-center text-sm text-slate-500">Obat tidak ditemukan.</CommandEmpty>
                        <CommandGroup heading="Daftar Obat">
                            {medicines.map((med) => (
                            <CommandItem
                                key={med.id}
                                value={med.name}
                                onSelect={() => {
                                    setSelectedMedicine(med.id.toString());
                                    setOpenCombobox(false);
                                }}
                                className="cursor-pointer hover:bg-blue-50 aria-selected:bg-blue-50"
                            >
                                <Check
                                className={cn(
                                    "mr-2 h-4 w-4 text-blue-600",
                                    selectedMedicine === med.id.toString() ? "opacity-100" : "opacity-0"
                                )}
                                />
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-800">{med.name}</span>
                                    <span className="text-xs text-slate-500">Stok: {med.stock} {med.unit}</span>
                                </div>
                            </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                    </Command>
                </PopoverContent>
                </Popover>
            </div>

            {/* 2. Rentang Tanggal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><CalendarIcon className="h-3.5 w-3.5" /> Tanggal Mulai</Label>
                    <Input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-11 bg-white border-slate-300"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><CalendarIcon className="h-3.5 w-3.5" /> Tanggal Selesai</Label>
                    <Input 
                        type="date" 
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-11 bg-white border-slate-300"
                    />
                </div>
            </div>

            {/* 3. Frekuensi Jam */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    {/* Menggunakan Ikon Clock disini */}
                    <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Waktu Minum ({times.length}x Sehari)
                    </Label>
                    <Button type="button" variant="ghost" size="sm" onClick={addTimeSlot} className="text-blue-600 hover:text-blue-700 h-8 text-xs">
                        <Plus className="h-3 w-3 mr-1" /> Tambah Jam
                    </Button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {times.map((time, index) => (
                        <div key={index} className="relative group">
                            <Input
                                type="time"
                                value={time}
                                onChange={(e) => handleTimeChange(index, e.target.value)}
                                className="h-12 text-center font-bold text-lg bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500"
                            />
                            {times.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeTimeSlot(index)}
                                    className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. Pilih Hari dengan 'Setiap Hari' */}
            <div className="space-y-3 pb-4 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-blue-600" /> 
                        Hari Pengulangan
                    </Label>
                    
                    {/* TOMBOL SELECT ALL / SETIAP HARI */}
                    <div 
                        className="flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
                        onClick={toggleEveryDay}
                    >
                        <div className={cn(
                            "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                            isEveryDaySelected ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"
                        )}>
                            {isEveryDaySelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className={cn("text-xs font-semibold", isEveryDaySelected ? "text-blue-700" : "text-slate-500")}>
                            Setiap Hari
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DAYS.map((day) => (
                    <div 
                        key={day.id} 
                        className={cn(
                            "flex items-center space-x-3 border px-3 py-2.5 rounded-lg transition-all cursor-pointer select-none",
                            selectedDays.includes(day.id) 
                                ? "bg-blue-50 border-blue-500 shadow-sm" 
                                : "bg-white border-slate-200 hover:border-blue-300"
                        )}
                        onClick={() => toggleDay(day.id)} 
                    >
                        <div className={cn(
                            "h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0",
                            selectedDays.includes(day.id) ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"
                        )}>
                            {selectedDays.includes(day.id) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className={cn(
                            "text-sm font-medium",
                            selectedDays.includes(day.id) ? "text-blue-700" : "text-slate-600"
                        )}>
                            {day.label}
                        </span>
                    </div>
                ))}
                </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100 mt-4">
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto shadow-md h-11 px-8 rounded-xl">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Semua Jadwal"}
                </Button>
            </div>
            </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};