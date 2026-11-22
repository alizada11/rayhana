import { useEffect, useReducer } from "react";
import { countryFromTimezone, makeSuggestion } from "@shared/marketSuggestion";
import type { MarketId } from "@/blackfriday/redesign/data/catalog";
import {
  emptyMarketPreference,
  isMarket,
  marketPreferenceReducer,
} from "@/blackfriday/redesign/data/marketPreference";

export const MANUAL_MARKET_KEY = "rayhana-market";

/** Fetches country only on this site's own origin. No GPS permission,
 * coordinates, external browser request or new tracking cookie is used. */
export default function useMarketPreference() {
  const [preference, dispatch] = useReducer(
    marketPreferenceReducer,
    emptyMarketPreference
  );
  useEffect(() => {
    let active = true;
    let manual = false;
    try {
      const saved = localStorage.getItem(MANUAL_MARKET_KEY);
      if (isMarket(saved)) {
        manual = true;
        dispatch({ type: "manual", market: saved });
      }
    } catch {
      /* Manual in-memory selection works with storage blocked. */
    }
    if (manual) return;
    dispatch({ type: "loading" });
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 3000);
    function fallback() {
      let code: string | null = null;
      try {
        code = countryFromTimezone(
          Intl.DateTimeFormat().resolvedOptions().timeZone
        );
      } catch {
        /* Ask for delivery country when no hint is available. */
      }
      if (active)
        dispatch({
          type: "suggestion",
          suggestion: makeSuggestion(code, code ? "timezone" : "unknown"),
        });
    }
    void (async () => {
      try {
        const response = await fetch("/api/market-suggestion", {
          signal: abort.signal,
          credentials: "omit",
          cache: "no-store",
        });
        if (!response.ok) throw new Error("country unavailable");
        const result = await response.json();
        if (!result || typeof result !== "object")
          throw new Error("invalid response");
        const code =
          typeof result.countryCode === "string" &&
          /^[A-Z]{2}$/.test(result.countryCode) &&
          !["XX", "ZZ"].includes(result.countryCode)
            ? result.countryCode
            : null;
        if (code && ["edge", "ip"].includes(result.source)) {
          if (active)
            dispatch({
              type: "suggestion",
              suggestion: makeSuggestion(code, result.source),
            });
        } else fallback();
      } catch {
        fallback();
      } finally {
        clearTimeout(timer);
      }
    })();
    return () => {
      active = false;
      clearTimeout(timer);
      abort.abort();
    };
  }, []);

  function chooseMarket(market: MarketId) {
    dispatch({ type: "manual", market });
    try {
      localStorage.setItem(MANUAL_MARKET_KEY, market);
    } catch {
      /* Choice lasts for this visit. */
    }
  }
  return { ...preference, chooseMarket };
}
