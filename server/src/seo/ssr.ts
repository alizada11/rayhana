import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import * as queries from "../db/queries";

const SUPPORTED_LOCALES = ["en", "fa", "ps"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALE: Locale = "en";

const PUBLIC_STATIC_ROUTES = new Set([
  "/",
  "/blog",
  "/products",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/help",
  "/gallery",
  "/login",
  "/reset-password",
  "/verify-email",
]);

type RouteMatch =
  | { type: "home" }
  | { type: "blog-index" }
  | { type: "blog-post"; slug: string }
  | { type: "products" }
  | { type: "product"; id: string }
  | { type: "help-article"; slug: string }
  | { type: "static" }
  | { type: "not-found" };

export const stripLocaleFromPath = (pathname: string) => {
  const [, maybeLocale, ...rest] = pathname.split("/");
  const locale = SUPPORTED_LOCALES.includes(maybeLocale as Locale)
    ? (maybeLocale as Locale)
    : DEFAULT_LOCALE;
  const hadLocalePrefix = locale === maybeLocale;
  const cleanPath = hadLocalePrefix
    ? `/${rest.join("/")}`.replace(/\/{2,}/g, "/") || "/"
    : pathname;

  return {
    locale,
    pathname:
      cleanPath === "/" ? "/" : cleanPath.replace(/\/+$/, "") || "/",
    hadLocalePrefix,
  };
};

export const localizePath = (locale: Locale, pathname: string) => {
  const cleanPath = pathname === "/" ? "" : pathname.replace(/\/+$/, "");
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  return `${prefix}${cleanPath || "/"}`.replace(/\/{2,}/g, "/");
};

export const shouldHandleAsHtml = (pathname: string) => {
  if (pathname.startsWith("/api/")) return false;
  if (pathname.startsWith("/uploads/")) return false;
  if (pathname.startsWith("/assets/")) return false;
  if (pathname === "/robots.txt") return false;
  if (pathname.endsWith(".xml")) return false;
  return !/\.[a-z0-9]+$/i.test(pathname);
};

export const matchRoute = (pathname: string): RouteMatch => {
  if (pathname === "/") return { type: "home" };
  if (pathname === "/blog") return { type: "blog-index" };
  if (pathname.startsWith("/blog/")) {
    return { type: "blog-post", slug: decodeURIComponent(pathname.slice(6)) };
  }
  if (pathname === "/products") return { type: "products" };
  if (pathname.startsWith("/products/")) {
    return { type: "product", id: decodeURIComponent(pathname.slice(10)) };
  }
  if (pathname.startsWith("/help/")) {
    return { type: "help-article", slug: decodeURIComponent(pathname.slice(6)) };
  }
  if (PUBLIC_STATIC_ROUTES.has(pathname)) return { type: "static" };
  return { type: "not-found" };
};

export const canRenderSsr = (pathname: string) => {
  return matchRoute(pathname).type !== "not-found";
};

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 5 * 60 * 1000,
      },
    },
  });

export const preloadRouteData = async (pathname: string) => {
  const queryClient = createQueryClient();
  const contentKeys = new Set(["settings", "seo", "contact"]);
  const route = matchRoute(pathname);

  switch (route.type) {
    case "home":
      contentKeys.add("home");
      contentKeys.add("faq");
      break;
    case "static":
      if (pathname === "/about") contentKeys.add("about");
      if (pathname === "/privacy") contentKeys.add("privacy");
      if (pathname === "/terms") contentKeys.add("terms");
      if (pathname === "/help") contentKeys.add("help");
      break;
    case "help-article":
      contentKeys.add("help");
      break;
    default:
      break;
  }

  const contentEntries = await Promise.all(
    Array.from(contentKeys).map(async key => [
      key,
      await queries.getSiteContentByKey(key),
    ] as const)
  );

  for (const [key, value] of contentEntries) {
    queryClient.setQueryData(["content", key], value);
  }

  switch (route.type) {
    case "home":
      queryClient.setQueryData(["homepage"], await queries.getHomepageBundle());
      break;
    case "blog-index":
      queryClient.setQueryData(
        ["blogs", { page: 1, limit: 9 }],
        await queries.getBlogPostsPaginated({ page: 1, limit: 9 })
      );
      break;
    case "blog-post":
      queryClient.setQueryData(
        ["blog", route.slug],
        await queries.getBlogPostBySlug(route.slug)
      );
      break;
    case "products":
      queryClient.setQueryData(["products"], await queries.getAllProducts());
      break;
    case "product":
      queryClient.setQueryData(["product", route.id], await queries.getProductById(route.id));
      break;
    case "static":
      if (pathname === "/gallery") {
        queryClient.setQueryData(
          ["gallery", "approved"],
          await queries.getApprovedGallerySubmissions()
        );
      }
      break;
    default:
      break;
  }

  return {
    queryClient,
    dehydratedState: dehydrate(queryClient),
    route,
  };
};

const loadEntryServer = async () => {
  const entryPath = path.resolve(__dirname, "server", "entry-server.js");
  const moduleUrl = pathToFileURL(entryPath).href;
  return import(moduleUrl);
};

export const renderSsrPage = async ({
  distPath,
  locale,
  pathname,
  origin,
}: {
  distPath: string;
  locale: Locale;
  pathname: string;
  origin: string;
}) => {
  const template = fs.readFileSync(path.join(distPath, "index.html"), "utf8");
  const { queryClient, dehydratedState, route } = await preloadRouteData(pathname);
  const { renderApp } = await loadEntryServer();
  const { html, head } = await renderApp({
    queryClient,
    dehydratedState,
    locale,
    pathname,
    origin,
  });

  const payload = JSON.stringify({
    locale,
    pathname,
    origin,
    dehydratedState,
  }).replace(/</g, "\\u003c");

  const rendered = template
    .replace(
      /<html\s+lang="[^"]*"/,
      `<html lang="${locale}" dir="${locale === "fa" || locale === "ps" ? "rtl" : "ltr"}"`
    )
    .replace("<!--app-head-->", head)
    .replace("<!--app-html-->", html)
    .replace(
      "<!--app-data-->",
      `<script>window.__SSR_PAYLOAD__=${payload};</script>`
    );

  return {
    html: rendered,
    statusCode: route.type === "not-found" ? 404 : 200,
  };
};
