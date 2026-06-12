"use client";
import { useState, useEffect, useRef } from "react";
import { Headphones, Search, Play, Pause, Loader2, AlertCircle, ChevronLeft, SkipForward, SkipBack, Volume2 } from "lucide-react";

type Podcast = {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl600: string;
  feedUrl: string;
  primaryGenreName: string;
  trackCount: number;
};

type Episode = {
  id: number;
  title: string;
  description: string;
  audioUrl: string;
  date: string;
  duration: string;
  image: string;
};

const CATEGORIES = [
  { label: "الكل", term: "" },
  { label: "إسلامي", term: "islamic" },
  { label: "تاريخ", term: "history" },
  { label: "علوم", term: "science" },
  { label: "تقنية", term: "technology" },
  { label: "ثقافة", term: "culture" },
  { label: "قصص", term: "stories" },
];

export default function Podcasts() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [selected, setSelected] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    searchPodcasts("arabic podcast");
    const stopHandler = () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    };
    window.addEventListener('stop-all-audio', stopHandler);
    return () => {
      window.removeEventListener('stop-all-audio', stopHandler);
      audioRef.current?.pause();
    };
  }, []);

  const searchPodcasts = async (term: string) => {
    setLoading(true);
    setError("");
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term || "podcast")}&media=podcast&limit=30&country=sa`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("فشل البحث");
      const data = await res.json();
      setPodcasts(data.results || []);
    } catch (e: any) {
      setError(e.message || "خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (search.trim()) searchPodcasts(search);
  };

  const handleCategory = (term: string) => {
    setCategory(term);
    searchPodcasts(term || "arabic podcast");
  };

  const loadEpisodes = async (podcast: Podcast) => {
    setSelected(podcast);
    setLoadingEpisodes(true);
    setEpisodes([]);
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(podcast.feedUrl)}`);
      if (!res.ok) throw new Error("فشل تحميل الحلقات");
      const data = await res.json();
      const items = data.items || [];
      setEpisodes(items.map((item: any, i: number) => ({
        id: i,
        title: item.title || "حلقة",
        description: item.description?.replace(/<[^>]*>/g, "").slice(0, 200) || "",
        audioUrl: item.enclosure?.link || "",
        date: item.pubDate?.slice(0, 10) || "",
        duration: item.duration || "",
        image: item.thumbnail || podcast.artworkUrl600,
      })));
    } catch {
      setEpisodes([]);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const playEpisode = (ep: Episode) => {
    if (!ep.audioUrl) return;
    if (currentEpisode?.id === ep.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    window.dispatchEvent(new Event('stop-all-audio'));
    const audio = new Audio(ep.audioUrl);
    audioRef.current = audio;
    audio.play().then(() => {
      setCurrentEpisode(ep);
      setIsPlaying(true);
    }).catch(() => setError("فشل التشغيل"));
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
  };

  const playNext = () => {
    if (!currentEpisode) return;
    const idx = episodes.findIndex(e => e.id === currentEpisode.id);
    if (idx < episodes.length - 1) playEpisode(episodes[idx + 1]);
  };

  const playPrev = () => {
    if (!currentEpisode) return;
    const idx = episodes.findIndex(e => e.id === currentEpisode.id);
    if (idx > 0) playEpisode(episodes[idx - 1]);
  };

  return (
    <div className="view-section active px-4 lg:px-10 py-6 h-full w-full pb-20 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-3">
          <Headphones size={28} className="text-[var(--color-primary-custom)]" />
          البودكاست
        </h2>
        <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold px-2.5 py-1 rounded-full">
          مجاني
        </span>
      </div>

      {/* Now Playing */}
      {currentEpisode && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-[var(--color-primary-custom)]/20 to-transparent border border-[var(--color-primary-custom)]/30">
          <div className="flex items-center gap-3">
            {currentEpisode.image ? (
              <img src={currentEpisode.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/10" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-custom)]/30 flex items-center justify-center">
                <Headphones size={20} className="text-[var(--color-primary-custom)]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{currentEpisode.title}</p>
              <p className="text-gray-400 text-[10px] font-bold truncate">{selected?.collectionName}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={playPrev} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
                <SkipBack size={14} />
              </button>
              <button onClick={() => currentEpisode && playEpisode(currentEpisode)} className="w-10 h-10 rounded-xl bg-[var(--color-primary-custom)] flex items-center justify-center text-white shadow-lg hover:scale-105 transition">
                {isPlaying ? <Pause size={18} /> : <Play size={18} fill="white" />}
              </button>
              <button onClick={playNext} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
                <SkipForward size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="ابحث عن بودكاست..."
          className="sport-input !pr-12 w-full"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {CATEGORIES.map(c => (
          <button
            key={c.term}
            onClick={() => handleCategory(c.term)}
            className={`shrink-0 px-4 py-2 rounded-xl text-[11px] font-bold border transition-all ${category === c.term ? "bg-[var(--color-primary-custom)] text-white border-[var(--color-primary-custom)]" : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-[var(--color-primary-custom)] mb-4" />
          <span className="text-gray-400 font-bold">جاري البحث...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle size={32} className="text-red-400 mb-2" />
          <p className="text-red-300 text-sm font-bold">{error}</p>
          <button onClick={() => searchPodcasts("arabic podcast")} className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary-custom)] text-white text-xs font-bold">
            إعادة المحاولة
          </button>
        </div>
      ) : selected && episodes.length > 0 ? (
        <>
          <button onClick={() => { setSelected(null); setEpisodes([]); }} className="flex items-center gap-2 mb-4 text-gray-400 hover:text-white transition">
            <ChevronLeft size={16} className="rotate-180" />
            <span className="text-xs font-bold">العودة</span>
          </button>
          <div className="flex items-center gap-3 mb-4">
            <img src={selected.artworkUrl600} alt="" className="w-16 h-16 rounded-xl object-cover" />
            <div>
              <h3 className="text-white font-black text-sm">{selected.collectionName}</h3>
              <p className="text-gray-400 text-[10px] font-bold">{selected.artistName} · {episodes.length} حلقة</p>
            </div>
          </div>
          <div className="space-y-2">
            {episodes.map(ep => (
              <div
                key={ep.id}
                onClick={() => playEpisode(ep)}
                className={`p-3 rounded-xl border transition-all cursor-pointer active:scale-[0.98] ${currentEpisode?.id === ep.id && isPlaying ? "bg-[var(--color-primary-custom)]/10 border-[var(--color-primary-custom)]/30" : "bg-white/[0.03] border-white/5 hover:border-white/15"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${currentEpisode?.id === ep.id && isPlaying ? "bg-[var(--color-primary-custom)]" : "bg-white/10"}`}>
                    {currentEpisode?.id === ep.id && isPlaying ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white" fill="currentColor" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold truncate">{ep.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-gray-500 text-[9px] font-bold">{ep.date}</span>
                      {ep.duration && <span className="text-gray-600 text-[9px]">{ep.duration}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : selected && loadingEpisodes ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[var(--color-primary-custom)] mb-4" />
          <span className="text-gray-400 font-bold text-sm">جاري تحميل الحلقات...</span>
        </div>
      ) : podcasts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 font-bold">لا توجد نتائج</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
          {podcasts.map(p => (
            <button
              key={p.collectionId}
              onClick={() => loadEpisodes(p)}
              className="group rounded-lg overflow-hidden bg-white/5 border border-white/5 hover:border-[var(--color-primary-custom)]/50 transition-all active:scale-[0.97] text-right"
            >
              <div className="relative aspect-square overflow-hidden">
                <img src={p.artworkUrl600} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-1 right-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 bg-[var(--color-primary-custom)] rounded-md px-2 py-1 justify-center">
                    <Headphones size={10} className="text-white" />
                    <span className="text-white text-[7px] font-black">استمع</span>
                  </div>
                </div>
              </div>
              <div className="p-1.5">
                <h3 className="text-white text-[9px] font-bold truncate">{p.collectionName}</h3>
                <p className="text-gray-500 text-[7px] font-bold truncate mt-0.5">{p.artistName}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
