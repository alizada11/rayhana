import { dehydrate } from "@tanstack/react-query";
import { renderToPipeableStream } from "react-dom/server";
import { PassThrough } from "node:stream";
import type React from "react";
import Root from "./Root";
import { createAppQueryClient } from "./queryClient";
import i18n from "./lib/i18n";
import {
  SUPPORTED_LOCALES,
  localeDirection,
  normalizeLocale,
  stripLocaleFromPath,
  withLocalePath,
} from "./lib/locales";

type RenderOptions = {
  apiOrigin: string;
  baseUrl: string;
  cookie?: string;
};

type HeadTags = {
  title: string;
  tags: string;
  lang: string;
  dir: string;
};

export async function render(url: string, options: RenderOptions) {
  const requestUrl = new URL(url, options.baseUrl || options.apiOrigin);
  const locale = getRequestLocale(requestUrl.pathname);
  await i18n.changeLanguage(locale);
  const queryClient = createAppQueryClient();

  await prefetchPublicRoute(queryClient, requestUrl, options);

  const dehydratedState = dehydrate(queryClient);
  const appHtml = await renderElementToString(
    <Root
      queryClient={queryClient}
      dehydratedState={dehydratedState}
      ssrPath={requestUrl.pathname}
      ssrSearch={requestUrl.search.replace(/^\?/, "")}
    />
  );

  return {
    appHtml,
    dehydratedState,
    head: buildHeadTags(queryClient, requestUrl, options.baseUrl),
  };
}

async function prefetchPublicRoute(
  queryClient: ReturnType<typeof createAppQueryClient>,
  requestUrl: URL,
  options: RenderOptions
) {
  const apiGet = (endpoint: string) =>
    fetch(`${options.apiOrigin}/api${endpoint}`, {
      headers: {
        accept: "application/json",
        ...(options.cookie ? { cookie: options.cookie } : {}),
      },
    }).then(async res => {
      if (!res.ok) throw new Error(`SSR fetch failed: ${endpoint}`);
      return res.json();
    });

  const prefetch = (queryKey: unknown[], endpoint: string) =>
    queryClient
      .prefetchQuery({
        queryKey,
        queryFn: () => apiGet(endpoint),
      })
      .catch(() => undefined);

  await Promise.all([
    prefetch(["content", "settings"], "/content/settings"),
    prefetch(["content", "seo"], "/content/seo"),
    prefetch(["content", "contact"], "/content/contact"),
  ]);

  const rawPath = requestUrl.pathname.replace(/\/+$/, "") || "/";
  const path = stripLocaleFromPath(rawPath).path;
  const blogPostMatch = path.match(/^\/blog\/([^/]+)$/);
  const helpArticleMatch = path.match(/^\/help\/([^/]+)$/);

  if (path === "/") {
    await prefetch(["homepage"], "/homepage");
    return;
  }

  if (path === "/products") {
    await prefetch(["products"], "/products");
    return;
  }

  if (path === "/gallery") {
    await prefetch(["gallery", "approved"], "/gallery");
    return;
  }

  if (path === "/blog") {
    await prefetch(["blogs", { page: 1, limit: 9 }], "/blogs?page=1&limit=9");
    return;
  }

  if (blogPostMatch?.[1]) {
    await prefetch(["blog", blogPostMatch[1]], `/blogs/${blogPostMatch[1]}`);
    return;
  }

  if (path === "/about") {
    await prefetch(["content", "about"], "/content/about");
    return;
  }

  if (path === "/privacy") {
    await prefetch(["content", "privacy"], "/content/privacy");
    return;
  }

  if (path === "/terms") {
    await prefetch(["content", "terms"], "/content/terms");
    return;
  }

  if (path === "/faq") {
    await prefetch(["content", "faq"], "/content/faq");
    return;
  }

  if (path === "/help" || helpArticleMatch) {
    await prefetch(["content", "help"], "/content/help");
  }
}

function renderElementToString(element: React.ReactElement) {
  return new Promise<string>((resolve, reject) => {
    let html = "";
    const stream = new PassThrough();
    stream.on("data", chunk => {
      html += chunk.toString();
    });
    stream.on("end", () => resolve(html));
    stream.on("error", reject);

    const { pipe, abort } = renderToPipeableStream(element, {
      onAllReady() {
        pipe(stream);
      },
      onShellError(error) {
        reject(error);
      },
      onError(error) {
        console.error("SSR render error", error);
      },
    });

    setTimeout(abort, 10000);
  });
}

