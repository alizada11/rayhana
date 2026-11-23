import React, { useEffect, useRef, useState } from "react";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { connectViewportVideo } from "./viewportVideoPlayback";
import type { Copy } from "./BuyingDialog";

export default function ScrollAutoplayVideo({
  src,
  poster,
  label,
  fallback,
  copy,
}: {
  src: string;
  poster: string;
  label: string;
  fallback: string;
  copy: Copy;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
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
    const playback = connectViewportVideo(videoRef.current);
    return () => playback.dispose();
  }, []);

  return (
    <div
      ref={shellRef}
      className={`pot-scroll-video-shell${playing ? " is-playing" : ""}`}
      onClick={event => {
        if (event.target === videoRef.current) togglePlayback();
      }}
    >
      <video
        ref={videoRef}
        className="pot-scroll-video"
        playsInline
        muted={muted}
        preload="metadata"
        poster={poster}
        aria-label={label}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={event => setDuration(event.currentTarget.duration || 0)}
        onDurationChange={event => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)}
      >
        <source src={src} type="video/mp4" />
        <a href={src} download>
          {fallback}
        </a>
      </video>
      <div className="pot-video-controls" dir="ltr" role="group" aria-label={label}>
        <button
          type="button"
          className="pot-video-control-button"
          aria-label={playing ? copy.videoPause : copy.videoPlay}
          onClick={togglePlayback}
        >
          {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </button>
        <span className="pot-video-time">{formatTime(currentTime)}</span>
        <input
          className="pot-video-seek"
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
        <span className="pot-video-time">{formatTime(duration)}</span>
        <button
          type="button"
          className="pot-video-control-button"
          aria-label={muted ? copy.videoUnmute : copy.videoMute}
          aria-pressed={!muted}
          onClick={() => {
            const nextMuted = !muted;
            setMuted(nextMuted);
            if (videoRef.current) videoRef.current.muted = nextMuted;
          }}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button
          type="button"
          className="pot-video-control-button"
          aria-label={copy.videoFullscreen}
          onClick={() => shellRef.current?.requestFullscreen?.()}
        >
          <Maximize size={17} />
        </button>
      </div>
    </div>
  );
}
