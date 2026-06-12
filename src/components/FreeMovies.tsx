"use client";
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useAppContext, Channel } from "@/context/AppContext";
import { Search, Film, Play, X, Loader2, AlertCircle, ChevronLeft, ChevronRight, Tv, SlidersHorizontal, ArrowUpDown, Tag } from "lucide-react";

const OMDb_KEY = "trilogy";

const INAPPROPRIATE_KEYWORDS = [
  "sex tape", "nude", "naked", "porn", "xxx", "erotic", "adult", "hustler",
  "playboy", "girls gone", "bad babes", "hot tub", "shawty", "sexy",
  "lady chatterley", "9½ weeks", "basic instinct", "showgirls",
  "fifty shades", "original sin", "emmanuelle", "y tu mama",
  "intimacy", "lust caution", "killer joe", "the dreamers",
  "shortbus", "caligula", "deep throat",
];

const GENRES = [
  "الكل", "أكشن", "كوميدي", "دراما", "رعب", "خيال علمي", "مغامرة",
  "جريمة", "رومانسي", "фанタازيا", "وثائقي", "عائلي", "حرب",
  "غربية", "تاريخي", "موسيقي", "غرائب", "إثارة",
];

const GENRE_MAP: Record<string, string[]> = {
  "أكشن": ["Action"],
  "كوميدي": ["Comedy"],
  "دراما": ["Drama"],
  "رعب": ["Horror"],
  "خيال علمي": ["Sci-Fi", "Science Fiction"],
  "مغامرة": ["Adventure"],
  "جريمة": ["Crime", "Mystery"],
  "رومانسي": ["Romance", "Romantic"],
  "фанタازيا": ["Fantasy"],
  "وثائقي": ["Documentary", "Documentary"],
  "عائلي": ["Family", "Kids"],
  "حرب": ["War"],
  "غربية": ["Western"],
  "تاريخي": ["History", "Biography"],
  "موسيقي": ["Music", "Musical"],
  "غرائب": ["Mystery"],
  "إثارة": ["Thriller"],
};

const YEAR_FILTERS = [
  { label: "الكل", value: "all" },
  { label: "2024+", value: "2024s" },
  { label: "2020s", value: "2020s" },
  { label: "2010s", value: "2010s" },
  { label: "2000s", value: "2000s" },
  { label: "كلاسيكي", value: "classic" },
];

const SORT_OPTIONS = [
  { label: "الأحدث", value: "latest" },
  { label: "الأحدث أولاً", value: "year_desc" },
  { label: "الأقدم أولاً", value: "year_asc" },
  { label: "أبجدي", value: "az" },
];

function isAppropriate(title: string): boolean {
  if (!title) return false;
  const lower = title.toLowerCase();
  return !INAPPROPRIATE_KEYWORDS.some(kw => lower.includes(kw));
}

function getYearDecade(year: number | null): string {
  if (!year) return "other";
  if (year >= 2024) return "2024s";
  if (year >= 2020) return "2020s";
  if (year >= 2010) return "2010s";
  if (year >= 2000) return "2000s";
  return "classic";
}

function getImageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("//")) return "https:" + url;
  return url;
}

async function fetchGenre(imdbId: string): Promise<string[]> {
  try {
    const id = imdbId.startsWith("tt") ? imdbId : `tt${imdbId}`;
    const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${OMDb_KEY}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.Genre) return data.Genre.split(", ").map((g: string) => g.trim());
  } catch {}
  return [];
}

function matchesGenre(genres: string[], filterAr: string): boolean {
  if (filterAr === "الكل") return true;
  const arKeywords = GENRE_MAP[filterAr] || [];
  return arKeywords.some(kw => genres.some(g => g.toLowerCase().includes(kw.toLowerCase())));
}

