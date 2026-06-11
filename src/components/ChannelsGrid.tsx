"use client";
import React, { useState } from "react";
import { Search, X, Tv, Zap, ChevronLeft, ArrowRight } from "lucide-react";
import { useAppContext, Channel } from "@/context/AppContext";

export default function ChannelsGrid({ onPlay }: { onPlay: (ch: Channel) => void }) {
  const { state, loading } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [logoErrors, setLogoErrors] = useState<Record<number, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="view-section active flex flex-col items-center justify-center p-20 text-white font-bold h-full w-full pb-20">
        <div className="w-12 h-12 border-4 border-[var(--color-primary-custom)] border-t-transparent rounded-full animate-spin mb-4"></div>
        <span>جاري تحميل القنوات المتاحة...</span>
      </div>
    );
  }

  const handleLogoError = (id: number) => {
    setLogoErrors((prev) => ({ ...prev, [id]: true }));
  };

  const getGradientClass = (name: string) => {
    const gradients = [
      "from-violet-600 to-indigo-800",
      "from-rose-500 to-violet-700",
      "from-cyan-500 to-blue-700",
      "from-emerald-500 to-teal-700",
      "from-amber-500 to-red-600",
      "from-fuchsia-600 to-pink-700"
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return gradients[sum % gradients.length];
  };

  const getCategoryIcon = (name: string) => {
    const icons: Record<string, string> = {
      "رياضة": "⚽", "sport": "⚽", "sports": "⚽",
      "أفلام": "🎬", "movies": "🎬", "cinema": "🎬",
      "أطفال": "🧸", "kids": "🧸",
      "وثائقية": "🌍", "documentary": "🌍",
      "أخبار": "📰", "news": "📰",
      "ترفيه": "🎭", "entertainment": "🎭",
      "موسيقى": "🎵", "music": "🎵",
    };
    const lower = name.toLowerCase();
    for (const key of Object.keys(icons)) {
      if (lower.includes(key)) return icons[key];
    }
    return "📺";
  };

  // Use categories from state (managed in AdminPanel)
  const categories = state.categories || [];

  // Get short display name
  const getShortName = (name: string) => {
    const parts = name.replace(/bein\s*/i, "").trim();
    return parts || name;
  };

  // Arabic channel count formatter
  const getChannelCountText = (count: number) => {
    if (count === 0) return "لا توجد قنوات";
    if (count === 1) return "قناة واحدة";
    if (count === 2) return "قناتان";
    if (count >= 3 && count <= 10) return `${count} قنوات`;
    return `${count} قناة`;
  };

  // Find subcategories if a category is selected
  const subcategories = selectedCategory 
    ? categories.filter(c => c.parent === selectedCategory)
    : categories.filter(c => !c.parent);

  // Channels for the selected category
  const categoryChannels = selectedCategory
    ? state.channels.filter(ch => ch.category === selectedCategory)
    : [];

  const filteredChannels = categoryChannels.filter((ch) =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBack = () => {
    if (!selectedCategory) return;
    const catData = categories.find(c => c.name === selectedCategory);
    if (catData && catData.parent) {
      setSelectedCategory(catData.parent);
    } else {
      setSelectedCategory(null);
    }
    setSearchQuery("");
  };

  // ==================== CATEGORY VIEW ====================
  if (!selectedCategory) {
    return (
      <div className="view-section active px-4 lg:px-10 py-4 h-full w-full pb-20 flex flex-col overflow-hidden">
        {/* Welcome Section */}
        <div className="mb-6 p-6 rounded-2xl glass-card relative overflow-hidden border border-white/5 bg-gradient-to-br from-[var(--color-primary-custom)]/15 via-black/30 to-black/50 text-right shrink-0" dir="rtl">
          {/* Animated/Glowing background circles */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-[var(--color-primary-custom)]/25 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full"></div>
          
          <div className="relative z-10">
            <h1 className="text-xl lg:text-2xl font-black text-white mb-2 flex items-center gap-2">
              <span className="animate-bounce inline-block">👋</span>
              مرحباً بك في <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[var(--color-primary-custom)] to-purple-400 font-extrabold">{state.settings.appName || "Hakim TV"}</span>
            </h1>
            <p className="text-xs lg:text-sm text-gray-300/90 leading-relaxed font-semibold max-w-2xl">
              منصتك المفضلة لمشاهدة البث المباشر لأقوى القنوات الرياضية والترفيهية ومتابعة جدول المباريات اليومية بجودة عالية ودون انقطاع.
            </p>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center gap-2 mb-5 shrink-0" dir="rtl">
          <Zap size={20} className="text-yellow-400" />
          <h2 className="text-xl font-black text-white">باقات القنوات</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {subcategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-xl p-8 max-w-lg mx-auto mt-6">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/20">
                <Tv size={28} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">لا توجد قنوات بعد</h3>
              <p className="text-sm text-gray-400">أضف قنوات من لوحة الإدارة وحدد لها تصنيفات.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
              {subcategories.map((cat: any, idx: number) => {
                const catName = typeof cat === 'string' ? cat : cat.name;
                const catIcon = typeof cat === 'string' ? '' : (cat.icon || '');
                const count = state.channels.filter(ch => ch.category === catName).length;
                const fallbackEmoji = getCategoryIcon(catName);
                
                return (
                  <button
                    key={`${catName}-${idx}`}
                    onClick={() => setSelectedCategory(catName)}
                    className="glass-card p-4 flex flex-row-reverse items-center gap-4 cursor-pointer hover-lift group active:scale-95 w-full"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    dir="rtl"
                  >
                    {/* Icon - appears on right in RTL */}
                    <div className="w-12 h-12 rounded-2xl bg-black/45 border border-white/10 flex items-center justify-center shadow-inner group-hover:border-[var(--color-primary-custom)]/40 transition-all overflow-hidden shrink-0">
                      {catIcon ? (
                        <img src={catIcon} alt={catName} className="w-full h-full object-contain p-2 transform group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <span className="text-2xl select-none leading-none flex items-center justify-center h-full w-full transform group-hover:scale-110 transition-transform duration-300">
                          {fallbackEmoji}
                        </span>
                      )}
                    </div>

                    {/* Text - center */}
                    <div className="flex flex-col flex-1 min-w-0 text-right">
                      <span className="text-sm lg:text-base font-black text-white leading-tight truncate group-hover:text-[var(--color-primary-custom)] transition-colors">{catName}</span>
                      <span className="text-xs text-gray-400 font-semibold mt-0.5">{getChannelCountText(count)}</span>
                    </div>

                    {/* Chevron - appears on left in RTL, indicating drill-in */}
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-[var(--color-primary-custom)]/20 group-hover:border-[var(--color-primary-custom)]/30 transition-all shrink-0">
                      <ChevronLeft size={16} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== CHANNELS VIEW (inside a category) ====================
  return (
    <div className="view-section active px-4 lg:px-10 py-4 h-full w-full pb-20 flex flex-col overflow-hidden">
      {/* Back + Title */}
      <div className="flex items-center gap-3 mb-4 shrink-0" dir="rtl">
        <button
          onClick={handleBack}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors active:scale-90 shrink-0"
        >
          <ArrowRight size={18} />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{getCategoryIcon(selectedCategory)}</span>
          <h2 className="text-lg font-black text-white truncate">{selectedCategory}</h2>
          <span className="text-xs text-gray-400 font-semibold shrink-0">({filteredChannels.length})</span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 shrink-0">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن قناة..."
            className="sport-input text-sm font-semibold text-white/90 placeholder-white/40 !py-3 !pr-12 !pl-12"
            dir="rtl"
          />
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* SUBCATEGORIES (if any) */}
        {subcategories.length > 0 && !searchQuery && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[var(--color-primary-custom)] mb-3 pr-2">تصنيفات فرعية</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subcategories.map((cat: any, idx: number) => {
                const catName = typeof cat === 'string' ? cat : cat.name;
                const catIcon = typeof cat === 'string' ? '' : (cat.icon || '');
                const count = state.channels.filter(ch => ch.category === catName).length;
                const fallbackEmoji = getCategoryIcon(catName);
                return (
                  <button
                    key={`${catName}-${idx}`}
                    onClick={() => { setSelectedCategory(catName); setSearchQuery(""); }}
                    className="glass-card p-4 flex flex-row-reverse items-center gap-4 cursor-pointer hover-lift group active:scale-95 w-full"
                    dir="rtl"
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-black/45 border border-white/10 flex items-center justify-center shadow-inner group-hover:border-[var(--color-primary-custom)]/40 transition-all overflow-hidden shrink-0">
                      {catIcon ? (
                        <img src={catIcon} alt={catName} className="w-full h-full object-contain p-2 transform group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <span className="text-2xl select-none leading-none flex items-center justify-center h-full w-full transform group-hover:scale-110 transition-transform duration-300">
                          {fallbackEmoji}
                        </span>
                      )}
                    </div>
                    {/* Text */}
                    <div className="flex flex-col flex-1 min-w-0 text-right">
                      <span className="text-sm lg:text-base font-black text-white leading-tight truncate group-hover:text-[var(--color-primary-custom)] transition-colors">{catName}</span>
                      <span className="text-xs text-gray-400 font-semibold mt-0.5">{getChannelCountText(count)}</span>
                    </div>
                    {/* Chevron */}
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-[var(--color-primary-custom)]/20 group-hover:border-[var(--color-primary-custom)]/30 transition-all shrink-0">
                      <ChevronLeft size={16} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CHANNELS */}
        {(filteredChannels.length === 0 && subcategories.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-xl p-8 max-w-lg mx-auto mt-6">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/20">
              <Tv size={28} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">لا توجد قنوات</h3>
            <p className="text-sm text-gray-400">
              {searchQuery ? `لم نجد نتائج تطابق "${searchQuery}".` : "لا توجد قنوات في هذا التصنيف."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6">
            {filteredChannels.map((ch, idx) => {
              const hasLogo = ch.logo && !logoErrors[ch.id];
              const nameAbbr = ch.name.replace(/[^a-zA-Z0-9\u0621-\u064A]/g, "").substring(0, 2).toUpperCase();
              const shortName = getShortName(ch.name);
              
              return (
                <button
                  key={ch.id}
                  onClick={() => onPlay(ch)}
                  className="relative glass-card p-3.5 flex flex-row items-center gap-4 cursor-pointer hover-lift group active:scale-95 transition-transform"
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  {/* LIVE Badge */}
                  <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[8px] px-1.5 py-0.5 rounded-sm font-black tracking-wider uppercase border border-red-500/50 shadow-sm shadow-red-900/50">
                    LIVE
                  </div>

                  {/* Logo */}
                  <div className="shrink-0 w-12 h-12 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center p-1.5 shadow-inner group-hover:border-[var(--color-primary-custom)]/40 transition-colors">
                    {hasLogo ? (
                      <img
                        src={ch.logo}
                        alt={ch.name}
                        onError={() => handleLogoError(ch.id)}
                        className="w-full h-full object-contain drop-shadow-md"
                      />
                    ) : (
                      <div className={`w-full h-full rounded-lg bg-gradient-to-br ${getGradientClass(ch.name)} flex items-center justify-center text-white font-bold text-sm shadow-inner`}>
                        {nameAbbr || "TV"}
                      </div>
                    )}
                  </div>

                  {/* Text Container */}
                  <div className="flex flex-col flex-1 min-w-0 text-right pr-1">
                    <span className="text-sm font-black text-white truncate w-full" dir="ltr">
                      {shortName}
                    </span>
                    <span className="text-[10px] text-gray-300 font-semibold truncate w-full mt-0.5" dir="ltr">
                      {ch.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
