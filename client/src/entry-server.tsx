import { dehydrate, HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import App from "./App";
import { AuthProvider } from "./lib/auth";
import { initI18n } from "./lib/i18n";
import { createQueryClient } from "./ssr/queryClient";
import { RuntimeProvider } from "./ssr/runtime";
import { prefetchRouteData } from "./ssr/prefetch";
import type { SupportedLocale } from "./ssr/types";
import { SeoHeadContext } from "./seo/context";
import type { ResolvedMeta } from "./seo/generateMeta";

type RenderArgs = {
  url: string;
  origin: string;
  lang?: SupportedLocale;
};

export async function render({ url, origin, lang = "en" }: RenderArgs) {
  const queryClient = createQueryClient();
  const path = new URL(url, origin).pathname;
  const result = await prefetchRouteData({ queryClient, path });
  const resolvedLang = lang || result.locale || ("en" as SupportedLocale);
  await initI18n(resolvedLang);

  let meta: ResolvedMeta | undefined;
  const schemas = new Map<string, Record<string, any>>();
  const ssrContext: Record<string, any> = {};

  const appHtml = renderToString(
    <Router ssrPath={url} ssrSearch={new URL(url, origin).search} ssrContext={ssrContext}>
      <RuntimeProvider
        value={{
          lang: resolvedLang,
          baseUrl: origin,
          requestPath: path,
          isServer: true,
          isSsrRender: true,
        }}
      >
        <SeoHeadContext.Provider
          value={{
            setMeta(nextMeta) {
              meta = nextMeta;
            },
            addSchema(key, schema) {
              schemas.set(key, schema);
            },
          }}
        >
          <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={dehydrate(queryClient)}>
              <AuthProvider>
                <App />
              </AuthProvider>
            </HydrationBoundary>
          </QueryClientProvider>
        </SeoHeadContext.Provider>
      </RuntimeProvider>
    </Router>
  );

  const schemaMarkup = Array.from(schemas.entries())
    .map(
      ([key, schema]) =>
        `<script type="application/ld+json" data-schema-key="${key}">${JSON.stringify(schema)}</script>`
    )
    .join("");

  let head = schemaMarkup;
  if (meta) {
    head = [
      `<title>${escapeHtml(meta.title)}</title>`,
      `<meta name="description" content="${escapeHtml(meta.description)}">`,
      `<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}">`,
      `<meta property="og:title" content="${escapeHtml(meta.title)}">`,
      `<meta property="og:description" content="${escapeHtml(meta.description)}">`,
      `<meta property="og:type" content="${escapeHtml(meta.type)}">`,
      `<meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}">`,
      meta.siteName
        ? `<meta property="og:site_name" content="${escapeHtml(meta.siteName)}">`
        : "",
      meta.image
        ? `<meta property="og:image" content="${escapeHtml(meta.image)}">`
        : "",
      `<meta name="twitter:card" content="summary_large_image">`,
      meta.twitterHandle
        ? `<meta name="twitter:site" content="@${escapeHtml(meta.twitterHandle)}">`
        : "",
      `<meta name="twitter:title" content="${escapeHtml(meta.title)}">`,
      `<meta name="twitter:description" content="${escapeHtml(meta.description)}">`,
      meta.image
        ? `<meta name="twitter:image" content="${escapeHtml(meta.image)}">`
        : "",
      meta.publishedTime
        ? `<meta property="article:published_time" content="${escapeHtml(meta.publishedTime)}">`
        : "",
      meta.modifiedTime
        ? `<meta property="article:modified_time" content="${escapeHtml(meta.modifiedTime)}">`
        : "",
      schemaMarkup,
    ]
      .filter(Boolean)
      .join("");
  }

  return {
    appHtml,
    head,
    status: result.status,
    lang: resolvedLang,
    dehydratedState: dehydrate(queryClient),
    redirectTo: ssrContext.redirectTo,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
