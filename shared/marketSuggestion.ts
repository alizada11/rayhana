export type SuggestedMarket = "US" | "CA" | "AU" | "DE" | "UK" | "AF";
export type LocationSource = "edge" | "ip" | "timezone" | "unknown";
export type MarketSuggestion = {
  countryCode: string | null;
  market: SuggestedMarket | null;
  source: LocationSource;
  regional: boolean;
};

/** A regional marketplace suggestion, never a warehouse-distance calculation
 * or a claim that a marketplace will deliver to the visitor's address. */
const europe = new Set([
  "AD",
  "AL",
  "AT",
  "AX",
  "BA",
  "BE",
  "BG",
  "BY",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FO",
  "FR",
  "GB",
  "GG",
  "GI",
  "GR",
  "HR",
  "HU",
  "IE",
  "IM",
  "IS",
  "IT",
  "JE",
  "LI",
  "LT",
  "LU",
  "LV",
  "MC",
  "MD",
  "ME",
  "MK",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "RS",
  "SE",
  "SI",
  "SK",
  "SM",
  "UA",
  "VA",
  "XK",
]);

export function marketForCountry(
  country: string | null | undefined
): SuggestedMarket | null {
  const code = country?.trim().toUpperCase();
  if (code === "GB") return "UK";
  if (code === "AF") return "AF";
  if (code === "CA") return "CA";
  if (code === "US" || code === "PR" || code === "VI" || code === "MX")
    return "US";
  if (code === "AU" || code === "NZ") return "AU";
  if (code && europe.has(code)) return "DE";
  return null;
}

export function makeSuggestion(
  countryCode: string | null,
  source: LocationSource
): MarketSuggestion {
  const code =
    countryCode && /^[A-Z]{2}$/.test(countryCode) ? countryCode : null;
  const market = marketForCountry(code);
  return {
    countryCode: code,
    market,
    source: code ? source : "unknown",
    regional: !!market && market !== code,
  };
}

/** Used only when the network does not provide a country. A timezone is a
 * low-confidence browser setting, not GPS or proof of residence. */
export function countryFromTimezone(
  timezone: string | undefined
): string | null {
  if (!timezone) return null;
  const canada = new Set([
    "America/Toronto",
    "America/Vancouver",
    "America/Edmonton",
    "America/Winnipeg",
    "America/Halifax",
    "America/St_Johns",
    "America/Regina",
    "America/Whitehorse",
    "America/Dawson",
    "America/Moncton",
    "America/Glace_Bay",
    "America/Goose_Bay",
    "America/Swift_Current",
    "America/Rankin_Inlet",
    "America/Resolute",
    "America/Cambridge_Bay",
    "America/Inuvik",
    "America/Iqaluit",
    "America/Creston",
    "America/Dawson_Creek",
    "America/Fort_Nelson",
  ]);
  const usa = new Set([
    "America/New_York",
    "America/Detroit",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Phoenix",
    "America/Anchorage",
    "America/Juneau",
    "America/Boise",
    "America/Adak",
    "America/Nome",
    "America/Sitka",
    "America/Yakutat",
    "America/Metlakatla",
    "Pacific/Honolulu",
    "America/Indiana/Indianapolis",
    "America/Indiana/Knox",
    "America/Indiana/Marengo",
    "America/Indiana/Petersburg",
    "America/Indiana/Tell_City",
    "America/Indiana/Vevay",
    "America/Indiana/Vincennes",
    "America/Indiana/Winamac",
    "America/Kentucky/Louisville",
    "America/Kentucky/Monticello",
    "America/North_Dakota/Beulah",
    "America/North_Dakota/Center",
    "America/North_Dakota/New_Salem",
  ]);
  if (canada.has(timezone)) return "CA";
  if (usa.has(timezone)) return "US";
  if (timezone.startsWith("Australia/")) return "AU";
  if (timezone === "Pacific/Auckland" || timezone === "Pacific/Chatham")
    return "NZ";
  if (timezone === "Asia/Kabul") return "AF";
  const europeanZones: Record<string, string> = {
    Berlin: "DE",
    Busingen: "DE",
    London: "GB",
    Paris: "FR",
    Amsterdam: "NL",
    Brussels: "BE",
    Vienna: "AT",
    Zurich: "CH",
    Rome: "IT",
    Madrid: "ES",
    Lisbon: "PT",
    Dublin: "IE",
    Oslo: "NO",
    Stockholm: "SE",
    Copenhagen: "DK",
    Helsinki: "FI",
    Warsaw: "PL",
    Prague: "CZ",
    Bratislava: "SK",
    Budapest: "HU",
    Bucharest: "RO",
    Sofia: "BG",
    Athens: "GR",
    Tallinn: "EE",
    Riga: "LV",
    Vilnius: "LT",
    Luxembourg: "LU",
    Malta: "MT",
    Ljubljana: "SI",
    Zagreb: "HR",
    Sarajevo: "BA",
    Belgrade: "RS",
    Skopje: "MK",
    Podgorica: "ME",
    Tirane: "AL",
    Chisinau: "MD",
    Kyiv: "UA",
    Kiev: "UA",
    Minsk: "BY",
    Andorra: "AD",
    Monaco: "MC",
    San_Marino: "SM",
    Vatican: "VA",
    Gibraltar: "GI",
    Guernsey: "GG",
    Jersey: "JE",
    Isle_of_Man: "IM",
  };
  if (timezone.startsWith("Europe/"))
    return europeanZones[timezone.slice(7)] ?? null;
  if (timezone === "Atlantic/Reykjavik") return "IS";
  if (timezone === "Atlantic/Faroe") return "FO";
  if (timezone === "Asia/Nicosia" || timezone === "Asia/Famagusta") return "CY";
  if (timezone === "America/Puerto_Rico") return "PR";
  if (timezone === "America/St_Thomas") return "VI";
  if (timezone === "America/Mexico_City") return "MX";
  return null;
}
