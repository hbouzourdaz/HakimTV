"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAppContext, StremioAddon, Channel } from "@/context/AppContext";
import { Search, Film, Tv, AlertCircle, ArrowRight, Play, X, Settings, Loader2 } from "lucide-react";

interface StremioMeta {
  id: string;
  name: string;
  description?: string;
  releaseInfo?: string;
  poster?: string;
  background?: string;
  runtime?: string;
  genre?: string[];
  type: "movie" | "series";
}

interface StremioStream {
  url: string;
  name?: string;
  title?: string;
  infoHash?: string;
  sources?: { url: string }[];
}

interface StremioCatalogResponse {
  metas: StremioMeta[];
}

interface StremioStreamResponse {
  streams: StremioStream[];
}

interface StremioEpisode {
  id: string;
  name: string;
  season?: number;
  number?: number;
}

function getImageUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("//")) return "https:" + url;
  if (url.startsWith("http")) return url;
  return url;
}

function StreamModal({
  meta,
  addonUrls,
  onClose,
  onPlay,
}: {
  meta: StremioMeta;
  addonUrls: string[];
  onClose: () => void;
  onPlay: (channel: Channel) => void;
}) {
  const [streams, setStreams] = useState<StremioStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seasons, setSeasons] = useState<number[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<StremioEpisode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    if (meta.type !== "series") return;

    const fetchEpisodes = async () => {
      setLoadingEpisodes(true);
      for (const addonUrl of addonUrls) {
        try {
          const res = await fetch(`${addonUrl}/catalog/series/${meta.id}/episodes.json`);
          if (res.ok) {
            const data = await res.json();
            if (data.episodes && data.episodes.length > 0) {
              const seasonSet = new Set<number>();
              data.episodes.forEach((ep: any) => {
                if (ep.season) seasonSet.add(ep.season);
              });
              setSeasons(Array.from(seasonSet).sort((a, b) => a - b));
              setEpisodes(data.episodes);
            }
          }
        } catch {}
      }
      setLoadingEpisodes(false);
    };

    fetchEpisodes();
  }, [meta.id, meta.type, addonUrls]);

  useEffect(() => {
    const fetchStreams = async () => {
      setLoading(true);
      setError(null);
      setStreams([]);

      let targetId = meta.id;
      if (meta.type === "series" && episodes.length > 0) {
        const ep = episodes.find(e => e.season === selectedSeason);
        if (ep) targetId = ep.id;
      }

      for (const addonUrl of addonUrls) {
        try {
          const streamUrl = `${addonUrl}/stream/${meta.type}/${targetId}.json`;
          const res = await fetch(streamUrl);
          if (res.ok) {
            const data: StremioStreamResponse = await res.json();
            if (data.streams && data.streams.length > 0) {
              setStreams(data.streams);
              setLoading(false);
              return;
            }
          }
        } catch {}
      }

      setError("لا توجد سيرفرات بث متاحة.");
      setLoading(false);
    };

    fetchStreams();
  }, [meta.id, meta.type, addonUrls, selectedSeason, episodes]);

  const handleStreamPlay = (stream: StremioStream) => {
    const streamUrl = stream.url || stream.sources?.[0]?.url;
    if (!streamUrl) return;

    if (streamUrl.startsWith('magnet:') || streamUrl.includes('infoHash') || !streamUrl.startsWith('http')) {
      setError("هذا الرابط يتطلب Debrid service. أضف Real-Debrid أو TorBox من الإعدادات.");
      return;
    }

    onPlay({
      id: Date.now(),
      name: meta.name,
      url: streamUrl,
      logo: getImageUrl(meta.poster),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111827] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="relative">
          {meta.background && (
            <div className="h-40 bg-cover bg-center rounded-t-2xl" style={{ backgroundImage: `url(${getImageUrl(meta.background)})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/60 to-transparent rounded-t-2xl" />
            </div>
          )}
          <button onClick={onClose} className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-red-600 transition z-10">
            <X size={18} />
          </button>
          <div className={`flex gap-4 p-5 ${meta.background ? '-mt-16 relative z-10' : ''}`}>
            {meta.poster && (
              <img src={getImageUrl(meta.poster)} alt={meta.name} className="w-24 h-36 object-cover rounded-xl shrink-0 shadow-lg border border-white/10" />
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-white truncate">{meta.name}</h2>
              {meta.releaseInfo && <p className="text-xs text-gray-400 mt-1">{meta.releaseInfo}</p>}
              {meta.runtime && <p className="text-xs text-gray-400">{meta.runtime} دقيقة</p>}
              {meta.genre && <p className="text-xs text-[var(--color-primary-custom)] mt-1">{meta.genre.join(" • ")}</p>}
              {meta.description && <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">{meta.description}</p>}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          {meta.type === "series" && seasons.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-gray-400 mb-2">الموسم</h4>
              <div className="flex gap-2 flex-wrap">
                {seasons.map(s => (
                  <button key={s} onClick={() => setSelectedSeason(s)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedSeason === s ? "bg-[var(--color-primary-custom)] text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                    الموسم {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <h4 className="text-xs font-bold text-gray-400 mb-3">سيرفرات البث:</h4>

          {loading && (
            <div className="flex items-center justify-center py-8 gap-2">
              <Loader2 size={20} className="animate-spin text-[var(--color-primary-custom)]" />
              <span className="text-gray-400 text-xs font-bold">جاري البحث...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-6">
              <AlertCircle size={32} className="text-red-400 mx-auto mb-2" />
              <p className="text-red-300 text-xs font-bold">{error}</p>
            </div>
          )}

          {!loading && !error && streams.length > 0 && (
            <div className="flex flex-col gap-2">
              {streams.map((stream, i) => {
                const streamUrl = stream.url || stream.sources?.[0]?.url;
                const isHttp = !!streamUrl && streamUrl.startsWith('http');
                const isTorrent = !!streamUrl && (streamUrl.startsWith('magnet:') || streamUrl.includes('infoHash') || (!streamUrl.startsWith('http') && !streamUrl.startsWith('')));
                return (
                  <button
                    key={i}
                    onClick={() => handleStreamPlay(stream)}
                    disabled={isTorrent}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-right ${isHttp ? 'bg-white/5 hover:bg-[var(--color-primary-custom)]/20 border-white/5 hover:border-[var(--color-primary-custom)]/30' : 'bg-white/2 border-white/2 opacity-50 cursor-not-allowed'}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isHttp ? 'bg-[var(--color-primary-custom)]/20' : 'bg-gray-600/20'}`}>
                      {isHttp ? <Play size={16} className="text-[var(--color-primary-custom)]" fill="currentColor" /> : <AlertCircle size={16} className="text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{stream.title || stream.name || `سيرفر ${i + 1}`}</p>
                      {isHttp ? (
                        <p className="text-gray-500 text-[10px] truncate mt-0.5" dir="ltr">{streamUrl}</p>
                      ) : (
                        <p className="text-yellow-500/70 text-[10px] mt-0.5">يتطلب Debrid service</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StremioCatalog() {
  const { state } = useAppContext();
  const addons = (state.stremioAddons || []).filter(a => a.enabled);
  const [metas, setMetas] = useState<StremioMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMeta, setSelectedMeta] = useState<StremioMeta | null>(null);
  const [filter, setFilter] = useState<"all" | "movie" | "series">("all");

  const addonUrls = addons.map(a => a.url.replace(/\/manifest\.json\/?$/, "").replace(/\/$/, ""));

  const fetchCatalog = useCallback(async () => {
    if (addonUrls.length === 0) {
      setLoading(false);
      setError("لم تُضف أي إضافة Stremio بعد. أضفها من لوحة الإدارة.");
      return;
    }

    setLoading(true);
    setError(null);
    const allMetas: StremioMeta[] = [];

    for (const addonUrl of addonUrls) {
      for (const type of ["movie", "series"]) {
        try {
          const res = await fetch(`${addonUrl}/catalog/${type}/top.json`);
          if (res.ok) {
            const data: StremioCatalogResponse = await res.json();
            if (data.metas) {
              allMetas.push(...data.metas.map(m => ({ ...m, type: m.type || type as any })));
            }
          }
        } catch {}
      }
    }

    if (allMetas.length === 0) {
      setError("لم يتم العثور على محتوى. تأكد من صحة روابط الإضافات.");
    }

    setMetas(allMetas);
    setLoading(false);
  }, [addonUrls.join(",")]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const filteredMetas = metas.filter(m => {
    const matchFilter = filter === "all" || m.type === filter;
    const matchSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handlePlay = (channel: Channel) => {
    const event = new CustomEvent('stremio-play', { detail: channel });
    window.dispatchEvent(event);
  };

  if (loading) {
    return (
      <div className="view-section active flex flex-col items-center justify-center p-20 text-white font-bold h-full w-full pb-20">
        <Loader2 size={40} className="animate-spin text-[var(--color-primary-custom)] mb-4" />
        <span>جاري تحميل المحتوى...</span>
      </div>
    );
  }

  return (
    <div className="view-section active px-4 lg:px-10 py-6 h-full w-full pb-20 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <Film size={28} className="text-[var(--color-primary-custom)]" />
          الأفلام والمسلسلات
        </h2>
        {addons.length > 0 && (
          <span className="text-[10px] bg-white/5 border border-white/10 text-gray-400 font-bold px-2.5 py-1 rounded-full">
            {addons.length} إضافات
          </span>
        )}
      </div>

      {addons.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث عن فيلم أو مسلسل..."
              className="sport-input !pr-14 w-full"
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: "all" as const, label: "الكل", icon: "🎬" },
              { key: "movie" as const, label: "أفلام", icon: "🎥" },
              { key: "series" as const, label: "مسلسلات", icon: "📺" },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${filter === f.key ? "bg-[var(--color-primary-custom)] text-white border-[var(--color-primary-custom)]" : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"}`}>
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-[11px] font-bold leading-relaxed">
        ⚠️ لمشاهدة الأفلام والمسلسلات تحتاج <span className="text-white font-black">Debrid Service</span> مثل Real-Debrid أو TorBox (يبدأ من $5/شهر). أضف مفاتيحك من لوحة الإدارة ← الإعدادات. بدون Debrid ستجد فقط الكتالوج بدون روابط بث.
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Film size={32} className="text-white/20" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{error}</h3>
          <p className="text-sm text-gray-400">أضف إضافات Stremio من لوحة الإدارة ← الإعدادات</p>
        </div>
      ) : filteredMetas.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 font-bold">لا توجد نتائج</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
          {filteredMetas.map((meta, i) => (
            <div
              key={`${meta.id}-${i}`}
              onClick={() => setSelectedMeta(meta)}
              className="group cursor-pointer rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-[var(--color-primary-custom)]/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                {meta.poster ? (
                  <img src={getImageUrl(meta.poster)} alt={meta.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <Film size={32} className="text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-2 right-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-1.5 bg-[var(--color-primary-custom)] rounded-lg px-3 py-2 justify-center">
                    <Play size={14} className="text-white" fill="currentColor" />
                    <span className="text-white text-[10px] font-black">مشاهدة</span>
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${meta.type === "movie" ? "bg-blue-600/90 text-blue-100" : "bg-purple-600/90 text-purple-100"}`}>
                    {meta.type === "movie" ? "فيلم" : "مسلسل"}
                  </span>
                </div>
              </div>
              <div className="p-2.5">
                <h3 className="text-white text-xs font-bold truncate">{meta.name}</h3>
                {meta.releaseInfo && <p className="text-gray-500 text-[10px] mt-0.5">{meta.releaseInfo}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMeta && (
        <StreamModal meta={selectedMeta} addonUrls={addonUrls} onClose={() => setSelectedMeta(null)} onPlay={handlePlay} />
      )}
    </div>
  );
}
