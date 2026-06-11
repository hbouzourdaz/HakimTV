"use client";
import React from "react";
import { Play, Calendar, AlertCircle, Mic, Trophy } from "lucide-react";
import { useAppContext, Channel } from "@/context/AppContext";

export default function MatchesGrid({ onPlay }: { onPlay: (ch: Channel) => void }) {
  const { state, loading } = useAppContext();

  // تنظيف وتجهيز الأسماء للمقارنة الذكية
  const findMatchingChannel = (channelName: string, channels: Channel[]): Channel | undefined => {
    if (!channelName) return undefined;
    const cleanStr = (s: string) => 
      s.toLowerCase()
       .replace(/\s+/g, "")
       .replace(/[-_()]/g, "")
       .replace(/hd|sd|fhd|4k|1080p|720p/gi, "");

    const cleanedTarget = cleanStr(channelName);
    
    // محاولة أولى: تطابق تام بعد التنظيف
    let found = channels.find(ch => cleanStr(ch.name) === cleanedTarget);
    if (found) return found;
    
    // محاولة ثانية: الاحتواء (أحدهما يحتوي الآخر)
    found = channels.find(ch => {
      const cleanCh = cleanStr(ch.name);
      return cleanCh.includes(cleanedTarget) || cleanedTarget.includes(cleanCh);
    });
    
    return found;
  };

  if (loading) {
    return (
      <div className="view-section active flex flex-col items-center justify-center p-20 text-white font-bold h-full w-full pb-20">
        <div className="w-12 h-12 border-4 border-[var(--color-primary-custom)] border-t-transparent rounded-full animate-spin mb-4"></div>
        <span>جاري تحميل جدول المباريات...</span>
      </div>
    );
  }

  return (
    <div className="view-section active px-4 lg:px-10 py-6 h-full w-full pb-20 overflow-y-auto">
      <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 flex items-center gap-3 drop-shadow-md">
        مباريات اليوم
      </h2>

      {state.matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card p-8 max-w-lg mx-auto mt-10">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/20">
            <Calendar size={32} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">لا توجد مباريات مجدولة اليوم</h3>
          <p className="text-sm text-gray-400">
            لا توجد مباريات مجدولة لهذا اليوم حالياً. يمكنك إضافة مباريات جديدة بسهولة من لوحة الإدارة للتحكم في الجدول.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 pb-6">
          {state.matches.map(m => {
            const matchingChannel = findMatchingChannel(m.channel, state.channels);

            return (
              <div key={m.id} className="glass-card p-4 lg:p-5 relative overflow-hidden group hover-lift flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4 relative z-10">
                    <div className="flex flex-col items-center flex-1 text-center">
                      {m.team1.logo ? (
                        <img 
                          src={m.team1.logo} 
                          alt={m.team1.name} 
                          onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="%23222" rx="8"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="12">VS</text></svg>' }} 
                          className="w-12 h-12 md:w-14 md:h-14 object-contain mb-2 transform group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 font-bold text-xs mb-2">
                          {m.team1.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-bold text-xs md:text-sm text-white truncate max-w-[100px] md:max-w-[120px]">{m.team1.name}</span>
                    </div>

                    <div className="bg-black/50 text-white font-sport font-black text-sm md:text-base px-3 py-1.5 rounded-xl border border-white/10 select-none shadow-inner">
                      {m.time}
                    </div>

                    <div className="flex flex-col items-center flex-1 text-center">
                      {m.team2.logo ? (
                        <img 
                          src={m.team2.logo} 
                          alt={m.team2.name} 
                          onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="%23222" rx="8"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="12">VS</text></svg>' }} 
                          className="w-12 h-12 md:w-14 md:h-14 object-contain mb-2 transform group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 font-bold text-xs mb-2">
                          {m.team2.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-bold text-xs md:text-sm text-white truncate max-w-[100px] md:max-w-[120px]">{m.team2.name}</span>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 text-center text-white text-xs font-bold flex flex-col gap-2 mb-4">
                    {m.league && (
                      <div className="flex items-center justify-center gap-1.5 text-yellow-500">
                        <Trophy size={12} />
                        <span>{m.league}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-4 text-white/80">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0"></span>
                        <span className="text-red-500 font-black text-[10px] tracking-wider uppercase">Live</span>
                        <span className="truncate">{m.channel}</span>
                      </div>
                      {m.commentator && (
                        <div className="flex items-center gap-1.5 border-r border-white/10 pr-4">
                          <Mic size={12} className="text-blue-400 shrink-0" />
                          <span className="truncate">{m.commentator}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* زر مشاهدة الآن */}
                {matchingChannel ? (
                  <button
                    onClick={() => onPlay(matchingChannel)}
                    className="w-full py-2.5 rounded-xl bg-[var(--color-primary-custom)] text-white hover:bg-[var(--color-primary-dark-custom)] text-xs md:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(94,34,127,0.3)] hover:shadow-[0_4px_20px_var(--color-primary-custom)] transform group-hover:translate-y-[-2px]"
                  >
                    <Play size={14} fill="currentColor" />
                    <span>مشاهدة البث الآن</span>
                  </button>
                ) : (
                  <div className="w-full py-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed select-none">
                    <AlertCircle size={14} />
                    <span>البث غير متوفر حالياً</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