function EpisodeModal({ item, onClose, onPlay }: { item: any; onClose: () => void; onPlay: (url: string, name: string, logo: string) => void }) {
  const [seasonCount, setSeasonCount] = useState(10);
  const [episodeCount, setEpisodeCount] = useState(20);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const id = item.imdb_id || item.tmdb_id;
        const res = await fetch(`https://apiplayer.ru/embed/tv/${id}/1/1`);
        const html = await res.text();
        const sm = html.match(/"seasonNum":(\d+)/);
        const em = html.match(/"episodeNum":(\d+)/);
        if (sm) setSeasonCount(Math.max(parseInt(sm[1]), 10));
        if (em) setEpisodeCount(Math.max(parseInt(em[1]), 20));
      } catch {}
    };
    fetchInfo();
  }, [item]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111827] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="relative">
          {item.poster && (
            <div className="h-36 bg-cover bg-center rounded-t-2xl" style={{ backgroundImage: `url(${getImageUrl(item.poster)})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/60 to-transparent rounded-t-2xl" />
            </div>
          )}
          <button onClick={onClose} className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-red-600 transition z-10">
            <X size={18} />
          </button>
          <div className={`flex gap-4 p-5 ${item.poster ? '-mt-12 relative z-10' : ''}`}>
            {item.poster && <img src={getImageUrl(item.poster)} alt={item.title} className="w-20 h-28 object-cover rounded-xl shrink-0 shadow-lg border border-white/10" />}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-white truncate">{item.title}</h2>
              {item.year && <p className="text-xs text-gray-400 mt-1">{item.year}</p>}
              {item.genres && item.genres.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {item.genres.slice(0, 3).map((g: string) => (
                    <span key={g} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-gray-300">{g}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <h4 className="text-xs font-bold text-gray-400 mb-2">الموسم</h4>
          <div className="flex gap-2 flex-wrap mb-4">
            {Array.from({ length: seasonCount }, (_, i) => i + 1).map(s => (
              <button key={s} onClick={() => setSelectedSeason(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${selectedSeason === s ? "bg-[var(--color-primary-custom)] text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                {s}
              </button>
            ))}
          </div>

          <h4 className="text-xs font-bold text-gray-400 mb-2">الحلقة</h4>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: episodeCount }, (_, i) => i + 1).map(e => (
              <button key={e} onClick={() => {
                const url = `https://apiplayer.ru/hls-proxy/master/${item.imdb_id}/${selectedSeason}/${e}`;
                onPlay(url, `${item.title} - S${selectedSeason}E${e}`, getImageUrl(item.poster));
              }} className="px-3 py-2 rounded-lg bg-white/5 text-white text-[10px] font-bold hover:bg-[var(--color-primary-custom)]/30 transition border border-white/5">
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FreeMovies() {
  const [items, setItems] = useState<any[]>([]);
  const [genreCache, setGenreCache] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState("");
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [contentType, setContentType] = useState<"movie" | "tv">("movie");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [yearFilter, setYearFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("الكل");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);
  const genreFetchingRef = useRef<Set<string>>(new Set());

  const fetchGenresForItems = useCallback(async (itemsToFetch: any[]) => {
    const itemsNeedingGenres = itemsToFetch.filter(item => {
      const id = item.imdb_id || item.tmdb_id;
      return id && !genreCache[id] && !genreFetchingRef.current.has(id);
    });

    if (itemsNeedingGenres.length === 0) return;

    setLoadingGenres(true);
    const batch = itemsNeedingGenres.slice(0, 12);

    const promises = batch.map(async (item) => {
      const id = item.imdb_id || item.tmdb_id;
      if (!id || genreFetchingRef.current.has(id)) return;
      genreFetchingRef.current.add(id);

      try {
        const genres = await fetchGenre(item.imdb_id || item.tmdb_id);
        if (genres.length > 0) {
          setGenreCache(prev => ({ ...prev, [id]: genres }));
        }
      } catch {}
    });

    await Promise.allSettled(promises);
    setLoadingGenres(false);
  }, [genreCache]);

  const fetchData = useCallback(async (type: "movie" | "tv") => {
    setLoading(true);
    setLoadingProgress("جاري تحميل أولى الصفحات...");
    setError(null);
    setAllLoaded(false);

    const fetchPage = async (p: number) => {
      const endpoint = type === "movie"
        ? `https://apiplayer.ru/movies/latest/page-${p}.json`
        : `https://apiplayer.ru/tvshows/latest/page-${p}.json`;
      const res = await fetch(endpoint);
      if (!res.ok) return { result: [], total_pages: 1 };
      return res.json();
    };

    try {
      // Fetch first 5 pages in parallel for fast initial load
      const firstBatch = await Promise.all([1, 2, 3, 4, 5].map(p => fetchPage(p).catch(() => ({ result: [] }))));
      const firstData = firstBatch[0];
      const pages = firstData.total_pages || 1;
      setTotalPages(pages);

      const allItems: any[] = [];
      for (const data of firstBatch) {
        const items = (data.result || [])
          .filter((m: any) => m.title && m.title !== "Movie" && m.title !== "TV Show" && (m.tmdb_id || m.imdb_id) && isAppropriate(m.title))
          .map((m: any) => ({ ...m, type }));
        allItems.push(...items);
      }

      setItems(allItems);
      setLoading(false);
      setLoadingProgress("");

      // Load remaining pages in background
      const remainingPages = [];
      for (let p = 6; p <= pages; p++) remainingPages.push(p);

      const BATCH = 10;
      for (let i = 0; i < remainingPages.length; i += BATCH) {
        const batch = remainingPages.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(p => fetchPage(p).catch(() => ({ result: [] }))));
        const newItems: any[] = [];
        for (const data of results) {
          const items = (data.result || [])
            .filter((m: any) => m.title && m.title !== "Movie" && m.title !== "TV Show" && (m.tmdb_id || m.imdb_id) && isAppropriate(m.title))
            .map((m: any) => ({ ...m, type }));
          newItems.push(...items);
        }
        setItems(prev => [...prev, ...newItems]);
      }
      setAllLoaded(true);
    } catch (e: any) {
      setError(e.message || "خطأ غير معروف");
      setLoading(false);
      setLoadingProgress("");
    }
  }, []);

  useEffect(() => {
    fetchData(contentType);
  }, [contentType, fetchData]);

  useEffect(() => {
    setPage(1);
  }, [contentType]);

  useEffect(() => {
    if (items.length > 0) {
      fetchGenresForItems(items);
    }
  }, [items, fetchGenresForItems]);

  const ITEMS_PER_PAGE = 20;

  const filteredAndSorted = useMemo(() => {
    let result = items;

    if (searchQuery) {
      result = result.filter(m => m.title?.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (yearFilter !== "all") {
      result = result.filter(m => getYearDecade(m.year) === yearFilter);
    }

    if (genreFilter !== "الكل") {
      result = result.filter(m => {
        const id = m.imdb_id || m.tmdb_id;
        const genres = genreCache[id] || [];
        return genres.length === 0 || matchesGenre(genres, genreFilter);
      });
    }

    if (sortBy === "year_desc") {
      result = [...result].sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortBy === "year_asc") {
      result = [...result].sort((a, b) => (a.year || 0) - (b.year || 0));
    } else if (sortBy === "az") {
      result = [...result].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    return result;
  }, [items, searchQuery, yearFilter, genreFilter, sortBy, genreCache]);

  const localTotalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE));
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredAndSorted.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSorted, page]);

  const handlePlay = (url: string, name: string, logo: string) => {
    const channel: Channel = { id: Date.now(), name, url, logo };
    window.dispatchEvent(new CustomEvent("stremio-play", { detail: channel }));
  };

  const handleItemClick = (item: any) => {
    const id = item.imdb_id || item.tmdb_id;
    const genres = genreCache[id] || [];
    const enrichedItem = { ...item, genres };

    if (item.type === "tv") {
      setSelectedItem(enrichedItem);
    } else {
      const url = `https://apiplayer.ru/hls-proxy/master/${item.imdb_id}`;
      handlePlay(url, item.title, getImageUrl(item.poster));
    }
  };

  return (
    <div className="view-section active px-4 lg:px-10 py-6 h-full w-full pb-20 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <Film size={28} className="text-[var(--color-primary-custom)]" />
          المحتوى المجاني
        </h2>
        <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold px-2.5 py-1 rounded-full">
          مجاني 100%
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`ابحث عن ${contentType === "movie" ? "فيلم" : "مسلسل"}...`}
            className="sport-input !pr-14 w-full"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setContentType("movie")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${contentType === "movie" ? "bg-[var(--color-primary-custom)] text-white border-[var(--color-primary-custom)]" : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"}`}
          >
            <Film size={14} /> أفلام
          </button>
          <button
            onClick={() => setContentType("tv")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${contentType === "tv" ? "bg-[var(--color-primary-custom)] text-white border-[var(--color-primary-custom)]" : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"}`}
          >
            <Tv size={14} /> مسلسلات
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${showFilters ? "bg-[var(--color-primary-custom)] text-white border-[var(--color-primary-custom)]" : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"}`}
          >
            <SlidersHorizontal size={14} /> فلتر
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="mb-3">
            <label className="text-[10px] font-bold text-gray-400 mb-2 flex items-center gap-1">
              <Tag size={10} /> التصنيف
              {loadingGenres && <Loader2 size={10} className="animate-spin" />}
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {GENRES.map(g => (
                <button key={g} onClick={() => setGenreFilter(g)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${genreFilter === g ? "bg-[var(--color-primary-custom)] text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="text-[10px] font-bold text-gray-400 mb-2 block">الفترة الزمنية</label>
            <div className="flex gap-1.5 flex-wrap">
              {YEAR_FILTERS.map(f => (
                <button key={f.value} onClick={() => setYearFilter(f.value)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${yearFilter === f.value ? "bg-[var(--color-primary-custom)] text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 mb-2 block">ترتيب حسب</label>
            <div className="flex gap-1.5 flex-wrap">
              {SORT_OPTIONS.map(s => (
                <button key={s.value} onClick={() => setSortBy(s.value)} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${sortBy === s.value ? "bg-[var(--color-primary-custom)] text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                  <ArrowUpDown size={8} /> {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && (searchQuery || yearFilter !== "all" || genreFilter !== "الكل") && (
        <div className="mb-4 text-center">
          <span className="text-[10px] text-gray-500 font-bold bg-white/5 px-3 py-1.5 rounded-lg">
            {filteredAndSorted.length} نتيجة من أصل {items.length}
            {!allLoaded && " (جاري تحميل باقي المحتوى...)"}
          </span>
        </div>
      )}

      {!loading && filteredAndSorted.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-4 p-2 rounded-xl bg-white/5 border border-white/10 overflow-x-auto">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg bg-white/5 text-white text-[10px] font-bold border border-white/10 hover:bg-white/10 disabled:opacity-30 transition shrink-0"
          >
            <ChevronRight size={12} />
            <span className="hidden sm:inline">السابق</span>
          </button>
          <div className="flex items-center gap-1 shrink-0">
            {Array.from({ length: Math.min(5, localTotalPages) }, (_, i) => {
              let pageNum: number;
              if (localTotalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= localTotalPages - 2) {
                pageNum = localTotalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] font-bold transition-all ${page === pageNum ? "bg-[var(--color-primary-custom)] text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setPage(p => Math.min(localTotalPages, p + 1))}
            disabled={page >= localTotalPages}
            className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg bg-white/5 text-white text-[10px] font-bold border border-white/10 hover:bg-white/10 disabled:opacity-30 transition shrink-0"
          >
            <span className="hidden sm:inline">التالي</span>
            <ChevronLeft size={12} />
          </button>
          <span className="text-gray-500 text-[10px] font-bold shrink-0">
            {page}/{localTotalPages}
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-[var(--color-primary-custom)] mb-4" />
          <span className="text-gray-400 font-bold">جاري تحميل المحتوى...</span>
          <span className="text-gray-600 text-[10px] font-bold mt-2">يتم تحميل باقي الصفحات في الخلفية</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card p-8 max-w-lg mx-auto">
          <AlertCircle size={32} className="text-red-400 mb-2" />
          <p className="text-red-300 text-sm font-bold">{error}</p>
          <button onClick={() => fetchData(contentType)} className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary-custom)] text-white text-xs font-bold">
            إعادة المحاولة
          </button>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 font-bold">لا توجد نتائج</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
          {paginatedItems.map((item: any, i: number) => {
            const id = item.imdb_id || item.tmdb_id;
            const genres = genreCache[id] || [];
            return (
              <div
                key={`${id}-${i}`}
                onClick={() => handleItemClick(item)}
                className="group cursor-pointer rounded-lg overflow-hidden bg-white/5 border border-white/5 hover:border-[var(--color-primary-custom)]/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[2/3] overflow-hidden">
                  {item.poster ? (
                    <img src={getImageUrl(item.poster)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <Film size={24} className="text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-1.5 right-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-1 bg-[var(--color-primary-custom)] rounded-md px-2 py-1.5 justify-center">
                      <Play size={10} className="text-white" fill="currentColor" />
                      <span className="text-white text-[8px] font-black">{item.type === "tv" ? "حلقات" : "مشاهدة"}</span>
                    </div>
                  </div>
                  <div className="absolute top-1 right-1">
                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded ${item.type === "movie" ? "bg-blue-600/90 text-blue-100" : "bg-purple-600/90 text-purple-100"}`}>
                      {item.type === "movie" ? "فيلم" : "مسلسل"}
                    </span>
                  </div>
                  {item.year && (
                    <div className="absolute top-1 left-1">
                      <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-black/60 text-white">
                        {item.year}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-1.5">
                  <h3 className="text-white text-[10px] font-bold truncate">{item.title}</h3>
                  {genres.length > 0 && (
                    <div className="flex gap-1 mt-1 overflow-hidden">
                      {genres.slice(0, 2).map((g: string) => (
                        <span key={g} className="text-[8px] font-bold px-1 py-0.5 rounded bg-white/10 text-gray-400 truncate">{g}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedItem && (
        <EpisodeModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onPlay={(url, name, logo) => handlePlay(url, name, logo)}
        />
      )}
    </div>
  );
}
