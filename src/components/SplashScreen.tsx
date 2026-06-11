"use client";
import React, { useEffect, useState } from "react";
import { MonitorPlay } from "lucide-react";
import AppLogo from "./AppLogo";

export default function SplashScreen({ appName, isLoading }: { appName: string; isLoading: boolean }) {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const minDisplayTime = new Promise((resolve) => setTimeout(resolve, 2000));

    if (!isLoading) {
      minDisplayTime.then(() => {
        setFadeOut(true);
        setTimeout(() => setShow(false), 800); 
      });
    }
  }, [isLoading]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0c] transition-all duration-700 ease-in-out ${
        fadeOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Modern Dynamic Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[40vh] h-[40vh] bg-[var(--color-primary-custom)]/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-[30vh] h-[30vh] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
      </div>

      {/* Logo Container */}
      <div className="relative z-10 flex flex-col items-center gap-8 animate-[popIn_1s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Glassmorphic Icon Box */}
        <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-[2.5rem] bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <MonitorPlay size={64} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] relative z-10" />
        </div>
        
        {/* App Name with branded logo */}
        <div className="flex flex-col items-center gap-3">
          <AppLogo name={appName || "Hakim TV"} size="xl" />
          <p className="text-white/40 text-xs md:text-sm tracking-[0.4em] font-medium uppercase">
            Premium Stream
          </p>
        </div>
      </div>

      {/* Modern Loading Indicator */}
      <div className="absolute bottom-16 flex flex-col items-center gap-4">
        <div className="flex gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary-custom)] animate-bounce shadow-[0_0_10px_var(--color-primary-custom)]" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary-custom)] animate-bounce shadow-[0_0_10px_var(--color-primary-custom)]" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary-custom)] animate-bounce shadow-[0_0_10px_var(--color-primary-custom)]" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
