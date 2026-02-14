import { useEffect, useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AddMedicineModal } from "@/components/features/medicines/AddMedicineModal";
import { MedicineCard } from "@/components/features/medicines/MedicineCard";
import { MedicineDetailModal } from "@/components/features/medicines/MedicineDetailModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, PackageX, ChevronLeft, ChevronRight, X, Filter } from "lucide-react";
import { toast } from "sonner";
import api, { getData } from "@/services/api"; 
import type { Medicine } from "@/types";

const ITEMS_PER_PAGE = 12;

export const Inventory = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter states (based on expired_date)
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

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

  const handleCardClick = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsDetailOpen(true);
  };

  // Extract unique years from expired_date for year filter options
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    medicines.forEach(m => {
      if (m.expired_date) {
        const y = new Date(m.expired_date).getFullYear();
        if (!isNaN(y)) years.add(y);
      }
    });
    const yearArray = Array.from(years).sort((a, b) => a - b);
    return yearArray;
  }, [medicines]);

  // Filtered + searched medicines
  const filteredMedicines = useMemo(() => {
    let result = medicines;

    // Search filter (realtime)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        (m.medicine_type && m.medicine_type.toLowerCase().includes(q)) ||
        (m.indication && m.indication.toLowerCase().includes(q))
      );
    }

    // Month filter (on expired_date)
    if (filterMonth !== "all") {
      const monthNum = parseInt(filterMonth);
      result = result.filter(m => {
        if (!m.expired_date) return false;
        return new Date(m.expired_date).getMonth() + 1 === monthNum;
      });
    }

    // Year filter (on expired_date)
    if (filterYear !== "all") {
      const yearNum = parseInt(filterYear);
      result = result.filter(m => {
        if (!m.expired_date) return false;
        return new Date(m.expired_date).getFullYear() === yearNum;
      });
    }

    return result;
  }, [medicines, search, filterMonth, filterYear]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredMedicines.length / ITEMS_PER_PAGE));
  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterMonth, filterYear]);

  const hasActiveFilters = filterMonth !== "all" || filterYear !== "all";

  const clearFilters = () => {
    setFilterMonth("all");
    setFilterYear("all");
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Inventory Obat</h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">Kelola stok, detail, dan masa berlaku obat Anda.</p>
          </div>
          <AddMedicineModal onSuccess={fetchMedicines} />
        </div>

        {/* Search + Filter Bar */}
        <div className="space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <Input 
                placeholder="Cari nama obat, jenis, atau kegunaan..." 
                className="pl-11 h-11 bg-white border-slate-200 shadow-sm rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm sm:text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Toggle Filter Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-11 gap-2 rounded-xl border-slate-200 shrink-0 ${showFilters || hasActiveFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter Exp.</span>
              <span className="sm:hidden">Filter</span>
              {hasActiveFilters && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(filterMonth !== "all" ? 1 : 0) + (filterYear !== "all" ? 1 : 0)}
                </span>
              )}
            </Button>
          </div>

          {/* Collapsible Filter Row */}
          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-top-2 duration-200 relative z-10">
              <div className="flex-1 min-w-0 space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                  Bulan Kedaluwarsa
                </label>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="h-11 rounded-lg border-slate-200 text-sm bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-colors focus:ring-2 focus:ring-blue-100">
                    <SelectValue placeholder="Semua Bulan" />
                  </SelectTrigger>
                  <SelectContent 
                    className="rounded-xl border-slate-200 shadow-lg z-50 max-h-[300px] overflow-y-auto bg-white"
                    position="popper"
                    sideOffset={5}
                  >
                    <SelectItem value="all" className="rounded-md">Semua Bulan</SelectItem>
                    <SelectItem value="1" className="rounded-md">Januari</SelectItem>
                    <SelectItem value="2" className="rounded-md">Februari</SelectItem>
                    <SelectItem value="3" className="rounded-md">Maret</SelectItem>
                    <SelectItem value="4" className="rounded-md">April</SelectItem>
                    <SelectItem value="5" className="rounded-md">Mei</SelectItem>
                    <SelectItem value="6" className="rounded-md">Juni</SelectItem>
                    <SelectItem value="7" className="rounded-md">Juli</SelectItem>
                    <SelectItem value="8" className="rounded-md">Agustus</SelectItem>
                    <SelectItem value="9" className="rounded-md">September</SelectItem>
                    <SelectItem value="10" className="rounded-md">Oktober</SelectItem>
                    <SelectItem value="11" className="rounded-md">November</SelectItem>
                    <SelectItem value="12" className="rounded-md">Desember</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 min-w-0 space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                  Tahun Kedaluwarsa
                </label>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="h-11 rounded-lg border-slate-200 text-sm bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-colors focus:ring-2 focus:ring-blue-100">
                    <SelectValue placeholder="Semua Tahun" />
                  </SelectTrigger>
                  <SelectContent 
                    className="rounded-xl border-slate-200 shadow-lg z-50 max-h-[300px] overflow-y-auto bg-white"
                    position="popper"
                    sideOffset={5}
                  >
                    <SelectItem value="all" className="rounded-md">Semua Tahun</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={String(year)} className="rounded-md">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {hasActiveFilters && (
                <div className="flex items-end sm:pt-0 pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters} 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-11 gap-1.5 px-4 rounded-lg border border-red-200 hover:border-red-300 transition-colors"
                  >
                    <X className="h-4 w-4" /> 
                    <span className="font-medium">Reset</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Result Info */}
        {!loading && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              Menampilkan {paginatedMedicines.length} dari {filteredMedicines.length} obat
              {hasActiveFilters && " (difilter)"}
            </p>
          </div>
        )}

        {/* Content Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          </div>
        ) : paginatedMedicines.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {paginatedMedicines.map((med) => (
                <MedicineCard 
                  key={med.id} 
                  medicine={med} 
                  onOpen={handleOpenSeal}
                  onDelete={handleDelete}
                  onClickDetail={handleCardClick}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-9 w-9 p-0 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first, last, current, and neighbors
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | string)[]>((acc, page, idx, arr) => {
                    if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                      acc.push('...');
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    typeof item === 'string' ? (
                      <span key={`dots-${idx}`} className="px-1 text-slate-400">…</span>
                    ) : (
                      <Button
                        key={item}
                        variant={currentPage === item ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(item)}
                        className={`h-9 w-9 p-0 rounded-lg text-sm ${
                          currentPage === item 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        {item}
                      </Button>
                    )
                  )
                }
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 w-9 p-0 rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <PackageX className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">Tidak ada obat ditemukan</h3>
            <p className="text-slate-500 mt-1">Coba kata kunci lain atau tambahkan obat baru.</p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2 text-blue-600">
                Reset semua filter
              </Button>
            )}
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