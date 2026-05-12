import type { SeoPayload } from "@/seo/seo-context";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const metaTag = (name: string, content?: string) =>
  content ? `<meta name="${name}" content="${escapeHtml(content)}" />` : "";

const propertyTag = (property: string, content?: string) =>
  content
    ? `<meta property="${property}" content="${escapeHtml(content)}" />`
    : "";

export function renderSeoHead(seo: SeoPayload | null) {
  if (!seo) return "";

  return [
    seo.title ? `<title>${escapeHtml(seo.title)}</title>` : "",
    metaTag("description", seo.description),
    metaTag("robots", seo.robots),
    seo.canonical
      ? `<link rel="canonical" href="${escapeHtml(seo.canonical)}" />`
      : "",
    propertyTag("og:title", seo.title),
    propertyTag("og:description", seo.description),
    propertyTag("og:type", seo.type),
    propertyTag("og:site_name", seo.siteName),
    propertyTag("og:url", seo.canonical),
    propertyTag("og:image", seo.image),
    metaTag("twitter:card", "summary_large_image"),
    metaTag("twitter:site", seo.twitterHandle ? `@${seo.twitterHandle}` : ""),
    metaTag("twitter:title", seo.title),
    metaTag("twitter:description", seo.description),
    metaTag("twitter:image", seo.image),
    propertyTag("article:published_time", seo.publishedTime),
    propertyTag("article:modified_time", seo.modifiedTime),
    ...(seo.alternates || []).map(
      alternate =>
        `<link rel="alternate" hreflang="${escapeHtml(alternate.hrefLang)}" href="${escapeHtml(alternate.href)}" />`
    ),
    ...(seo.structuredData || []).map(
      item =>
        `<script type="application/ld+json">${escapeHtml(JSON.stringify(item))}</script>`
    ),
  ]
    .filter(Boolean)
    .join("\n");
}

