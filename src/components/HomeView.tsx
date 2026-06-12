"use client";
import { MonitorPlay, Calendar, Trophy, Film, Tv, CircleDot, Play, Radio, Sparkles, Headphones } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export default function HomeView({ setView }: { setView: (v: string) => void }) {
  const { state } = useAppContext();
  const hidden = state.settings.hiddenSections || [];

  const available = [
    { key: "channels", icon: MonitorPlay, title: "القنوات المباشرة", desc: `${state.channels.length} قناة`, gradient: "from-blue-600 to-cyan-400", glow: "rgba(59,130,246,0.35)", show: state.channels.length > 0 },
    { key: "matches", icon: Calendar, title: "المباريات", desc: `${state.matches.length} مباراة`, gradient: "from-amber-500 to-orange-400", glow: "rgba(245,158,11,0.35)", show: state.matches.length > 0 },
    { key: "schedule", icon: Trophy, title: "النتائج والجدول", desc: "متابعة المباريات", gradient: "from-emerald-500 to-teal-400", glow: "rgba(16,185,129,0.35)", show: state.channels.length > 0 },
    { key: "movies", icon: Film, title: "المحتوى المجاني", desc: "أفلام ومسلسلات مجانية", gradient: "from-purple-500 to-violet-400", glow: "rgba(139,92,246,0.35)", show: true },
    { key: "football", icon: CircleDot, title: "كرة القدم", desc: "نتائج مباشرة والترتيب", gradient: "from-rose-500 to-pink-400", glow: "rgba(239,68,68,0.35)", show: true },
    { key: "stremio", icon: Tv, title: "Stremio", desc: "كتالوج شامل", gradient: "from-indigo-500 to-blue-400", glow: "rgba(99,102,241,0.35)", show: true },
    { key: "radio", icon: Radio, title: "الراديو المباشر", desc: "آلاف المحطات", gradient: "from-teal-500 to-cyan-400", glow: "rgba(20,184,166,0.35)", show: true },
    { key: "podcasts", icon: Headphones, title: "البودكاست", desc: "استمع مجاناً", gradient: "from-orange-500 to-amber-400", glow: "rgba(249,115,22,0.35)", show: true },
  ].filter(s => s.show && !hidden.includes(s.key));

  const hero = available[0];

  return (
    <div className="view-section active h-full w-full pb-20 overflow-y-auto">
      {/* Hero Banner */}
      <div className="relative w-full h-[280px] lg:h-[360px] overflow-hidden">
        {/* Animated gradient bg */}
        <div className={`absolute inset-0 bg-gradient-to-br ${hero?.gradient || "from-gray-800 to-gray-900"}`}></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.08),transparent_50%)]"></div>

        {/* Floating orbs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-[80px]"></div>

        {/* Content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <div className="relative h-full flex flex-col justify-end px-6 lg:px-10 pb-8">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 w-fit mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[11px] font-black text-white tracking-wide">بث مباشر</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-black text-white mb-3 leading-tight tracking-tight">
            {hero?.title || state.settings.appName}
          </h1>
          <p className="text-white/50 text-sm lg:text-base mb-6 max-w-md font-semibold">{hero?.desc}</p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => hero && setView(hero.key)}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white text-black font-black text-sm hover:bg-white/90 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <Play size={18} fill="black" />
              شاهد الآن
            </button>
            <div className="flex items-center gap-1 px-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-white">
              <Sparkles size={14} />
              <span className="text-xs font-bold">مجاني</span>
            </div>
          </div>
        </div>

        {/* Decorative icon */}
        <div className="absolute top-1/2 -translate-y-1/2 left-6 lg:left-14 opacity-[0.06]">
          {hero && <hero.icon size={220} className="text-white" />}
        </div>
      </div>

      {/* Section Cards */}
      <div className="px-4 lg:px-10 -mt-4 relative z-10 grid grid-cols-2 gap-3">
        {available.map((section, idx) => {
          const Icon = section.icon;
          return (
            <button
              key={section.key}
              onClick={() => setView(section.key)}
              className="group relative rounded-2xl overflow-hidden border border-white/[0.06] active:scale-[0.98] transition-all duration-300"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Card bg */}
              <div className="absolute inset-0 bg-[#131316] group-hover:bg-[#1a1a1e] transition-colors duration-300"></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 20% 50%, ${section.glow}, transparent 60%)` }}></div>

              <div className="relative flex flex-col items-center gap-3 p-4 text-center">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                  <Icon size={22} className="text-white drop-shadow-lg" />
                </div>

                {/* Text */}
                <div className="min-w-0">
                  <h3 className="text-white font-black text-[12px] mb-0.5 group-hover:text-white transition-colors truncate">{section.title}</h3>
                  <p className="text-gray-500 text-[9px] font-bold group-hover:text-gray-400 transition-colors truncate">{section.desc}</p>
                </div>
              </div>

              {/* Bottom glow line */}
              <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${section.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 mx-4 lg:mx-10 flex items-center justify-center gap-2 py-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/5"></div>
        <span className="text-gray-600 text-[10px] font-bold">مجاني بالكامل</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/5"></div>
      </div>
    </div>
  );
}
