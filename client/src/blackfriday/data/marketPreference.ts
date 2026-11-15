import type { MarketId } from "./catalog";
import type { MarketSuggestion } from "@shared/marketSuggestion";

export type MarketPreference = {
  market: MarketId | "";
  origin: "none" | "automatic" | "manual";
  suggestion: MarketSuggestion | null;
  loading: boolean;
};
export type MarketPreferenceAction =
  | { type: "loading" }
  | { type: "manual"; market: MarketId }
  | { type: "suggestion"; suggestion: MarketSuggestion };
export const emptyMarketPreference: MarketPreference = {
  market: "",
  origin: "none",
  suggestion: null,
  loading: false,
};

export function isMarket(value: unknown): value is MarketId {
  return typeof value === "string" && ["US", "CA", "AU", "DE"].includes(value);
}

export function marketPreferenceReducer(
  state: MarketPreference,
  action: MarketPreferenceAction
): MarketPreference {
  if (action.type === "manual")
    return {
      ...state,
      market: action.market,
      origin: "manual",
      loading: false,
    };
  if (action.type === "loading")
    return { ...state, loading: state.origin !== "manual" };
  const suggestion = action.suggestion;
  return {
    ...state,
    suggestion,
    loading: false,
    ...(state.origin !== "manual"
      ? {
          market: suggestion.market ?? "",
          origin: suggestion.market
            ? ("automatic" as const)
            : ("none" as const),
        }
      : {}),
  };
}
