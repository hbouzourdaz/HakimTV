"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import "plyr/dist/plyr.css";

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: "auto" | "metadata" | "none";
}

export default function VideoPlayer({
  src,
  poster,
  title,
  className = "",
  autoPlay = false,
  muted = false,
  loop = false,
  preload = "auto",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initPlayer = useCallback(async () => {
    if (!videoRef.current || playerRef.current) return;

    const { default: Plyr } = await import("plyr");

    const player = new Plyr(videoRef.current, {
      controls: [
        "play-large",
        "restart",
        "rewind",
        "play",
        "fast-forward",
        "progress",
        "current-time",
        "duration",
        "mute",
        "volume",
        "settings",
        "pip",
        "fullscreen",
      ],
      settings: ["speed", "quality", "loop"],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      tooltips: { controls: true, seek: true },
      keyboard: { focused: true, global: true },
      fullscreen: { enabled: true, fallback: true },
      autoplay: autoPlay,
      muted: muted,
      loop: { active: loop },
      hideControls: true,
      resetOnEnd: false,
      disableContextMenu: false,
      storage: { enabled: true, key: "plyr-volume" },
    });

    player.on("ready", () => setLoading(false));
    player.on("loadeddata", () => setLoading(false));
    player.on("error", () => {
      setError("تعذر تحميل الفيديو. تحقق من الرابط.");
      setLoading(false);
    });

    playerRef.current = player;
  }, [autoPlay, muted, loop]);

  useEffect(() => {
    initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [initPlayer]);

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const onWaiting = () => setLoading(true);
    const onPlaying = () => { setLoading(false); setError(null); };
    const onError = () => {
      setError("تعذر تحميل الفيديو. تحقق من الرابط.");
      setLoading(false);
    };

    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("error", onError);
    };
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative group rounded-2xl overflow-hidden bg-black shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 transition-all duration-500 hover:shadow-[0_25px_70px_rgba(0,0,0,0.9)] hover:border-white/20 ${className}`}
    >
      {loading && !error && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none transition-opacity duration-300">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-violet-500 rounded-full animate-spin" />
          </div>
          <span className="text-white/80 text-sm font-semibold mt-4 tracking-wide">جاري التحميل...</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md gap-4 px-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-red-300 font-bold text-sm text-center leading-relaxed">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-500 active:scale-95 transition-all shadow-lg"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      <video
        ref={videoRef}
        className="plyr-react plyr w-full"
        poster={poster}
        crossOrigin="anonymous"
        playsInline
        preload={preload}
      >
        <source src={src} type="video/mp4" />
      </video>

      {title && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <h3 className="text-white text-sm font-bold truncate">{title}</h3>
        </div>
      )}
    </div>
  );
}
