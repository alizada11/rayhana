import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSeoDefaults, type SeoDefaults } from "@/hooks/useSeoDefaults";
import { useSeoContext } from "@/seo/seo-context";
import {
  SUPPORTED_LOCALES,
  type Locale,
  localizePath,
} from "@/lib/routing/locale";
import { useCurrentPath, useRequestContext } from "@/ssr/request-context";

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
  robots?: string;
  canonical?: string;
  structuredData?: Array<Record<string, any>>;
};

export default function SeoTags(props: SeoTagsProps) {
  const { i18n } = useTranslation();
  const lang = ((i18n.language || "en").split("-")[0] || "en") as Locale;
  const { seo } = useSeoDefaults({
    initialData: props.seoData,
    enabled: !props.seoData,
  });
  const seoContext = useSeoContext();
  const currentPath = useCurrentPath();
  const { locale: currentLocale, origin } = useRequestContext();
  const defaultCanonical = `${origin}${localizePath(currentLocale, currentPath)}`;
  const canonicalUrl =
    props.url && props.url.startsWith("http")
      ? props.url
      : props.url
        ? `${origin}${localizePath(currentLocale, props.url)}`
        : defaultCanonical;

  const pageSeo =
    (props.pageKey && seo.pages?.[props.pageKey]) ||
    (props.pageKey && seo.pages?.[props.pageKey.toLowerCase()]) ||
    undefined;

  const title =
    props.title ||
    (pageSeo?.title?.[lang] || pageSeo?.title?.en) ||
    seo?.defaultTitle?.[lang] ||
    seo?.defaultTitle?.en ||
    "";
  const description =
    props.description ||
    (pageSeo?.description?.[lang] || pageSeo?.description?.en) ||
    seo?.defaultDescription?.[lang] ||
    seo?.defaultDescription?.en ||
    "";
  const image = resolveUrl(
    props.image || pageSeo?.image || seo?.defaultImage,
    seo?.baseUrl
  );
  const url = resolveUrl(props.url, seo?.baseUrl) || canonicalUrl;
  const type = props.type || "website";
  const siteName = seo?.siteName || "";
  const twitterHandle = seo?.twitterHandle || "";
  const alternates = useMemo(
    () => [
      ...SUPPORTED_LOCALES.map(locale => ({
        hrefLang: locale,
        href: `${defaultCanonical.replace(localizePath(lang, currentPath), localizePath(locale, currentPath))}`,
      })),
      {
        hrefLang: "x-default",
        href: `${defaultCanonical.replace(localizePath(lang, currentPath), localizePath("en", currentPath))}`,
      },
    ],
    [currentPath, defaultCanonical, lang]
  );

  const payload = useMemo(
    () => ({
      title,
      description,
      canonical: props.canonical ?? url,
      robots: props.robots,
      image,
      type,
      publishedTime: props.publishedTime,
      modifiedTime: props.modifiedTime,
      siteName,
      twitterHandle,
      alternates,
      structuredData: props.structuredData,
    }),
    [
      alternates,
      description,
      image,
      props.canonical,
      props.modifiedTime,
      props.publishedTime,
      props.robots,
      props.structuredData,
      siteName,
      title,
      twitterHandle,
      type,
      url,
    ]
  );

  if (typeof window === "undefined") {
    seoContext.setCurrent(payload);
  }

  useEffect(() => {
    if (payload.title) document.title = payload.title;
    setMeta("name", "description", payload.description);
    setMeta("name", "robots", payload.robots);
    setMeta("property", "og:title", payload.title);
    setMeta("property", "og:description", payload.description);
    setMeta("property", "og:type", payload.type);
    setMeta("property", "og:site_name", payload.siteName);
    setMeta("property", "og:url", payload.canonical);
    setMeta("property", "og:image", payload.image);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta(
      "name",
      "twitter:site",
      payload.twitterHandle ? `@${payload.twitterHandle}` : undefined
    );
    setMeta("name", "twitter:title", payload.title);
    setMeta("name", "twitter:description", payload.description);
    setMeta("name", "twitter:image", payload.image);
    setMeta("property", "article:published_time", payload.publishedTime);
    setMeta("property", "article:modified_time", payload.modifiedTime);
    syncCanonicalLink(payload.canonical);
    syncAlternateLinks(alternates);
    syncStructuredData(payload.structuredData);
  }, [
    alternates,
    payload,
  ]);

  return null;
}

function setMeta(
  attr: "name" | "property",
  key: string,
  value?: string | null
) {
  let tag = document.querySelector(`meta[${attr}='${key}']`) as
    | HTMLMetaElement
    | null;
  if (value == null || value === "") {
    tag?.parentNode?.removeChild(tag);
    return;
  }
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

function syncCanonicalLink(value?: string | null) {
  let link = document.querySelector("link[rel='canonical']") as
    | HTMLLinkElement
    | null;
  if (value == null || value === "") {
    link?.parentNode?.removeChild(link);
    return;
  }
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = value;
}

function syncAlternateLinks(alternates: Array<{ hrefLang: string; href: string }>) {
  const previous = document.querySelectorAll("link[data-seo-alternate='1']");
  previous.forEach(node => node.parentNode?.removeChild(node));
  alternates.forEach(alternate => {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.hreflang = alternate.hrefLang;
    link.href = alternate.href;
    link.dataset.seoAlternate = "1";
    document.head.appendChild(link);
  });
}

function syncStructuredData(items?: Array<Record<string, any>>) {
  const previous = document.querySelectorAll(
    "script[data-structured-data='1']"
  );
  previous.forEach(node => node.parentNode?.removeChild(node));
  items?.forEach(item => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.structuredData = "1";
    script.text = JSON.stringify(item);
    document.head.appendChild(script);
  });
}