function buildHeadTags(
  queryClient: ReturnType<typeof createAppQueryClient>,
  requestUrl: URL,
  baseUrl: string
): HeadTags {
  const rawPath = requestUrl.pathname.replace(/\/+$/, "") || "/";
  const { locale: pathLocale, path: unlocalizedPath } =
    stripLocaleFromPath(rawPath);
  const lang = normalizeLocale(pathLocale);
  const local = (value: any) => localized(value, lang);
  const seoContent = queryClient.getQueryData<any>(["content", "seo"])?.data;
  const homepage = queryClient.getQueryData<any>(["homepage"]);
  const pageKey = getPageKey(unlocalizedPath);
  const pageSeo = getPageSeo(seoContent, pageKey);
  const defaultTitle = local(seoContent?.defaultTitle);
  const defaultDescription = local(seoContent?.defaultDescription);
  const canonical = `${baseUrl.replace(/\/+$/, "")}${withLocalePath(
    unlocalizedPath,
    lang
  )}`;

  let title = defaultTitle || "Rayhana Kitchen Appliance";
  let description =
    defaultDescription ||
    "Cookware and stories inspired by authentic Afghan cooking.";
  let image = seoContent?.defaultImage || "/images/logo.png";
  let type = "website";
  let publishedTime = "";
  let modifiedTime = "";

  if (unlocalizedPath === "/" && homepage) {
    title =
      local(homepage.seo?.title) ||
      local(homepage.home?.hero?.title) ||
      title;
    description =
      local(homepage.seo?.description) ||
      local(homepage.home?.hero?.subtitle) ||
      description;
    image = homepage.seo?.image_url || homepage.home?.images?.featuredProduct || image;
  }

  if (unlocalizedPath === "/blog") {
    title = "Rayhana Blog";
    description = "Stories, recipes, and tips from the Rayhana kitchen.";
  }

  const blogPostMatch = unlocalizedPath.match(/^\/blog\/([^/]+)$/);
  if (blogPostMatch?.[1]) {
    const post = queryClient.getQueryData<any>(["blog", blogPostMatch[1]]);
    if (post) {
      const content = local(post.content);
      title = local(post.title) || title;
      description =
        local(post.excerpt) || stripHtml(content).slice(0, 160) || description;
      image = post.imageUrl || image;
      type = "article";
      publishedTime = post.publishedAt || post.createdAt || "";
      modifiedTime = post.updatedAt || "";
    }
  }

  if (unlocalizedPath === "/about") {
    const data = queryClient.getQueryData<any>(["content", "about"])?.data;
    title = stripHtml(local(data?.hero?.title) || title);
    description = stripHtml(local(data?.hero?.subtitle) || description);
    image = data?.images?.story || image;
  }

  if (unlocalizedPath === "/contact") {
    const data = queryClient.getQueryData<any>(["content", "contact"])?.data;
    title = local(data?.hero?.title) || "Contact Rayhana";
    description =
      local(data?.hero?.subtitle) ||
      "Get in touch for support, partnerships, or questions.";
  }

  if (unlocalizedPath === "/products") {
    title = "Shop Rayhana Products";
    description =
      "Cookware and tools crafted for authentic Afghan cooking.";
  }

  if (unlocalizedPath === "/gallery") {
    title = "Customer Gallery";
    description = "See dishes from our community and share your own.";
  }

  if (unlocalizedPath === "/privacy" || unlocalizedPath === "/terms") {
    const key = unlocalizedPath.slice(1);
    const data = queryClient.getQueryData<any>(["content", key])?.data;
    title = local(data?.title) || title;
    description = stripHtml(local(data?.intro) || description).slice(0, 180);
  }

  if (unlocalizedPath === "/faq") {
    const data = queryClient.getQueryData<any>(["content", "faq"])?.data;
    title = local(data?.title) || "Frequently Asked Questions";
    description =
      stripHtml(local(data?.subtitle) || description).slice(
        0,
        180
      );
  }

  if (unlocalizedPath === "/help" || unlocalizedPath.startsWith("/help/")) {
    const data = queryClient.getQueryData<any>(["content", "help"])?.data;
    const articles = Array.isArray(data?.articles) ? data.articles : [];
    const slug = unlocalizedPath.match(/^\/help\/([^/]+)$/)?.[1];
    const article = slug
      ? articles.find((item: any) => item.slug === slug)
      : null;
    title =
      local(article?.title) ||
      local(data?.center?.title) ||
      "Help Center";
    description =
      local(article?.description) ||
      local(article?.intro) ||
      local(data?.center?.subtitle) ||
      "Find quick answers or browse detailed help articles.";
    description = stripHtml(description);
  }

  title = local(pageSeo?.title) || title;
  description = local(pageSeo?.description) || description;
  image = pageSeo?.image || image;

  const absoluteImage = resolveUrl(image, baseUrl);
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  const escapedCanonical = escapeHtml(canonical);
  const escapedImage = escapeHtml(absoluteImage);
  const siteName = escapeHtml(seoContent?.siteName || "Rayhana");
  const twitterHandle = String(seoContent?.twitterHandle || "").replace(/^@/, "");

  const tags = [
    `<meta name="description" content="${escapedDescription}" />`,
    `<link rel="canonical" href="${escapedCanonical}" />`,
    `<meta property="og:title" content="${escapedTitle}" />`,
    `<meta property="og:description" content="${escapedDescription}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:url" content="${escapedCanonical}" />`,
    `<meta property="og:image" content="${escapedImage}" />`,
    `<meta property="og:site_name" content="${siteName}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapedTitle}" />`,
    `<meta name="twitter:description" content="${escapedDescription}" />`,
    `<meta name="twitter:image" content="${escapedImage}" />`,
    ...buildJsonLd({
      baseUrl,
      description,
      image: absoluteImage,
      lang,
      modifiedTime,
      publishedTime,
      siteName: seoContent?.siteName || "Rayhana",
      title,
      type,
      url: canonical,
    }).map(jsonLdScript),
    ...SUPPORTED_LOCALES.map(locale => {
      const href = escapeHtml(
        `${baseUrl.replace(/\/+$/, "")}${withLocalePath(unlocalizedPath, locale)}`
      );
      return `<link rel="alternate" hreflang="${locale}" href="${href}" />`;
    }),
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(
      `${baseUrl.replace(/\/+$/, "")}${withLocalePath(unlocalizedPath, "en")}`
    )}" />`,
    twitterHandle
      ? `<meta name="twitter:site" content="@${escapeHtml(twitterHandle)}" />`
      : "",
    publishedTime
      ? `<meta property="article:published_time" content="${escapeHtml(publishedTime)}" />`
      : "",
    modifiedTime
      ? `<meta property="article:modified_time" content="${escapeHtml(modifiedTime)}" />`
      : "",
  ]
    .filter(Boolean)
    .join("\n    ");

  return {
    title: escapedTitle,
    tags,
    lang,
    dir: localeDirection(lang),
  };
}

