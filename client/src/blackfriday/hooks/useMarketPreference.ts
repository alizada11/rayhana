import { useEffect, useReducer } from "react";
import { countryFromTimezone, makeSuggestion } from "@shared/marketSuggestion";
import type { MarketId } from "@/blackfriday/data/catalog";
import {
  emptyMarketPreference,
  isMarket,
  marketPreferenceReducer,
} from "@/blackfriday/data/marketPreference";

export const MANUAL_MARKET_KEY = "rayhana-market";

/** Fetches country only on this site's own origin. No GPS permission,
 * coordinates, external browser request or new tracking cookie is used. */
export default function useMarketPreference() {
  const [preference, dispatch] = useReducer(
    marketPreferenceReducer,
    emptyMarketPreference
  );
  useEffect(() => {
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
    let code: string | null = null;
    try {
      code = countryFromTimezone(
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );
    } catch {
      /* Ask for delivery country when no hint is available. */
    }
    dispatch({
      type: "suggestion",
      suggestion: makeSuggestion(code, code ? "timezone" : "unknown"),
    });
    return undefined;
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
