"use client";
import { Menu, ArrowRight } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import AppLogo from "./AppLogo";

export default function Header({ view, setView, toggleSidebar, onBack }: any) {
  const { state } = useAppContext();
  
  return (
    <header className="w-full h-16 px-4 lg:px-8 grid grid-cols-[1fr_auto_1fr] items-center z-30 shrink-0 border-b border-white/10 bg-black/45 backdrop-blur-xl relative transition-all shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Top Ambient Glow Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-[var(--color-primary-custom)] blur-sm rounded-full opacity-65"></div>
      
      {/* Navigation Button */}
      <div className="flex justify-start">
        {view === 'player' ? (
          <button 
            onClick={() => onBack ? onBack() : setView('home')} 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 hover:text-[var(--color-primary-custom)] transition-all active:scale-90 shadow-inner group"
          >
            <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <button 
            onClick={toggleSidebar} 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 hover:text-[var(--color-primary-custom)] transition-all active:scale-90 shadow-inner group"
          >
            <Menu size={20} className="group-hover:rotate-12 transition-transform" />
          </button>
        )}
      </div>
      
      {/* App Logo - Centered */}
      <div 
        className="cursor-pointer select-none relative group py-1.5 px-4 rounded-full border border-transparent hover:border-white/5 hover:bg-white/5 transition-all active:scale-98 justify-self-center" 
        onClick={() => setView('home')}
      >
        <div className="absolute inset-0 bg-[var(--color-primary-custom)]/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <AppLogo name={state.settings.appName} size="md" />
        </div>
      </div>
      
      {/* Live Status Badge */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-black/25 shadow-inner select-none transition-colors hover:border-white/10" dir="rtl">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[10px] font-bold text-gray-300 tracking-wide">البث المباشر</span>
        </div>
      </div>
    </header>
  );
}
