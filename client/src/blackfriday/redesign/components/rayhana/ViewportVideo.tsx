import React, { useEffect, useRef, useState } from "react";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
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
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (time: number) => {
    const seconds = Math.max(0, Math.floor(time || 0));
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  };

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

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
      className={`ds-video-overlay${started ? " is-started" : ""}${playing ? " is-playing" : ""}`}
      id="mandoline-demo"
      hidden={!enabled}
      tabIndex={-1}
      aria-label={copy.videoLabel}
      onPointerEnter={() => {
        videoRef.current?.play().catch(() => {});
      }}
    >
      <p id="mandoline-demo-controls" className="sr-only">
        {controlHint[language]}
      </p>
      <video
        ref={videoRef}
        playsInline
        muted={muted}
        preload="none"
        poster={poster}
        aria-label={copy.videoLabel}
        aria-describedby="mandoline-demo-controls"
        aria-hidden={!started}
        tabIndex={-1}
        onPlaying={() => {
          setStarted(true);
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={event => setDuration(event.currentTarget.duration || 0)}
        onDurationChange={event => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)}
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
      <div className="ds-video-controls" dir="ltr" role="group" aria-label={copy.videoLabel}>
        <button
          type="button"
          className="ds-video-control-button"
          aria-label={playing ? copy.videoPause : copy.videoPlay}
          onClick={togglePlayback}
        >
          {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
        </button>
        <span className="ds-video-time">{formatTime(currentTime)}</span>
        <input
          className="ds-video-seek"
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          aria-label={copy.videoSeek}
          style={{ "--video-progress": `${duration ? (currentTime / duration) * 100 : 0}%` } as React.CSSProperties}
          onChange={event => {
            const time = Number(event.currentTarget.value);
            if (videoRef.current) videoRef.current.currentTime = time;
            setCurrentTime(time);
          }}
        />
        <span className="ds-video-time">{formatTime(duration)}</span>
        <button
          type="button"
          className="ds-video-control-button"
          aria-label={muted ? copy.videoUnmute : copy.videoMute}
          aria-pressed={!muted}
          onClick={() => {
            const nextMuted = !muted;
            setMuted(nextMuted);
            if (videoRef.current) videoRef.current.muted = nextMuted;
          }}
        >
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
        <button
          type="button"
          className="ds-video-control-button"
          aria-label={copy.videoFullscreen}
          onClick={() => videoRef.current?.requestFullscreen?.()}
        >
          <Maximize size={16} />
        </button>
      </div>
    </div>
  );
}
