import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AddMedicineModal } from "@/components/features/medicines/AddMedicineModal";
import { MedicineCard } from "@/components/features/medicines/MedicineCard";
import { MedicineDetailModal } from "@/components/features/medicines/MedicineDetailModal"; // Import Modal Baru
import { Input } from "@/components/ui/input";
import { Search, Loader2, PackageX } from "lucide-react";
import { toast } from "sonner";
import api, { getData } from "@/services/api"; 
import type { Medicine } from "@/types";

export const Inventory = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // State untuk Detail Modal
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchMedicines = async () => {
    try {
      const data = await getData<Medicine[]>('/medicines');
      setMedicines(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data obat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleOpenSeal = async (id: number) => {
    try {
      await api.put(`/medicines/${id}/open`);
      toast.success("Segel obat dibuka. BUD mulai dihitung.");
      fetchMedicines();
    } catch (error) {
      toast.error("Gagal update status obat.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus obat ini?")) return;
    try {
      await api.delete(`/medicines/${id}`);
      toast.success("Obat dihapus.");
      fetchMedicines();
    } catch (error) {
      toast.error("Gagal menghapus obat.");
    }
  };

  // Handler Klik Card
  const handleCardClick = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsDetailOpen(true);
  };

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    (m.medicine_type && m.medicine_type.toLowerCase().includes(search.toLowerCase())) ||
    (m.indication && m.indication.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Inventory Obat</h1>
            <p className="text-slate-600 mt-1">Kelola stok, detail, dan masa berlaku obat Anda.</p>
          </div>
          <AddMedicineModal onSuccess={fetchMedicines} />
        </div>

        {/* Search Bar (Styled Better) */}
        <div className="relative mb-8 max-w-xl mx-auto md:mx-0">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <Input 
              placeholder="Cari nama obat, jenis, atau kegunaan..." 
              className="pl-11 h-12 bg-white border-slate-200 shadow-sm rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          </div>
        ) : filteredMedicines.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedicines.map((med) => (
              <MedicineCard 
                key={med.id} 
                medicine={med} 
                onOpen={handleOpenSeal}
                onDelete={handleDelete}
                onClickDetail={handleCardClick} // Pass handler
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <PackageX className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">Tidak ada obat ditemukan</h3>
            <p className="text-slate-500 mt-1">Coba kata kunci lain atau tambahkan obat baru.</p>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <MedicineDetailModal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        medicine={selectedMedicine} 
      />
    </div>
  );
};