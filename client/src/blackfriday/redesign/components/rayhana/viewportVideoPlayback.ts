export function connectViewportVideo(video: HTMLVideoElement) {
  const doc = video.ownerDocument;
  const reducedMotion = doc.defaultView?.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  );
  let visible = false;
  let suspended = false;
  let disposed = false;
  let manuallyPaused = false;
  let automaticPause = false;

  // The first automatic start is silent. A user's later sound choice is retained.
  video.muted = true;

  function pause() {
    if (video.paused) return;
    automaticPause = true;
    video.pause();
  }

  function sync() {
    if (disposed || !visible || suspended || doc.hidden) {
      pause();
      return;
    }
    if (
      reducedMotion?.matches ||
      manuallyPaused ||
      video.ended ||
      !video.paused
    )
      return;
    try {
      const attempt = video.play();
      attempt
        ?.then(() => {
          // An async play must not outlive its visibility or modal state.
          if (disposed || !visible || suspended || doc.hidden || manuallyPaused)
            pause();
        })
        .catch(() => {
          // Browser autoplay restrictions leave native manual controls available.
        });
    } catch {
      // Older browsers may throw rather than return a rejected play promise.
    }
  }

  function onPause() {
    if (automaticPause) {
      automaticPause = false;
      return;
    }
    if (visible && !suspended && !doc.hidden && !video.ended)
      manuallyPaused = true;
  }
  function onPlay() {
    manuallyPaused = false;
  }
  function onMotionChange() {
    if (reducedMotion?.matches) pause();
    else sync();
  }

  const observer =
    typeof IntersectionObserver === "function"
      ? new IntersectionObserver(
          entries => {
            const entry = entries.find(item => item.target === video);
            if (!entry) return;
            visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
            sync();
          },
          { threshold: [0, 0.5] }
        )
      : null;

  video.addEventListener("pause", onPause);
  video.addEventListener("play", onPlay);
  doc.addEventListener("visibilitychange", sync);
  reducedMotion?.addEventListener?.("change", onMotionChange);
  observer?.observe(video);

  return {
    setSuspended(next: boolean) {
      suspended = next;
      sync();
    },
    dispose() {
      disposed = true;
      observer?.disconnect();
      video.removeEventListener("pause", onPause);
      video.removeEventListener("play", onPlay);
      doc.removeEventListener("visibilitychange", sync);
      reducedMotion?.removeEventListener?.("change", onMotionChange);
      pause();
    },
  };
}
