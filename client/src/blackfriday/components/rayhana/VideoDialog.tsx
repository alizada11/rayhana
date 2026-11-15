import React, { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Language, media, ProductId } from "@/blackfriday/data/catalog";
import { campaignCopy } from "@/blackfriday/data/campaign";
import type { Copy } from "./BuyingDialog";

const controlLabels: Record<
  Language,
  { play: string; pause: string; mute: string; unmute: string; progress: string; volume: string; fullscreen: string; exitFullscreen: string }
> = {
  en: {
    play: "Play video",
    pause: "Pause video",
    mute: "Mute video",
    unmute: "Unmute video",
    progress: "Video progress",
    volume: "Volume",
    fullscreen: "Enter fullscreen",
    exitFullscreen: "Exit fullscreen",
  },
  fa: {
    play: "پخش ویدیو",
    pause: "توقف ویدیو",
    mute: "بی‌صدا کردن ویدیو",
    unmute: "با صدا کردن ویدیو",
    progress: "نوار پیشرفت ویدیو",
    volume: "بلندی صدا",
    fullscreen: "نمایش تمام‌صفحه",
    exitFullscreen: "خروج از تمام‌صفحه",
  },
  ps: {
    play: "ویډیو غږول",
    pause: "ویډیو درول",
    mute: "ویډیو غلې کول",
    unmute: "د ویډیو غږ بېرته فعالول",
    progress: "د ویډیو پرمختګ",
    volume: "د غږ کچه",
    fullscreen: "بشپړ سکرین ته تلل",
    exitFullscreen: "له بشپړ سکرین څخه وتل",
  },
};

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const seconds = Math.floor(value);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function VideoDialog({
  open,
  onOpenChange,
  language,
  copy,
  product = "mandoline",
  portalContainer,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  language: Language;
  copy: Copy;
  product?: ProductId;
  portalContainer?: HTMLElement | null;
}) {
  const returnFocus = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const pot = product === "pot";
  const c = campaignCopy[language];
  const labels = controlLabels[language];
  const source = pot ? media.potDemo : media.demo;
  const title = pot ? c.potVideoLabel : copy.videoLabel;
  const description = pot ? c.potVideoAction : copy.videoNote;
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const syncFullscreen = () =>
      setFullscreen(document.fullscreenElement === playerRef.current);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    if (!open) {
      videoRef.current?.pause();
      setPlaying(false);
    } else {
      setCurrentTime(0);
      setDuration(0);
      setPlaying(false);
    }
  }, [open, source]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  }

  function seek(value: number) {
    const video = videoRef.current;
    if (!video || !Number.isFinite(value)) return;
    video.currentTime = value;
    setCurrentTime(value);
  }

  function changeVolume(value: number) {
    const next = Math.max(0, Math.min(1, value));
    const video = videoRef.current;
    setVolume(next);
    setMuted(next === 0);
    if (video) {
      video.volume = next;
      video.muted = next === 0;
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    setMuted(next);
    if (!next && volume === 0) changeVolume(0.6);
  }

  async function toggleFullscreen() {
    const player = playerRef.current;
    if (!player) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await player.requestFullscreen();
    } catch {
      setFullscreen(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) videoRef.current?.pause();
    onOpenChange(nextOpen);
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal container={portalContainer ?? undefined}>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className="video-dialog"
          dir={language === "en" ? "ltr" : "rtl"}
          onOpenAutoFocus={() => {
            returnFocus.current = document.activeElement as HTMLElement;
          }}
          onCloseAutoFocus={event => {
            event.preventDefault();
            returnFocus.current?.focus();
          }}
        >
          <Dialog.Close className="dialog-close" aria-label={copy.close}>
            <X size={20} />
          </Dialog.Close>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description className={pot ? "sr-only" : "video-dialog-description"}>
            {description}
          </Dialog.Description>
          {source ? (
            <div className="video-player" ref={playerRef} dir="ltr">
              <video
                key={source}
                ref={videoRef}
                playsInline
                autoPlay
                preload="metadata"
                poster={pot ? media.potDemoPoster : media.demoPoster}
                aria-label={title}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)}
                onLoadedMetadata={event => {
                  const video = event.currentTarget;
                  setDuration(video.duration || 0);
                  video.volume = volume;
                }}
                onDoubleClick={() => void toggleFullscreen()}
                onClick={togglePlayback}
              >
                <source src={source} type="video/mp4" />
                <a href={source} download>
                  {copy.videoFallback}
                </a>
              </video>
              {!playing && (
                <button
                  type="button"
                  className="video-center-play"
                  onClick={togglePlayback}
                  aria-label={labels.play}
                >
                  <Play size={26} fill="currentColor" />
                </button>
              )}
              <div className="video-controls" role="group" aria-label="Video controls">
                <button
                  type="button"
                  className="video-control-button"
                  onClick={togglePlayback}
                  aria-label={playing ? labels.pause : labels.play}
                >
                  {playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
                </button>
                <span className="video-time" aria-live="off">
                  {formatTime(currentTime)} <span>/</span> {formatTime(duration)}
                </span>
                <input
                  className="video-progress"
                  type="range"
                  min={0}
                  max={duration || 1}
                  step={0.1}
                  value={Math.min(currentTime, duration || 1)}
                  style={{ "--video-progress": `${progress}%` } as React.CSSProperties}
                  aria-label={labels.progress}
                  aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
                  onChange={event => seek(Number(event.currentTarget.value))}
                />
                <button
                  type="button"
                  className="video-control-button video-mute-button"
                  onClick={toggleMute}
                  aria-label={muted || volume === 0 ? labels.unmute : labels.mute}
                >
                  {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  className="video-volume"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  style={{ "--video-progress": `${(muted ? 0 : volume) * 100}%` } as React.CSSProperties}
                  aria-label={labels.volume}
                  onChange={event => changeVolume(Number(event.currentTarget.value))}
                />
                <button
                  type="button"
                  className="video-control-button video-fullscreen-button"
                  onClick={() => void toggleFullscreen()}
                  aria-label={fullscreen ? labels.exitFullscreen : labels.fullscreen}
                >
                  {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
            </div>
          ) : (
            <p className="video-unavailable" role="status">
              {copy.videoUnavailable}
            </p>
          )}
          <p className="video-safety">{pot ? copy.potSafety : copy.mandolineSafety}</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
