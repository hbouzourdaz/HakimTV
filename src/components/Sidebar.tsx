"use client";
import { X, Send, Settings } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import AppLogo from "./AppLogo";

function Facebook({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Sidebar({ isOpen, closeSidebar, setView }: any) {
  const { state } = useAppContext();
  
  return (
    <>
      {isOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300" onClick={closeSidebar}></div>
      )}
      <div className={`absolute top-0 right-0 h-full w-[280px] bg-[#1a1a1c] border-l border-white/5 z-50 transform transition-transform duration-300 cubic-bezier(0.2, 0, 0, 1) flex flex-col shadow-2xl rounded-l-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 rounded-tl-2xl">
          <AppLogo name={state.settings.appName} size="md" />
          <button onClick={closeSidebar} className="text-gray-400 hover:text-white transition-all w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center active:scale-95">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-4">
          <p className="text-[12px] font-bold text-gray-400 mb-2 px-2 uppercase tracking-wider">تواصل معنا</p>
          <a href={state.settings.telegramUrl} target="_blank" className="flex items-center gap-4 px-4 py-4 rounded-xl text-gray-100 hover:bg-white/5 hover:text-white transition-all active:scale-[0.98] active:bg-white/10 group">
            <div className="w-8 flex justify-center group-hover:scale-110 transition-transform"><Send className="text-[#0088cc]" size={24} /></div>
            <span className="font-semibold text-[15px]">قناتنا على تليجرام</span>
          </a>
          <a href={state.settings.facebookUrl} target="_blank" className="flex items-center gap-4 px-4 py-4 rounded-xl text-gray-100 hover:bg-white/5 hover:text-white transition-all active:scale-[0.98] active:bg-white/10 group">
            <div className="w-8 flex justify-center group-hover:scale-110 transition-transform"><Facebook className="text-[#1877F2]" size={24} /></div>
            <span className="font-semibold text-[15px]">صفحة الفيسبوك</span>
          </a>
          <div className="h-px bg-white/10 my-4 mx-2"></div>
          <button onClick={() => { closeSidebar(); setView('admin_auth'); }} className="flex items-center gap-4 px-4 py-4 rounded-xl text-gray-200 hover:bg-white/5 hover:text-white transition-all active:scale-[0.98] active:bg-white/10 group w-full text-right">
            <div className="w-8 flex justify-center group-hover:scale-110 transition-transform"><Settings className="text-[var(--color-primary-custom)]" size={24} /></div>
            <span className="font-semibold text-[15px]">إدارة التطبيق</span>
          </button>
        </div>
        
        {/* Developer Credits */}
        <div className="mt-auto p-4 mb-6 mx-4 rounded-2xl bg-gradient-to-br from-black/60 to-black/90 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--color-primary-custom)]/20 blur-2xl rounded-full group-hover:bg-[var(--color-primary-custom)]/30 transition-colors"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-500/10 blur-2xl rounded-full group-hover:bg-blue-500/20 transition-colors"></div>
          
          <div className="flex items-center justify-center gap-2 mb-1.5 z-10">
            <div className="h-px w-4 bg-gradient-to-r from-transparent to-gray-500"></div>
            <span className="text-[9px] font-black text-gray-400 tracking-[0.2em] uppercase">Developed By</span>
            <div className="h-px w-4 bg-gradient-to-l from-transparent to-gray-500"></div>
          </div>
          
          <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 z-10 font-mono tracking-widest text-center">
            Hakim BOUZOURDAZ
          </span>
        </div>
      </div>
    </>
  );
}
