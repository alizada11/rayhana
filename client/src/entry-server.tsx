import { dehydrate } from "@tanstack/react-query";
import { renderToPipeableStream } from "react-dom/server";
import { PassThrough } from "node:stream";
import type React from "react";
import Root from "./Root";
import { createAppQueryClient } from "./queryClient";
import "./lib/i18n";

type RenderOptions = {
  apiOrigin: string;
  baseUrl: string;
  cookie?: string;
};

type HeadTags = {
  title: string;
  tags: string;
};

export async function render(url: string, options: RenderOptions) {
  const requestUrl = new URL(url, options.baseUrl || options.apiOrigin);
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

  const path = requestUrl.pathname.replace(/\/+$/, "") || "/";
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
  const path = requestUrl.pathname.replace(/\/+$/, "") || "/";
  const seoContent = queryClient.getQueryData<any>(["content", "seo"])?.data;
  const homepage = queryClient.getQueryData<any>(["homepage"]);
  const pageKey = getPageKey(path);
  const pageSeo = getPageSeo(seoContent, pageKey);
  const defaultTitle = localized(seoContent?.defaultTitle);
  const defaultDescription = localized(seoContent?.defaultDescription);
  const canonical = `${baseUrl.replace(/\/+$/, "")}${requestUrl.pathname}`;

  let title =
    localized(pageSeo?.title) ||
    defaultTitle ||
    "Rayhana Kitchen Appliance";
  let description =
    localized(pageSeo?.description) ||
    defaultDescription ||
    "Cookware and stories inspired by authentic Afghan cooking.";
  let image = pageSeo?.image || seoContent?.defaultImage || "/images/logo.png";
  let type = "website";
  let publishedTime = "";
  let modifiedTime = "";

  if (path === "/" && homepage) {
    title =
      localized(homepage.seo?.title) ||
      localized(homepage.home?.hero?.title) ||
      title;
    description =
      localized(homepage.seo?.description) ||
      localized(homepage.home?.hero?.subtitle) ||
      description;
    image = homepage.seo?.image_url || homepage.home?.images?.featuredProduct || image;
  }

  if (path === "/blog") {
    title = localized(pageSeo?.title) || "Rayhana Blog";
    description =
      localized(pageSeo?.description) ||
      "Stories, recipes, and tips from the Rayhana kitchen.";
  }

  const blogPostMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogPostMatch?.[1]) {
    const post = queryClient.getQueryData<any>(["blog", blogPostMatch[1]]);
    if (post) {
      const content = localized(post.content);
      title = localized(post.title) || title;
      description =
        localized(post.excerpt) || stripHtml(content).slice(0, 160) || description;
      image = post.imageUrl || image;
      type = "article";
      publishedTime = post.publishedAt || post.createdAt || "";
      modifiedTime = post.updatedAt || "";
    }
  }

  if (path === "/about") {
    const data = queryClient.getQueryData<any>(["content", "about"])?.data;
    title = stripHtml(localized(data?.hero?.title) || title);
    description = stripHtml(localized(data?.hero?.subtitle) || description);
    image = data?.images?.story || image;
  }

  if (path === "/contact") {
    const data = queryClient.getQueryData<any>(["content", "contact"])?.data;
    title = localized(data?.hero?.title) || "Contact Rayhana";
    description =
      localized(data?.hero?.subtitle) ||
      "Get in touch for support, partnerships, or questions.";
  }

  if (path === "/products") {
    title = localized(pageSeo?.title) || "Shop Rayhana Products";
    description =
      localized(pageSeo?.description) ||
      "Cookware and tools crafted for authentic Afghan cooking.";
  }

  if (path === "/gallery") {
    title = localized(pageSeo?.title) || "Customer Gallery";
    description =
      localized(pageSeo?.description) ||
      "See dishes from our community and share your own.";
  }

  if (path === "/privacy" || path === "/terms") {
    const key = path.slice(1);
    const data = queryClient.getQueryData<any>(["content", key])?.data;
    title = localized(data?.title) || title;
    description = stripHtml(localized(data?.intro) || description).slice(0, 180);
  }

  if (path === "/help" || path.startsWith("/help/")) {
    const data = queryClient.getQueryData<any>(["content", "help"])?.data;
    const articles = Array.isArray(data?.articles) ? data.articles : [];
    const slug = path.match(/^\/help\/([^/]+)$/)?.[1];
    const article = slug
      ? articles.find((item: any) => item.slug === slug)
      : null;
    title =
      localized(article?.title) ||
      localized(data?.center?.title) ||
      "Help Center";
    description =
      localized(article?.description) ||
      localized(article?.intro) ||
      localized(data?.center?.subtitle) ||
      "Find quick answers or browse detailed help articles.";
    description = stripHtml(description);
  }

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
  };
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
