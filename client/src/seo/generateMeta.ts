import { SEO_ROUTE_DEFAULTS } from "./routes";
import type { SeoDefaults } from "@/hooks/useSeoDefaults";

type GenerateMetaArgs = {
  pageKey?: string;
  lang: string;
  baseUrl: string;
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
  seoData?: SeoDefaults | null;
};

export type ResolvedMeta = {
  title: string;
  description: string;
  canonicalUrl: string;
  image: string;
  type: "website" | "article" | "product";
  siteName: string;
  twitterHandle: string;
  publishedTime?: string;
  modifiedTime?: string;
};

function localize(
  record: Record<string, string> | undefined,
  lang: string,
  fallback = ""
) {
  return record?.[lang] || record?.en || fallback;
}

function resolveUrl(url: string | undefined, baseUrl: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return `${normalizedBase}${normalizedPath}`;
}

export function generateMeta({
  pageKey,
  lang,
  baseUrl,
  title,
  description,
  image,
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  seoData,
}: GenerateMetaArgs): ResolvedMeta {
  const defaults = pageKey
    ? SEO_ROUTE_DEFAULTS[pageKey as keyof typeof SEO_ROUTE_DEFAULTS]
    : undefined;
  const pageMap =
    seoData?.pages && !Array.isArray(seoData.pages)
      ? (seoData.pages as Record<
          string,
          {
            title?: Record<string, string>;
            description?: Record<string, string>;
            image?: string;
          }
        >)
      : {};

  const pageSeo =
    (pageKey && pageMap[pageKey]) ||
    (pageKey && pageMap[pageKey.toLowerCase()]) ||
    undefined;

  return {
    title:
      title ||
      localize(pageSeo?.title, lang) ||
      localize(seoData?.defaultTitle, lang) ||
      defaults?.title ||
      "Rayhana",
    description:
      description ||
      localize(pageSeo?.description, lang) ||
      localize(seoData?.defaultDescription, lang) ||
      defaults?.description ||
      "Rayhana",
    canonicalUrl: resolveUrl(url || "/", baseUrl),
    image: resolveUrl(image || pageSeo?.image || seoData?.defaultImage, baseUrl),
    type,
    siteName: seoData?.siteName || "Rayhana",
    twitterHandle: seoData?.twitterHandle || "",
    publishedTime,
    modifiedTime,
  };
}
