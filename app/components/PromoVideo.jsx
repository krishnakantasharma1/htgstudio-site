"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function PromoVideo() {
  const mountRef = useRef(null);     // container div that YT will replace
  const playerRef = useRef(null);    // YT player instance
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [failed, setFailed] = useState(false); // fallback flag
  const VIDEO_ID = "Ua0VVb0iyOs";

  // Load YT API with timeout fallback (for blockers)
  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!window.YT?.Player && !cancelled) setFailed(true);
    }, 3500);

    const loadAPI = () =>
      new Promise((resolve) => {
        if (typeof window === "undefined") return;
        if (window.YT?.Player) return resolve();
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        window.onYouTubeIframeAPIReady = () => resolve();
        document.body.appendChild(tag);
      });

    loadAPI()
      .then(() => {
        if (cancelled) return;
        // Create player; use nocookie host and explicit origin
        playerRef.current = new window.YT.Player(mountRef.current, {
          // Privacy-friendly host can bypass some blockers
          host: "https://www.youtube-nocookie.com",
          videoId: VIDEO_ID,
          playerVars: {
            autoplay: 0,            // start paused
            mute: 0,                // play with sound on click
            controls: 0,
            rel: 0,
            modestbranding: 1,
            fs: 0,
            playsinline: 1,
            loop: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (e) => {
              // Add iframe permissions for stricter browsers
              try {
                const iframe = e.target.getIframe();
                iframe.setAttribute(
                  "allow",
                  "autoplay; encrypted-media; picture-in-picture; fullscreen"
                );
              } catch {}
              setIsReady(true);
            },
            onStateChange: (e) => {
              if (e.data === window.YT.PlayerState.PLAYING) {
                try { e.target.setPlaybackQuality("hd720"); } catch {}
                setIsPlaying(true);
              }
            },
            onError: () => setFailed(true),
          },
        });
      })
      .catch(() => setFailed(true))
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      playerRef.current?.destroy?.();
    };
  }, []);

  // More robust play-on-click handler for iOS/Safari/Brave
  const handlePlay = () => {
    const p = playerRef.current;
    if (!p || !isReady) return;

    try {
      // Some browsers need a direct method call in same gesture tick
      p.unMute();
      p.setVolume(100);
      p.setPlaybackQuality?.("hd720");
      p.playVideo();

      // Retry once shortly after (covers rare focus/gesture race)
      requestAnimationFrame(() => {
        try {
          p.playVideo();
          p.setPlaybackQuality?.("hd720");
        } catch {}
      });
    } catch {
      // As a last resort, set failed to show fallback link
      setFailed(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden shadow-lg mb-8 bg-black"
    >
      {/* YouTube mounts the iframe here */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Overlay CTA until playing */}
      {!isPlaying && !failed && (
        <div className="absolute inset-0 bg-black/45 flex items-center justify-center z-10">
          <button
            onClick={handlePlay}
            disabled={!isReady}
            className={`flex flex-col items-center text-white transition-transform ${
              isReady ? "hover:scale-105" : "opacity-60 cursor-not-allowed"
            }`}
          >
            <div className="bg-white/15 backdrop-blur-md p-6 rounded-full border border-white/30 shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-12 h-12">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="mt-3 text-lg font-semibold">Tap to Play</p>
           
          </button>
        </div>
      )}

      {/* Graceful fallback if YT is blocked */}
      {failed && (
        <a
          href={`https://www.youtube.com/watch?v=${VIDEO_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center z-10 bg-black/55 text-white text-sm font-semibold"
        >
          Can’t play here? Tap to watch on YouTube →
        </a>
      )}
    </motion.div>
  );
}
