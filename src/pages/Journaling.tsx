import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Plus,
  Trash2,
  Smile,
  Frown,
  Meh,
  BookOpen,
  CalendarDays,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
} from "lucide-react";

import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import { toast } from "sonner";
import { getData, postData } from "@/services/api";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import api from "@/services/api";

interface Journal {
  id: number;
  title: string;
  slug: string;
  content: string;
  mood: string;
  created_at: string;
}

const MOODS = [
  {
    id: "happy",
    label: "Senang",
    icon: Smile,
    color: "text-green-500 bg-green-50",
  },
  {
    id: "neutral",
    label: "Biasa",
    icon: Meh,
    color: "text-yellow-500 bg-yellow-50",
  },
  { id: "sad", label: "Sedih", icon: Frown, color: "text-blue-500 bg-blue-50" },
];

const ITEMS_PER_PAGE = 9;

export const Journaling = () => {
  const navigate = useNavigate();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Search & Filter states
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterMood, setFilterMood] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // State Modal Create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState("neutral");

  const fetchJournals = async () => {
    try {
      const result = await getData<{ data: Journal[] }>("/journals");
      const data = Array.isArray(result) ? result : result.data || [];
      setJournals(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat jurnal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content === "<p><br></p>") {
      toast.warning("Tulis sesuatu dulu ya!");
      return;
    }

    setIsSubmitting(true);
    try {
      await postData("/journals", { title, content, mood: selectedMood });
      toast.success("Jurnal berhasil disimpan!");
      setTitle("");
      setContent("");
      setSelectedMood("neutral");
      setIsModalOpen(false);
      fetchJournals();
    } catch (error) {
      toast.error("Gagal menyimpan jurnal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Hapus catatan ini?")) return;
    try {
      await api.delete(`/journals/${id}`);
      setJournals((prev) => prev.filter((j) => j.id !== id));
      toast.success("Jurnal dihapus.");
    } catch (error) {
      toast.error("Gagal menghapus.");
    }
  };

  // Extract unique years for filter options - memoized untuk menghindari infinite loop
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    journals.forEach(j => {
      if (j.created_at) {
        const y = new Date(j.created_at).getFullYear();
        if (!isNaN(y)) years.add(y);
      }
    });
    const yearArray = Array.from(years).sort((a, b) => b - a);
    return yearArray;
  }, [journals]);

  // Filtered journals
  const filteredJournals = useMemo(() => {
    let result = journals;

    // Search filter (realtime on title + content text)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(j =>
        (j.title && j.title.toLowerCase().includes(q)) ||
        (j.content && j.content.replace(/<[^>]*>/g, '').toLowerCase().includes(q))
      );
    }

    // Month filter (on created_at)
    if (filterMonth !== "all") {
      const monthNum = parseInt(filterMonth);
      result = result.filter(j => {
        if (!j.created_at) return false;
        return new Date(j.created_at).getMonth() + 1 === monthNum;
      });
    }

    // Year filter (on created_at)
    if (filterYear !== "all") {
      const yearNum = parseInt(filterYear);
      result = result.filter(j => {
        if (!j.created_at) return false;
        return new Date(j.created_at).getFullYear() === yearNum;
      });
    }

    // Mood filter
    if (filterMood !== "all") {
      result = result.filter(j => j.mood === filterMood);
    }

    return result;
  }, [journals, search, filterMonth, filterYear, filterMood]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredJournals.length / ITEMS_PER_PAGE));
  const paginatedJournals = filteredJournals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterMonth, filterYear, filterMood]);

  const hasActiveFilters = filterMonth !== "all" || filterYear !== "all" || filterMood !== "all";

  const clearFilters = () => {
    setFilterMonth("all");
    setFilterYear("all");
    setFilterMood("all");
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-200/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-200/30 blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-purple-600" /> Jurnal Refleksi
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Catat perasaan dan kegiatanmu hari ini.
            </p>
          </div>

          {/* ADD JOURNAL MODAL */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-200">
                <Plus className="mr-2 h-4 w-4" /> Tulis Jurnal
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white border-none shadow-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-800">
                  Tulis Ceritamu Hari Ini
                </DialogTitle>
                <DialogDescription className="text-slate-500">
                  Tuangkan pikiranmu, tidak ada yang salah dalam menulis jurnal.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                {/* Mood Selector */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Bagaimana perasaanmu?
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {MOODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMood(m.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                          selectedMood === m.id
                            ? `${m.color} border-current ring-2 ring-offset-1 ring-purple-100`
                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <m.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title Input */}
                <Input
                  placeholder="Judul (Opsional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-semibold border-slate-200 focus:border-purple-500 h-12"
                />

                {/* Rich Text Editor */}
                <div className="h-[300px] mb-12">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    placeholder="Tulis apa saja yang ada di pikiranmu..."
                    className="h-[250px]"
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ color: [] }, { background: [] }],
                        [{ align: [] }],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["blockquote", "code-block"],
                        ["link"],
                        ["clean"],
                      ],
                    }}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Simpan Cerita"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search + Filter Bar */}
        <div className="space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
              </div>
              <Input
                placeholder="Cari judul atau isi jurnal..."
                className="pl-11 h-11 bg-white border-slate-200 shadow-sm rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm sm:text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Toggle Filter Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-11 gap-2 rounded-xl border-slate-200 shrink-0 ${showFilters || hasActiveFilters ? 'bg-purple-50 border-purple-300 text-purple-700' : ''}`}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
              {hasActiveFilters && (
                <span className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(filterMonth !== "all" ? 1 : 0) + (filterYear !== "all" ? 1 : 0) + (filterMood !== "all" ? 1 : 0)}
                </span>
              )}
            </Button>
          </div>

          {/* Collapsible Filter Row */}
          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-top-2 duration-200 relative z-10">
              <div className="flex-1 min-w-0 space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                  Bulan
                </label>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="h-11 rounded-lg border-slate-200 text-sm bg-slate-50/50 hover:bg-slate-50 hover:border-purple-300 transition-colors focus:ring-2 focus:ring-purple-100">
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
                  Tahun
                </label>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="h-11 rounded-lg border-slate-200 text-sm bg-slate-50/50 hover:bg-slate-50 hover:border-purple-300 transition-colors focus:ring-2 focus:ring-purple-100">
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
              
              <div className="flex-1 min-w-0 space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                  Mood
                </label>
                <Select value={filterMood} onValueChange={setFilterMood}>
                  <SelectTrigger className="h-11 rounded-lg border-slate-200 text-sm bg-slate-50/50 hover:bg-slate-50 hover:border-purple-300 transition-colors focus:ring-2 focus:ring-purple-100">
                    <SelectValue placeholder="Semua Mood" />
                  </SelectTrigger>
                  <SelectContent 
                    className="rounded-xl border-slate-200 shadow-lg z-50 max-h-[300px] overflow-y-auto bg-white"
                    position="popper"
                    sideOffset={5}
                  >
                    <SelectItem value="all" className="rounded-md">Semua Mood</SelectItem>
                    <SelectItem value="happy" className="rounded-md">😊 Senang</SelectItem>
                    <SelectItem value="neutral" className="rounded-md">😐 Biasa</SelectItem>
                    <SelectItem value="sad" className="rounded-md">😔 Sedih</SelectItem>
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
              Menampilkan {paginatedJournals.length} dari {filteredJournals.length} jurnal
              {hasActiveFilters && " (difilter)"}
            </p>
          </div>
        )}

        {/* Content Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
          </div>
        ) : paginatedJournals.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginatedJournals.map((journal) => {
                const moodStyle =
                  MOODS.find((m) => m.id === journal.mood) || MOODS[1];
                const MoodIcon = moodStyle.icon;

                return (
                  <Card
                    key={journal.id}
                    className="border-slate-200/60 shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur-sm flex flex-col h-full group cursor-pointer hover:border-purple-200"
                    onClick={() => navigate(`/journal/${journal.slug}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div
                          className={`p-2 rounded-lg w-fit mb-3 ${moodStyle.color}`}
                        >
                          <MoodIcon className="h-5 w-5" />
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full">
                          <CalendarDays className="h-3 w-3" />
                          {format(new Date(journal.created_at), "d MMM yyyy", {
                            locale: idLocale,
                          })}
                        </div>
                      </div>
                      <CardTitle className="text-lg font-bold text-slate-800 line-clamp-2 leading-tight">
                        {journal.title || "Tanpa Judul"}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 relative">
                      <div
                        className="prose prose-sm prose-slate text-slate-600 line-clamp-4 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: journal.content }}
                      />
                      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent" />
                    </CardContent>

                    <div className="p-4 pt-0 mt-auto flex justify-between items-center border-t border-slate-50">
                      <Button
                        variant="ghost"
                        className="text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/journal/${journal.slug}`);
                        }}
                      >
                        Baca Selengkapnya
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(journal.id, e)}
                        className="text-red-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
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
                            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
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
          <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-slate-300">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">
              {hasActiveFilters ? "Tidak ada jurnal yang cocok" : "Belum ada catatan"}
            </h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? "Coba ubah filter atau kata kunci pencarian."
                : "Mulai tulis refleksi pertamamu hari ini. Bagaimana perasaanmu? Apa yang kamu rasakan?"}
            </p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2 text-purple-600">
                Reset semua filter
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};