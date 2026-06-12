"use client";
import { MonitorPlay, Calendar, Trophy, Film, Tv, CircleDot, Home } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

  const defaultLabels: Record<string, string> = {
    home: 'الرئيسية',
    channels: 'القنوات',
    matches: 'المباريات',
    schedule: 'الجدول',
    movies: 'المحتوى',
    stremio: 'Stremio',
    football: 'المباريات',
  };

export default function BottomNav({ view, setView }: any) {
  const { state } = useAppContext();
  const hidden = state.settings.hiddenSections || [];
  const labels = state.settings.sectionLabels || {};

  if (view === 'player' || view === 'admin' || view === 'admin_auth') return null;

  const tabs = [
    { key: 'home', icon: Home },
    { key: 'channels', icon: MonitorPlay },
    { key: 'matches', icon: Calendar },
    { key: 'schedule', icon: Trophy },
    { key: 'movies', icon: Film },
    { key: 'football', icon: CircleDot },
    { key: 'stremio', icon: Tv },
  ].filter(t => t.key === 'home' || !hidden.includes(t.key));

  if (tabs.length === 0) return null;

  return (
    <nav className="absolute bottom-0 w-full h-[70px] bg-black/95 backdrop-blur-xl flex justify-around items-center shrink-0 border-t border-white/10 z-30 transition-transform duration-300">
      {tabs.map(t => {
        const Icon = t.icon;
        const isActive = view === t.key;
        const label = labels[t.key] || defaultLabels[t.key] || t.key;
        return (
          <button key={t.key} onClick={() => setView(t.key)} className={`flex-1 h-full flex flex-col justify-center items-center gap-1.5 relative ${isActive ? 'text-white' : 'text-gray-400'}`}>
            {isActive && <div className="absolute top-0 w-12 h-1.5 bg-[var(--color-primary-custom)] rounded-b-lg shadow-[0_0_8px_var(--color-primary-custom)]"></div>}
            <Icon size={24} className={isActive ? 'scale-110' : ''} />
            <span className="text-[10px] font-bold tracking-wide">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
