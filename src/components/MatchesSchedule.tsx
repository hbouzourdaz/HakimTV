"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Maximize, Minimize, AlertCircle, RefreshCcw, Trophy, ArrowRight } from "lucide-react";

const WORKER_URL = "https://ali.albasritv1.workers.dev/";

interface MatchServer {
  name: string;
  url: string;
  type: string;
}

interface MatchData {
  id?: number;
  time: string;
  status: string;
  priority: number;
  team1: { name: string; logo: string; goals?: number };
  team2: { name: string; logo: string; goals?: number };
  link: string;
}

function getCleanImg(url: string) {
  if (!url) return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><rect width='60' height='60' fill='%231f2937' rx='30'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='14'>VS</text></svg>";
  let u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("//")) return "https:" + u;
  return u;
}

function formatTime(t: string) {
  if (!t) return "";
  let clean = t.toString().replace(/⏰/g, '').trim();
  let parts = clean.match(/(\d{1,2}):(\d{2})/);
  if (parts) {
    let hours = parseInt(parts[1]);
    let minutes = parts[2];
    let ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }
  return clean;
}

function MatchCard({ m, onClick }: { m: MatchData; onClick: () => void }) {
  const score = `${m.team1.goals ?? 0} - ${m.team2.goals ?? 0}`;
  let statusClass = "bg-amber-500/10 text-amber-400 border border-amber-500/30";
  let statusText = "لم تبدأ";
  let centerValue = formatTime(m.time);

  if (m.priority === 1) {
    statusClass = "bg-red-500/15 text-red-400 border border-red-500/40 animate-pulse";
    statusText = "جاري الآن";
    centerValue = score;
  } else if (m.priority === 3) {
    statusClass = "bg-gray-500/10 text-gray-400 border border-gray-500/30";
    statusText = "انتهت";
    centerValue = score;
  }

  return (
    <div onClick={onClick} className="glass-card p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 hover:border-[var(--color-primary-custom)]/50 transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex flex-col items-center w-[30%] text-center">
        <img src={getCleanImg(m.team1.logo)} alt={m.team1.name} className="w-14 h-14 object-contain mb-2 rounded-full bg-white/5 p-1 border border-white/5" />
        <span className="font-bold text-xs text-white truncate max-w-[90px]">{m.team1.name}</span>
      </div>
      <div className="flex flex-col items-center w-[40%] text-center">
        <span className={`text-xs font-black px-3 py-1 rounded-full mb-2 ${statusClass}`}>{statusText}</span>
        <span className="text-sm font-black text-white bg-black/30 px-3 py-1 rounded-lg">{centerValue}</span>
      </div>
      <div className="flex flex-col items-center w-[30%] text-center">
        <img src={getCleanImg(m.team2.logo)} alt={m.team2.name} className="w-14 h-14 object-contain mb-2 rounded-full bg-white/5 p-1 border border-white/5" />
        <span className="font-bold text-xs text-white truncate max-w-[90px]">{m.team2.name}</span>
      </div>
    </div>
  );
}

function IframePlayer({ url }: { url: string }) {
  const [key, setKey] = useState(0);
  return (
    <>
      <iframe key={key} src={url} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen title="Player" style={{ border: 'none' }} />
      <button onClick={() => setKey(k => k + 1)} title="تحديث" className="absolute top-3 left-3 z-20 w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white hover:bg-red-600 active:scale-90 transition-all shadow-lg">
        <RefreshCcw size={14} />
      </button>
    </>
  );
}

