import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useSeoDefaults, type SeoDefaults } from "@/hooks/useSeoDefaults";
import {
  SUPPORTED_LOCALES,
  normalizeLocale,
  stripLocaleFromPath,
  withLocalePath,
} from "@/lib/locales";

type SeoTagsProps = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
  pageKey?: string;
  seoData?: SeoDefaults;
};

export default function SeoTags(props: SeoTagsProps) {
  const { i18n } = useTranslation();
  const [location] = useLocation();
  const lang = normalizeLocale(i18n.language);
  const { seo } = useSeoDefaults({
    initialData: props.seoData,
    enabled: !props.seoData,
  });

  const pageSeo =
    (props.pageKey && seo.pages?.[props.pageKey]) ||
    (props.pageKey && seo.pages?.[props.pageKey.toLowerCase()]) ||
    undefined;

  const title =
    props.title ||
    (pageSeo?.title?.[lang] || pageSeo?.title?.en) ||
    seo?.defaultTitle?.[lang] ||
    seo?.defaultTitle?.en ||
    (typeof document !== "undefined" ? document.title : "");
  const description =
    props.description ||
    (pageSeo?.description?.[lang] || pageSeo?.description?.en) ||
    seo?.defaultDescription?.[lang] ||
    seo?.defaultDescription?.en ||
    "";
  const baseUrl = getBaseUrl(seo?.baseUrl);
  const image = resolveUrl(
    props.image || pageSeo?.image || seo?.defaultImage,
    baseUrl
  );
  const pagePath = getPathForSeo(props.url, location);
  const canonicalPath = withLocalePath(pagePath, lang);
  const url = resolveUrl(canonicalPath, baseUrl);
  const type = props.type || "website";
  const siteName = seo?.siteName || "";
  const twitterHandle = seo?.twitterHandle || "";

  useEffect(() => {
    if (title) document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", type);
    if (siteName) setMeta("property", "og:site_name", siteName);
    if (url) setMeta("property", "og:url", url);
    if (image) setMeta("property", "og:image", image);
    setMeta("name", "twitter:card", "summary_large_image");
    if (twitterHandle) setMeta("name", "twitter:site", `@${twitterHandle}`);
    if (title) setMeta("name", "twitter:title", title);
    if (description) setMeta("name", "twitter:description", description);
    if (image) setMeta("name", "twitter:image", image);
    if (props.publishedTime)
      setMeta("property", "article:published_time", props.publishedTime);
    if (props.modifiedTime)
      setMeta("property", "article:modified_time", props.modifiedTime);
    // canonical
    if (url) {
      let link = document.querySelector("link[rel='canonical']") as
        | HTMLLinkElement
        | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = url;
    }

    document
      .querySelectorAll("link[data-seo-alternate='true']")
      .forEach(link => link.parentNode?.removeChild(link));

    SUPPORTED_LOCALES.forEach(locale => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = locale;
      link.href = resolveUrl(withLocalePath(pagePath, locale), baseUrl);
      link.dataset.seoAlternate = "true";
      document.head.appendChild(link);
    });

    const defaultLink = document.createElement("link");
    defaultLink.rel = "alternate";
    defaultLink.hreflang = "x-default";
    defaultLink.href = resolveUrl(withLocalePath(pagePath, "en"), baseUrl);
    defaultLink.dataset.seoAlternate = "true";
    document.head.appendChild(defaultLink);

    document
      .querySelectorAll("script[data-seo-jsonld='true']")
      .forEach(script => script.parentNode?.removeChild(script));

    buildJsonLd({
      baseUrl,
      description,
      image,
      lang,
      siteName: siteName || "Rayhana",
      title,
      type,
      url,
      publishedTime: props.publishedTime,
      modifiedTime: props.modifiedTime,
    }).forEach(data => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seoJsonld = "true";
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    });
  }, [
    title,
    description,
    image,
    url,
    type,
    siteName,
    twitterHandle,
    props.publishedTime,
    props.modifiedTime,
    pagePath,
    baseUrl,
  ]);

  return null;
}

function setMeta(
  attr: "name" | "property",
  key: string,
  value?: string | null
) {
  if (value == null) return;
  let tag = document.querySelector(`meta[${attr}='${key}']`) as
    | HTMLMetaElement
    | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.content = value;
}

function resolveUrl(url?: string, base?: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (base) return `${base.replace(/\/+$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
  return url;
}

function buildJsonLd({
  baseUrl,
  description,
  image,
  lang,
  siteName,
  title,
  type,
  url,
  publishedTime,
  modifiedTime,
}: {
  baseUrl: string;
  description: string;
  image: string;
  lang: string;
  siteName: string;
  title: string;
  type: string;
  url: string;
  publishedTime?: string;
  modifiedTime?: string;
}) {
  const siteUrl = baseUrl.replace(/\/+$/, "");
  const graph: any[] = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: image || `${siteUrl}/images/logo.png`,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
      inLanguage: lang,
    },
    {
      "@context": "https://schema.org",
      "@type": type === "article" ? "Article" : "WebPage",
      headline: title,
      name: title,
      description,
      url,
      image,
      inLanguage: lang,
      ...(type === "article"
        ? {
            datePublished: publishedTime,
            dateModified: modifiedTime || publishedTime,
            publisher: {
              "@type": "Organization",
              name: siteName,
              logo: {
                "@type": "ImageObject",
                url: image || `${siteUrl}/images/logo.png`,
              },
            },
          }
        : {}),
    },
  ];

  return graph;
}

function getBaseUrl(configured?: string) {
  if (configured) return configured;
  if (import.meta.env.VITE_BASE_URL) return import.meta.env.VITE_BASE_URL;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

function getPathForSeo(url: string | undefined, location: string) {
  if (!url) return stripLocaleFromPath(location || "/").path;
  try {
    const parsed = new URL(
      url,
      typeof window !== "undefined" ? window.location.origin : "https://rayhana.com"
    );
    return stripLocaleFromPath(parsed.pathname || "/").path;
  } catch {
    return stripLocaleFromPath(url.startsWith("/") ? url : `/${url}`).path;
  }
}
