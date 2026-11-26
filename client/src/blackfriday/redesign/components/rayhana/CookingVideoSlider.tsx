import React, { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Maximize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { media, type Language } from "@/blackfriday/redesign/data/catalog";
import { campaignCopy } from "@/blackfriday/redesign/data/campaign";
import type { Copy } from "./BuyingDialog";

export default function CookingVideoSlider({
  language,
  copy,
  variant = "inline",
}: {
  language: Language;
  copy: Copy;
  variant?: "inline" | "dialog";
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const number = new Intl.NumberFormat(
    language === "en" ? "en" : language === "fa" ? "fa-AF" : "ps-AF"
  );
  const videos = media.potVideoSlides;
  const potVideoLabel = campaignCopy[language].potVideoLabel;
  const potVideoAction = campaignCopy[language].potVideoAction;
  const goTo = (index: number) => {
    videoRef.current?.pause();
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setActive((index + videos.length) % videos.length);
  };
  const formatTime = (time: number) => {
    const seconds = Math.max(0, Math.floor(time));
    const format = (value: number) => number.format(value).padStart(2, "0");
    return `${format(Math.floor(seconds / 60))}:${format(seconds % 60)}`;
  };
  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <div
      className="cooking-video-slider"
      data-variant={variant}
      dir={language === "en" ? "ltr" : "rtl"}
    >
      <div
        ref={playerRef}
        className={`cooking-card cooking-video-slide${playing ? " is-playing" : ""}`}
      >
        <video
          key={videos[active]}
          ref={videoRef}
          playsInline
          muted={muted}
          preload="metadata"
          aria-label={`${potVideoLabel} ${number.format(active + 1)}`}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onLoadedMetadata={event =>
            setDuration(event.currentTarget.duration || 0)
          }
          onDurationChange={event =>
            setDuration(event.currentTarget.duration || 0)
          }
          onTimeUpdate={event =>
            setCurrentTime(event.currentTarget.currentTime)
          }
          onClick={togglePlayback}
        >
          <source src={videos[active]} type="video/mp4" />
          <a href={videos[active]} download>
            {copy.videoFallback}
          </a>
        </video>
        <div className="cooking-video-caption">
          <span>
            <strong>{potVideoLabel}</strong>
            <small>{potVideoAction}</small>
          </span>
          <span className="cooking-slide-count" aria-live="polite">
            {number.format(active + 1)} / {number.format(videos.length)}
          </span>
        </div>
        <div
          className="cooking-video-controls"
          dir="ltr"
          role="group"
          aria-label={potVideoLabel}
        >
          <button
            type="button"
            className="cooking-control-button"
            onClick={togglePlayback}
            aria-label={playing ? copy.videoPause : copy.videoPlay}
          >
            {playing ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
          </button>
          <span className="cooking-video-time">{formatTime(currentTime)}</span>
          <input
            className="cooking-video-seek"
            type="range"
            min="0"
            max={duration || 1}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            aria-label={copy.videoSeek}
            style={
              {
                "--video-progress": `${duration ? (currentTime / duration) * 100 : 0}%`,
              } as React.CSSProperties
            }
            onChange={event => {
              const time = Number(event.currentTarget.value);
              if (videoRef.current) videoRef.current.currentTime = time;
              setCurrentTime(time);
            }}
          />
          <span className="cooking-video-time">{formatTime(duration)}</span>
          <button
            type="button"
            className="cooking-control-button"
            onClick={() => setMuted(value => !value)}
            aria-label={muted ? copy.videoUnmute : copy.videoMute}
            aria-pressed={muted}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            type="button"
            className="cooking-control-button"
            onClick={() => {
              const video = videoRef.current as
                | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
                | null;
              if (!video) return;
              if (playerRef.current?.requestFullscreen)
                void playerRef.current.requestFullscreen();
              else video.webkitEnterFullscreen?.();
            }}
            aria-label={copy.videoFullscreen}
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>
      <div className="cooking-slider-controls" aria-label={potVideoLabel}>
        <button
          type="button"
          className="cooking-slider-arrow"
          onClick={() => goTo(active - 1)}
          aria-label={copy.previousVideo}
        >
          {language === "en" ? <ArrowLeft /> : <ArrowRight />}
        </button>
        <div
          className="cooking-slider-dots"
          role="group"
          aria-label={copy.potVideoLabel}
        >
          {videos.map((_, index) => (
            <button
              type="button"
              key={index}
              className={`cooking-slider-dot${active === index ? " is-active" : ""}`}
              onClick={() => goTo(index)}
            aria-label={`${potVideoLabel} ${number.format(index + 1)}`}
              aria-current={active === index ? "true" : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          className="cooking-slider-arrow"
          onClick={() => goTo(active + 1)}
          aria-label={copy.nextVideo}
        >
          {language === "en" ? <ArrowRight /> : <ArrowLeft />}
        </button>
      </div>
    </div>
  );
}