function getRequestLocale(pathname: string) {
  return normalizeLocale(stripLocaleFromPath(pathname).locale);
}

function buildJsonLd({
  baseUrl,
  description,
  image,
  lang,
  modifiedTime,
  publishedTime,
  siteName,
  title,
  type,
  url,
}: {
  baseUrl: string;
  description: string;
  image: string;
  lang: string;
  modifiedTime?: string;
  publishedTime?: string;
  siteName: string;
  title: string;
  type: string;
  url: string;
}) {
  const siteUrl = baseUrl.replace(/\/+$/, "");
  return [
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
}

function jsonLdScript(data: unknown) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

function getPageKey(path: string) {
  if (path === "/") return "home";
  if (path === "/blog") return "blog-index";
  if (path.startsWith("/blog/")) return "blog-post";
  if (path === "/help") return "help";
  if (path.startsWith("/help/")) return "help-article";
  return path.replace(/^\//, "") || "home";
}

function getPageSeo(seo: any, key: string) {
  const pages = Array.isArray(seo?.pages)
    ? seo.pages.reduce((acc: Record<string, any>, item: any) => {
        if (item?.key) acc[item.key] = item;
        return acc;
      }, {})
    : seo?.pages || {};
  return pages[key] || pages[key.toLowerCase()];
}

function localized(value: any, lang = "en") {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.en || value.fa || value.ps || "";
}

function stripHtml(value: string) {
  return (value || "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function resolveUrl(url: string, baseUrl: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${baseUrl.replace(/\/+$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
}

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
