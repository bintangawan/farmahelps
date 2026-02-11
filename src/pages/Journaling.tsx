import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import untuk navigasi
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";

// Menggunakan library baru yang support React 18
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import { toast } from "sonner";
import { getData, postData } from "@/services/api";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import api from "@/services/api";

// Tipe Data (Sudah ada slug)
interface Journal {
  id: number;
  title: string;
  slug: string; // <--- Identitas unik untuk URL
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

export const Journaling = () => {
  const navigate = useNavigate(); // Hook untuk pindah halaman
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);

  // State Modal Create (Hanya untuk buat baru)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState("neutral");

  // --- 1. Fetch Data ---
  const fetchJournals = async () => {
    try {
      const result = await getData<{ data: Journal[] }>("/journals");
      // Handle jika result.data array atau result langsung array
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

  // --- 2. Handle Submit (Create) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi konten kosong (React Quill menyisakan tag HTML kosong)
    if (!content.trim() || content === "<p><br></p>") {
      toast.warning("Tulis sesuatu dulu ya!");
      return;
    }

    setIsSubmitting(true);
    try {
      await postData("/journals", { title, content, mood: selectedMood });
      toast.success("Jurnal berhasil disimpan!");

      // Reset Form
      setTitle("");
      setContent("");
      setSelectedMood("neutral");
      setIsModalOpen(false);

      // Refresh Data
      fetchJournals();
    } catch (error) {
      toast.error("Gagal menyimpan jurnal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. Handle Delete ---
  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah klik tembus ke Card (agar tidak pindah halaman saat klik hapus)

    if (!confirm("Hapus catatan ini?")) return;
    try {
      await api.delete(`/journals/${id}`);
      setJournals((prev) => prev.filter((j) => j.id !== id));
      toast.success("Jurnal dihapus.");
    } catch (error) {
      toast.error("Gagal menghapus.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-200/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-200/30 blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
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
                  <div className="flex gap-3">
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

        {/* Content Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
          </div>
        ) : journals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journals.map((journal) => {
              const moodStyle =
                MOODS.find((m) => m.id === journal.mood) || MOODS[1];
              const MoodIcon = moodStyle.icon;

              return (
                <Card
                  key={journal.id}
                  className="border-slate-200/60 shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur-sm flex flex-col h-full group cursor-pointer hover:border-purple-200"
                  // NAVIGASI PAKE SLUG DISINI
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
                    {/* Preview Content (Rich Text) */}
                    <div
                      className="prose prose-sm prose-slate text-slate-600 line-clamp-4 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: journal.content }}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent" />
                  </CardContent>

                  <div className="p-4 pt-0 mt-auto flex justify-between items-center border-t border-slate-50">
                    <Button
                      variant="ghost"
                      className="text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-0"
                      // Navigasi juga disini (redundant tapi good UX)
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
                      // Delete tetap pakai ID
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
        ) : (
          <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-slate-300">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">
              Belum ada catatan
            </h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              Mulai tulis refleksi pertamamu hari ini. Bagaimana perasaanmu? Apa
              yang kamu syukuri?
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
