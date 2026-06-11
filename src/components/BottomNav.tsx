"use client";
import { MonitorPlay, Calendar } from "lucide-react";

export default function BottomNav({ view, setView }: any) {
  if (view === 'player' || view === 'admin' || view === 'admin_auth') return null;
  
  return (
    <nav className="absolute bottom-0 w-full h-[70px] bg-black/95 backdrop-blur-xl flex justify-around items-center shrink-0 border-t border-white/10 z-30 transition-transform duration-300">
      <button onClick={() => setView('channels')} className={`flex-1 h-full flex flex-col justify-center items-center gap-1.5 relative ${view === 'channels' ? 'text-white' : 'text-gray-400'}`}>
        {view === 'channels' && <div className="absolute top-0 w-12 h-1.5 bg-[var(--color-primary-custom)] rounded-b-lg shadow-[0_0_8px_var(--color-primary-custom)]"></div>}
        <MonitorPlay size={24} className={view === 'channels' ? 'scale-110' : ''} />
        <span className="text-[10px] font-bold tracking-wide">القنوات</span>
      </button>
      <button onClick={() => setView('matches')} className={`flex-1 h-full flex flex-col justify-center items-center gap-1.5 relative ${view === 'matches' ? 'text-white' : 'text-gray-400'}`}>
        {view === 'matches' && <div className="absolute top-0 w-12 h-1.5 bg-[var(--color-primary-custom)] rounded-b-lg shadow-[0_0_8px_var(--color-primary-custom)]"></div>}
        <Calendar size={24} className={view === 'matches' ? 'scale-110' : ''} />
        <span className="text-[10px] font-bold tracking-wide">المباريات</span>
      </button>
    </nav>
  );
}
