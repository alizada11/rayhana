import React, { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { media, type Language } from "@/blackfriday/redesign/data/catalog";
import type { Copy } from "./BuyingDialog";
import { connectViewportVideo } from "./viewportVideoPlayback";

const controlHint = {
  fa: "صدا و توقف ویدیو در اختیار شماست.",
  en: "You control sound and playback.",
  ps: "د ویډیو غږ او درول ستاسو په اختیار کې دي.",
};

export default function ViewportVideo({
  language,
  copy,
  poster,
  enabled = true,
  suspended = false,
}: {
  language: Language;
  copy: Copy;
  poster: string;
  enabled?: boolean;
  suspended?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playback = useRef<ReturnType<typeof connectViewportVideo> | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    const controller = connectViewportVideo(videoRef.current);
    playback.current = controller;
    return () => {
      controller.dispose();
      playback.current = null;
    };
  }, []);

  useEffect(() => {
    playback.current?.setSuspended(suspended || !enabled);
  }, [suspended, enabled]);

  return (
    <div
      className={`ds-video-overlay${started ? " is-started" : ""}`}
      id="mandoline-demo"
      hidden={!enabled}
      tabIndex={-1}
      aria-label={copy.videoLabel}
      onPointerEnter={() => {
        videoRef.current?.play().catch(() => {});
      }}
      onPointerLeave={() => {
        videoRef.current?.pause();
      }}
    >
      <p id="mandoline-demo-controls" className="sr-only">
        {controlHint[language]}
      </p>
      <video
        ref={videoRef}
        controls
        playsInline
        muted
        preload="none"
        poster={poster}
        aria-label={copy.videoLabel}
        aria-describedby="mandoline-demo-controls"
        aria-hidden={!started}
        tabIndex={started ? 0 : -1}
        onPlaying={() => setStarted(true)}
        onEnded={() => setStarted(false)}
      >
        <source src={media.demo} type="video/mp4" />
        <a href={media.demo} download>
          {copy.videoFallback}
        </a>
      </video>
      {!started && (
        <button
          className="video-pill ds-overlay-play"
          type="button"
          onClick={() => {
            videoRef.current?.play().catch(() => {});
          }}
        >
          <span className="play-circle">
            <Play size={13} fill="currentColor" />
          </span>
          {copy.watchDemo}
        </button>
      )}
    </div>
  );
}
