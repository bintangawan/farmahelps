import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CalendarDays, Trash2, Smile, Frown, Meh, Quote } from "lucide-react";
import { getData } from "@/services/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import api from "@/services/api";

// Interface Journal
interface Journal {
  id: number;
  title: string;
  slug: string;
  content: string;
  mood: string;
  created_at: string;
}

const MOODS = [
  { id: "happy", label: "Senang", icon: Smile, color: "text-green-700 bg-green-50 border-green-200" },
  { id: "neutral", label: "Biasa", icon: Meh, color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  { id: "sad", label: "Sedih", icon: Frown, color: "text-blue-700 bg-blue-50 border-blue-200" },
];

export const DetailJournal = () => {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const result = await getData<{ data: Journal }>(`/journals/${slug}`);
        const data = result.data || result; 
        // @ts-ignore
        setJournal(data);
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat jurnal.");
        navigate("/journal"); 
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchDetail();
  }, [slug, navigate]);

  const handleDelete = async () => {
    if (!journal) return;
    if (!confirm("Hapus jurnal ini permanen?")) return;
    
    try {
      await api.delete(`/journals/${journal.id}`);
      toast.success("Jurnal berhasil dihapus.");
      navigate("/journal"); 
    } catch (error) {
      toast.error("Gagal menghapus jurnal.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!journal) return null;

  const moodStyle = MOODS.find(m => m.id === journal.mood) || MOODS[1];
  const MoodIcon = moodStyle.icon;

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans flex flex-col"> 
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12 z-10">
        
        {/* Tombol Back */}
        <div className="mb-6">
            <Button 
                variant="ghost" 
                onClick={() => navigate("/journal")}
                className="hover:bg-slate-200/50 text-slate-500 transition-colors -ml-2"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Daftar
            </Button>
        </div>

        {/* --- HEADER ARTIKEL --- */}
        <header className="mb-8 md:mb-10 text-center space-y-5">
            {/* Meta Info */}
            <div className="flex flex-wrap justify-center items-center gap-3">
                <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs sm:text-sm text-slate-500 shadow-sm">
                    <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {format(new Date(journal.created_at), "EEEE, d MMMM yyyy • HH:mm", { locale: idLocale })}
                </span>
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm border shadow-sm font-medium ${moodStyle.color}`}>
                    <MoodIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {moodStyle.label}
                </span>
            </div>

            {/* Judul Besar */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight break-words px-2 font-serif">
                {journal.title || "Tanpa Judul"}
            </h1>

            {/* Garis Hiasan */}
            <div className="w-20 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto rounded-full mt-4" />
        </header>

        {/* --- KONTEN UTAMA --- */}
        <article className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden relative mb-10">
            {/* Hiasan Icon Quote */}
            <Quote className="absolute top-6 left-6 h-16 w-16 text-purple-500/5 -z-0 rotate-180 pointer-events-none" />

            <div className="p-6 sm:p-10 relative z-10">
                {/* TYPOGRAPHY FIX:
                    - [&_p]:mb-6 -> Memberikan margin bawah pada setiap paragraf (SOLUSI ENTER)
                    - leading-7 -> Line height yang enak dibaca (tidak terlalu jauh/dekat)
                    - text-justify + hyphens-auto -> Rata kanan kiri yang rapi tanpa bolong besar
                    - break-words -> Mencegah teks panjang menabrak keluar
                */}
                <div 
                    className="
                        prose prose-slate max-w-none w-full 
                        text-slate-700 
                        font-medium
                        text-base sm:text-lg
                        leading-8 
                        text-justify hyphens-auto break-words
                        
                        [&_p]:mb-6 [&_p]:last:mb-0
                        [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
                        [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3
                        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-6
                        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-6
                        [&_li]:mb-1
                        [&_blockquote]:border-l-4 [&_blockquote]:border-purple-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:bg-slate-50 [&_blockquote]:py-2
                        [&_a]:text-purple-600 [&_a]:underline
                    "
                    dangerouslySetInnerHTML={{ __html: journal.content }}
                />
            </div>
        </article>

        {/* --- FOOTER ACTION --- */}
        <div className="flex justify-center border-t border-slate-200/60 pt-8 pb-12">
            <Button 
                variant="ghost" 
                size="lg"
                onClick={handleDelete}
                className="text-red-400 hover:text-red-600 hover:bg-red-50 transition-all group"
            >
                <Trash2 className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" /> 
                Hapus Jurnal Ini
            </Button>
        </div>

      </main>
    </div>
  );
};