"use client";
import { useState, useEffect, useRef } from "react";
import { Radio, Play, Pause, Search, Volume2, Globe, Loader2, Heart, AlertCircle, SkipForward, SkipBack } from "lucide-react";

type RadioStation = {
  changeuuid: string;
  name: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  country: string;
  countrycode: string;
  language: string;
  tags: string;
  votes: number;
  codec: string;
  bitrate: number;
};

const CATEGORIES = [
  { label: "الكل", value: "all" },
  { label: "عربي", value: "arab" },
  { label: "新闻", value: "news" },
  { label: "موسيقى", value: "music" },
  { label: "رياضة", value: "sports" },
  { label: "أناشيد", value: "nasheed" },
];

export default function LiveRadio() {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [filtered, setFiltered] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchStations();
    const saved = localStorage.getItem("radio_favorites");
    if (saved) setFavorites(JSON.parse(saved));

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

  useEffect(() => {
    localStorage.setItem("radio_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    let result = stations;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q) || s.country.toLowerCase().includes(q) || s.tags.toLowerCase().includes(q));
    }
    if (category === "arab") {
      result = result.filter(s => s.countrycode === "EG" || s.countrycode === "SA" || s.countrycode === "AE" || s.countrycode === "MA" || s.countrycode === "TN" || s.countrycode === "DZ" || s.countrycode === "IQ" || s.countrycode === "JO" || s.countrycode === "LB" || s.countrycode === "KW" || s.countrycode === "QA" || s.countrycode === "BH" || s.countrycode === "OM" || s.countrycode === "YE" || s.countrycode === "SY" || s.countrycode === "PS" || s.countrycode === "LY" || s.countrycode === "SD" || s.countrycode === "SO" || s.countrycode === "DJ" || s.countrycode === "KM");
    } else if (category !== "all") {
      result = result.filter(s => s.tags.toLowerCase().includes(category));
    }
    setFiltered(result);
  }, [stations, search, category]);

  const fetchStations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://de1.api.radio-browser.info/json/stations/topvote/200?limit=200&order=votes&reverse=true");
      if (!res.ok) throw new Error("فشل تحميل المحطات");
      const data = await res.json();
      setStations(data);
    } catch (e: any) {
      setError(e.message || "خطأ غير معروف");
    } finally {
      setLoading(false);
    }
  };

  const playStation = (station: RadioStation) => {
    if (currentStation?.changeuuid === station.changeuuid && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    window.dispatchEvent(new Event('stop-all-audio'));
    const audio = new Audio(station.url_resolved);
    audioRef.current = audio;
    audio.play().then(() => {
      setCurrentStation(station);
      setIsPlaying(true);
    }).catch(() => {
      setError("فشل تشغيل المحطة");
    });
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const playNext = () => {
    const idx = filtered.findIndex(s => s.changeuuid === currentStation?.changeuuid);
    if (idx < filtered.length - 1) playStation(filtered[idx + 1]);
  };

  const playPrev = () => {
    const idx = filtered.findIndex(s => s.changeuuid === currentStation?.changeuuid);
    if (idx > 0) playStation(filtered[idx - 1]);
  };

  return (
    <div className="view-section active px-4 lg:px-10 py-6 h-full w-full pb-20 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-3">
          <Radio size={28} className="text-[var(--color-primary-custom)]" />
          الراديو المباشر
        </h2>
        <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold px-2.5 py-1 rounded-full">
          مجاني
        </span>
      </div>

      {/* Now Playing Bar */}
      {currentStation && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-[var(--color-primary-custom)]/20 to-transparent border border-[var(--color-primary-custom)]/30">
          <div className="flex items-center gap-3">
            {currentStation.favicon ? (
              <img src={currentStation.favicon} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/10" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-custom)]/30 flex items-center justify-center">
                <Radio size={20} className="text-[var(--color-primary-custom)]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{currentStation.name}</p>
              <p className="text-gray-400 text-[10px] font-bold">{currentStation.country} · {currentStation.language}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={playPrev} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
                <SkipBack size={14} />
              </button>
              <button onClick={() => currentStation && playStation(currentStation)} className="w-10 h-10 rounded-xl bg-[var(--color-primary-custom)] flex items-center justify-center text-white shadow-lg hover:scale-105 transition">
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
          placeholder="ابحث عن محطة..."
          className="sport-input !pr-12 w-full"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`shrink-0 px-4 py-2 rounded-xl text-[11px] font-bold border transition-all ${category === c.value ? "bg-[var(--color-primary-custom)] text-white border-[var(--color-primary-custom)]" : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-[var(--color-primary-custom)] mb-4" />
          <span className="text-gray-400 font-bold">جاري تحميل المحطات...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle size={32} className="text-red-400 mb-2" />
          <p className="text-red-300 text-sm font-bold">{error}</p>
          <button onClick={fetchStations} className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary-custom)] text-white text-xs font-bold">
            إعادة المحاولة
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 font-bold">لا توجد محطات</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(station => (
            <div
              key={station.changeuuid}
              onClick={() => playStation(station)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer active:scale-[0.98] ${currentStation?.changeuuid === station.changeuuid && isPlaying ? "bg-[var(--color-primary-custom)]/10 border-[var(--color-primary-custom)]/30" : "bg-white/[0.03] border-white/5 hover:border-white/15 hover:bg-white/[0.06]"}`}
            >
              {station.favicon ? (
                <img src={station.favicon} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/10 shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Radio size={18} className="text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold truncate">{station.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-gray-500 text-[9px] font-bold">{station.country}</span>
                  {station.bitrate > 0 && <span className="text-gray-600 text-[9px]">{station.bitrate}kbps</span>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={e => { e.stopPropagation(); toggleFavorite(station.changeuuid); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition"
                >
                  <Heart size={14} className={favorites.includes(station.changeuuid) ? "text-red-400 fill-red-400" : "text-gray-500"} />
                </button>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentStation?.changeuuid === station.changeuuid && isPlaying ? "bg-[var(--color-primary-custom)]" : "bg-white/10"} transition`}>
                  {currentStation?.changeuuid === station.changeuuid && isPlaying ? (
                    <Pause size={14} className="text-white" />
                  ) : (
                    <Play size={14} className="text-white" fill="currentColor" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
