"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Channel } from "@/context/AppContext";
import { Maximize, Minimize, RefreshCcw, AlertCircle, RotateCw } from "lucide-react";

function YtIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.5V8.5l6.25 3.5-6.25 3.5z" />
    </svg>
  );
}

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

function getYouTubeVideoId(url: string): string | null {
  try {
    const patterns = [
      /[?&]v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const re of patterns) {
      const m = url.match(re);
      if (m) return m[1];
    }
  } catch (_) {}
  return null;
}

function YouTubePlayer({ url }: { url: string }) {
  const videoId = getYouTubeVideoId(url);
  const [key, setKey] = useState(0);

  if (!videoId) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-4 text-center px-6">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-red-300 font-bold text-sm">تعذّر استخراج معرّف الفيديو من رابط يوتيوب.</p>
        <p className="text-gray-400 text-xs" dir="ltr">{url}</p>
      </div>
    );
  }

  const embedSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <>
      <iframe
        key={key}
        src={embedSrc}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        title="YouTube Player"
        style={{ border: 'none' }}
      />
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-red-500/50 shadow-lg">
        <YtIcon size={12} />
        YouTube
      </div>
      <button
        onClick={() => setKey(k => k + 1)}
        title="تحديث"
        className="absolute top-3 left-3 z-20 w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white hover:bg-red-600 hover:border-red-500 active:scale-90 transition-all shadow-lg"
      >
        <RotateCw size={14} />
      </button>
    </>
  );
}

function getStreamType(url: string): "hls" | "direct" {
  let pathname = '';
  try { pathname = new URL(url).pathname; } catch (_) { pathname = url; }
  if (/\.m3u8$/i.test(pathname)) return "hls";
  return "direct";
}

function HlsPlayer({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.dispatchEvent(new Event('stop-all-audio'));
    const el = videoRef.current;
    if (!el) return;

    setError(null);
    setLoading(true);

    if (hlsRef.current) {
      try { hlsRef.current.destroy(); } catch (_) {}
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ maxMaxBufferLength: 30, enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(el);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        el.play().catch(() => {});
      });

      let mr = 0, nr = 0;
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          if (nr < 3) { nr++; hls.startLoad(); }
          else { setError("فشل تحميل البث. تحقق من الرابط."); setLoading(false); }
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          if (mr < 3) { mr++; hls.recoverMediaError(); }
          else { setError("فشل في فك تشفير البث."); setLoading(false); }
        } else {
          setError("خطأ غير متوقع في البث."); setLoading(false); hls.destroy();
        }
      });

      return () => { hls.destroy(); hlsRef.current = null; };

    } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
      el.src = url;
      const onMeta = () => { setLoading(false); el.play().catch(() => {}); };
      el.addEventListener('loadedmetadata', onMeta);
      return () => el.removeEventListener('loadedmetadata', onMeta);

    } else {
      setError("متصفحك لا يدعم هذا النوع من البث المباشر.");
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm z-50 gap-4 px-6 text-center">
          <AlertCircle size={40} className="text-red-400" />
          <p className="text-red-300 font-bold text-sm leading-relaxed max-w-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

function DirectPlayer({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(false as any);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    setError(null);
    setLoading(true);

    let pathname = '';
    try { pathname = new URL(url).pathname; } catch (_) { pathname = url; }
    const isTs = /\.ts$/i.test(pathname);

    el.src = url;
    if (isTs) el.setAttribute('type', 'video/mp2t');

    const onMeta = () => { setLoading(false); el.play().catch(() => {}); };
    const onPlay = () => setLoading(false);
    const onErr = () => { setError("فشل تشغيل الفيديو. تحقق من الرابط."); setLoading(false); };

    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('playing', onPlay);
    el.addEventListener('error', onErr);

    return () => {
      el.removeEventListener('loadedmetadata', onMeta);
      el.removeEventListener('playing', onPlay);
      el.removeEventListener('error', onErr);
    };
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm z-50 gap-4 px-6 text-center">
          <AlertCircle size={40} className="text-red-400" />
          <p className="text-red-300 font-bold text-sm leading-relaxed max-w-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

export default function Player({ channel }: { channel: Channel | null }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [reloadKey, setReloadKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [refreshSpin, setRefreshSpin] = useState<boolean>(false);

  const isYT = channel ? isYouTubeUrl(channel.url) : false;

  const handleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        if ((screen.orientation as any)?.lock) {
          try { await (screen.orientation as any).lock('landscape'); } catch (_) {}
        }
      } else {
        await document.exitFullscreen();
        if ((screen.orientation as any)?.unlock) {
          try { (screen.orientation as any).unlock(); } catch (_) {}
        }
      }
    } catch (e) { console.warn("Fullscreen:", e); }
  }, []);

  useEffect(() => {
    const fn = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', fn);
    return () => document.removeEventListener('fullscreenchange', fn);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshSpin(true);
    setTimeout(() => setRefreshSpin(false), 800);
    setReloadKey(k => k + 1);
  }, []);

  if (!channel) return null;

  const streamType = !isYT ? getStreamType(channel.url) : null;

  return (
    <div className="view-section active px-4 lg:px-10 py-4 h-full w-full relative z-10 pb-20">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 z-10">

        <div
          ref={containerRef}
          className="relative w-full bg-black aspect-video rounded-xl lg:rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/20"
        >
          {isYT ? (
            <YouTubePlayer url={channel.url} />
          ) : streamType === "hls" ? (
            <HlsPlayer key={reloadKey} url={channel.url} />
          ) : (
            <DirectPlayer key={reloadKey} url={channel.url} />
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {!isYT && (
            <button
              onClick={handleRefresh}
              title="تحديث البث"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 font-semibold text-sm hover:bg-[var(--color-primary-custom)]/20 hover:border-[var(--color-primary-custom)]/50 hover:text-white active:scale-95 transition-all"
            >
              <RotateCw size={16} className={refreshSpin ? "animate-spin" : ""} />
              <span>تحديث</span>
            </button>
          )}

          <button
            onClick={handleFullscreen}
            title={isFullscreen ? "خروج من ملء الشاشة" : "ملء الشاشة"}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 font-semibold text-sm hover:bg-[var(--color-primary-custom)]/20 hover:border-[var(--color-primary-custom)]/50 hover:text-white active:scale-95 transition-all"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            <span>{isFullscreen ? "إغلاق الشاشة الكاملة" : "ملء الشاشة"}</span>
          </button>

          <div className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600/10 border border-red-600/20">
            {isYT ? (
              <>
                <YtIcon size={14} className="text-red-400" />
                <span className="text-red-400 font-black text-xs tracking-wider">YouTube</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                <span className="text-red-400 font-black text-xs tracking-wider">LIVE</span>
              </>
            )}
          </div>
        </div>

        <div className="shrink-0 glass-card p-4 lg:p-5 flex items-center gap-4 border-t-2 border-t-[var(--color-primary-custom)]">
          {channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-14 h-14 object-contain rounded-lg shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><rect width="56" height="56" fill="%23222"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23fff" font-size="12">TV</text></svg>';
              }}
            />
          ) : (
            <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 text-white font-bold shrink-0">TV</div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg lg:text-xl font-bold text-white truncate">{channel.name}</h2>
            <p className="text-xs text-gray-300 mt-1 font-semibold flex items-center gap-1.5">
              {channel.category && <><span>{channel.category}</span><span>•</span></>}
              <span>{isYT ? "بث مباشر على يوتيوب" : "جودة عالية"}</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