function HlsPlayer({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    setError(null);
    setLoading(true);

    if (hlsRef.current) { try { hlsRef.current.destroy(); } catch (_) {} hlsRef.current = null; }

    if (Hls.isSupported()) {
      const hls = new Hls({ maxMaxBufferLength: 30, enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(el);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { setLoading(false); el.play().catch(() => {}); });
      let mr = 0, nr = 0;
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) { if (nr < 3) { nr++; hls.startLoad(); } else { setError("فشل تحميل البث."); setLoading(false); } }
        else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) { if (mr < 3) { mr++; hls.recoverMediaError(); } else { setError("فشل في فك تشفير البث."); setLoading(false); } }
        else { setError("خطأ غير متوقع."); setLoading(false); hls.destroy(); }
      });
      return () => { hls.destroy(); hlsRef.current = null; };
    } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
      el.src = url;
      const fn = () => { setLoading(false); el.play().catch(() => {}); };
      el.addEventListener('loadedmetadata', fn);
      return () => el.removeEventListener('loadedmetadata', fn);
    } else {
      setError("متصفحك لا يدعم هذا النوع من البث.");
      setLoading(false);
    }
  }, [url]);

  return (
    <div className="relative w-full h-full">
      <video ref={videoRef} className="w-full h-full object-contain" controls playsInline autoPlay />
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-40 pointer-events-none">
          <div className="w-12 h-12 border-4 border-[var(--color-primary-custom)] border-t-transparent rounded-full animate-spin" />
          <span className="text-white mt-4 font-bold text-sm">جاري تحميل البث...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 gap-3 px-4 text-center">
          <AlertCircle size={36} className="text-red-400" />
          <p className="text-red-300 font-bold text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

export default function MatchesSchedule() {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<"schedule" | "player">("schedule");
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);
  const [servers, setServers] = useState<MatchServer[]>([]);
  const [activeServer, setActiveServer] = useState<MatchServer | null>(null);
  const [loadingServers, setLoadingServers] = useState(false);
  const [noServer, setNoServer] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(WORKER_URL)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) setMatches(res.data);
        else setError("لا توجد مباريات حالياً.");
        setLoading(false);
      })
      .catch(() => { setError("حدث خطأ في الاتصال. يرجى التحديث."); setLoading(false); });
  }, []);

  const handleMatchClick = async (m: MatchData) => {
    setSelectedMatch(m);
    setView("player");
    setLoadingServers(true);
    setNoServer(false);
    setServers([]);
    setActiveServer(null);

    try {
      const res = await fetch(m.link);
      const result = await res.json();
      if (result.success && result.servers && result.servers.length > 0) {
        setServers(result.servers);
        setActiveServer(result.servers[0]);
      } else {
        setNoServer(true);
      }
    } catch {
      setNoServer(true);
    } finally {
      setLoadingServers(false);
    }
  };

  const handleBack = useCallback(() => {
    setView("schedule");
    setSelectedMatch(null);
    setServers([]);
    setActiveServer(null);
    setNoServer(false);
  }, []);

  const handleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen();
      try { await (screen.orientation as any)?.lock('landscape'); } catch (_) {}
    } else {
      await document.exitFullscreen();
      try { (screen.orientation as any)?.unlock(); } catch (_) {}
    }
  }, []);

  useEffect(() => {
    const fn = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', fn);
    return () => document.removeEventListener('fullscreenchange', fn);
  }, []);

  useEffect(() => {
    const handler = () => { if (view === "player") handleBack(); };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [view, handleBack]);

  if (loading) {
    return (
      <div className="view-section active flex flex-col items-center justify-center p-20 text-white font-bold h-full w-full pb-20">
        <div className="w-12 h-12 border-4 border-[var(--color-primary-custom)] border-t-transparent rounded-full animate-spin mb-4" />
        <span>جاري تحميل جدول المباريات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-section active flex flex-col items-center justify-center p-20 text-white h-full w-full pb-20 gap-4">
        <AlertCircle size={48} className="text-red-400" />
        <p className="text-red-300 font-bold text-center">{error}</p>
      </div>
    );
  }

  if (view === "player" && selectedMatch) {
    const isHls = activeServer?.type === "m3u8";
    return (
      <div className="view-section active px-4 lg:px-10 py-4 h-full w-full relative z-10 pb-20 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-300 hover:text-white font-bold text-sm transition-colors self-start">
            <ArrowRight size={18} />
            العودة للجدول
          </button>

          <div className="glass-card p-4 flex justify-between items-center border-t-2 border-t-[var(--color-primary-custom)]">
            <div className="flex flex-col items-center w-[30%] text-center">
              <img src={getCleanImg(selectedMatch.team1.logo)} alt={selectedMatch.team1.name} className="w-12 h-12 object-contain rounded-full bg-white/5 p-1 border border-white/5" />
              <span className="font-bold text-xs text-white truncate max-w-[90px]">{selectedMatch.team1.name}</span>
            </div>
            <div className="flex flex-col items-center w-[40%] text-center">
              <span className="text-xs font-black text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full mb-1">
                {selectedMatch.priority === 1 ? "جاري الآن" : selectedMatch.priority === 3 ? "انتهت" : "لم تبدأ"}
              </span>
              <span className="text-sm font-black text-white">{selectedMatch.priority === 1 || selectedMatch.priority === 3 ? `${selectedMatch.team1.goals ?? 0} - ${selectedMatch.team2.goals ?? 0}` : formatTime(selectedMatch.time)}</span>
            </div>
            <div className="flex flex-col items-center w-[30%] text-center">
              <img src={getCleanImg(selectedMatch.team2.logo)} alt={selectedMatch.team2.name} className="w-12 h-12 object-contain rounded-full bg-white/5 p-1 border border-white/5" />
              <span className="font-bold text-xs text-white truncate max-w-[90px]">{selectedMatch.team2.name}</span>
            </div>
          </div>

          {loadingServers ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="w-10 h-10 border-4 border-[var(--color-primary-custom)] border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-300 font-bold text-sm">جاري البحث عن سيرفرات البث...</span>
            </div>
          ) : noServer ? (
            <div className="glass-card p-8 text-center flex flex-col items-center gap-4 border border-red-500/20">
              <AlertCircle size={40} className="text-red-400" />
              <div>
                <h3 className="text-lg font-bold text-white mb-1">عذراً!</h3>
                <p className="text-sm text-gray-400">لا يوجد سيرفر بث متاح لهذه المباراة حالياً.</p>
              </div>
              <button onClick={handleBack} className="px-6 py-2.5 rounded-xl bg-[var(--color-primary-custom)] text-white font-bold text-sm hover:opacity-90 transition-all">
                العودة للجدول
              </button>
            </div>
          ) : (
            <>
              <div ref={containerRef} className="relative w-full bg-black aspect-video rounded-xl lg:rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/20">
                {activeServer && (
                  isHls ? <HlsPlayer key={activeServer.url} url={activeServer.url} /> : <IframePlayer key={activeServer.url} url={activeServer.url} />
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={handleFullscreen} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary-custom)] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all">
                  {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                  <span>{isFullscreen ? "إغلاق الشاشة الكاملة" : "ملء الشاشة"}</span>
                </button>
              </div>

              {servers.length > 1 && (
                <div className="glass-card p-4">
                  <h4 className="text-sm font-black text-gray-400 mb-3">سيرفرات المشاهدة:</h4>
                  <div className="flex flex-wrap gap-2">
                    {servers.map((srv, i) => (
                      <button key={i} onClick={() => setActiveServer(srv)} className={`flex-1 min-w-[100px] px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeServer?.url === srv.url ? "bg-[var(--color-primary-custom)]/20 text-[var(--color-primary-custom)] border border-[var(--color-primary-custom)]/50" : "bg-white/5 text-gray-400 border border-transparent hover:bg-white/10"}`}>
                        {srv.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="view-section active px-4 lg:px-10 py-6 h-full w-full pb-20 overflow-y-auto">
      <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Trophy size={28} className="text-[var(--color-primary-custom)]" />
        جدول مباريات اليوم
      </h2>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card p-8 max-w-lg mx-auto mt-10">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/20">
            <Trophy size={32} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">لا توجد مباريات مجدولة</h3>
          <p className="text-sm text-gray-400">لا توجد مباريات حالياً في الجدول.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((m, i) => (
            <MatchCard key={m.id ?? i} m={m} onClick={() => handleMatchClick(m)} />
          ))}
        </div>
      )}
    </div>
  );
}
