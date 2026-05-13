import type { SsrPayload } from "./types";

declare global {
  interface Window {
    __RAYHANA_SSR__?: SsrPayload;
  }
}

export function getSsrPayload(): SsrPayload | null {
  if (typeof window === "undefined") return null;
  if (window.__RAYHANA_SSR__) return window.__RAYHANA_SSR__;

  const node = document.getElementById("ssr-state");
  const raw = node?.textContent?.trim();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SsrPayload;
    window.__RAYHANA_SSR__ = parsed;
    return parsed;
  } catch {
    return null;
  }
}
