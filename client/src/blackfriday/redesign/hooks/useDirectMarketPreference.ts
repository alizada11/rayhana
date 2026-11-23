import { useEffect, useState } from "react";
import useMarketPreference, { MANUAL_MARKET_KEY } from "./useMarketPreference";
import {
  getDirectDeliveryMarket,
  isSupplementalDirectMarket,
  legacyMarketForDirectMarket,
  SUPPLEMENTAL_MANUAL_MARKET_KEY,
  type DirectMarketId,
} from "@/blackfriday/redesign/data/directStores";

/** Improved design only. Reuses the existing country request and manual reducer.
 * Extra mandoline destinations retain a separate choice; the original design sees Germany. */
export default function useDirectMarketPreference() {
  const preference = useMarketPreference();
  const [supplemental, setSupplemental] = useState<DirectMarketId | "">("");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SUPPLEMENTAL_MANUAL_MARKET_KEY);
      if (
        ["DE", "UK"].includes(localStorage.getItem(MANUAL_MARKET_KEY) ?? "") &&
        isSupplementalDirectMarket(saved)
      )
        setSupplemental(saved);
    } catch {
      // Manual choices still work for this visit when storage is blocked.
    }
  }, []);
  function chooseMarket(market: DirectMarketId) {
    const extra = isSupplementalDirectMarket(market) ? market : "";
    setSupplemental(extra);
    try {
      if (extra) localStorage.setItem(SUPPLEMENTAL_MANUAL_MARKET_KEY, extra);
      else localStorage.removeItem(SUPPLEMENTAL_MANUAL_MARKET_KEY);
    } catch {
      // Do not block native store navigation when storage is unavailable.
    }
    preference.chooseMarket(legacyMarketForDirectMarket(market));
  }
  return {
    ...preference,
    directMarket: getDirectDeliveryMarket(preference, supplemental),
    chooseMarket,
  };
}
