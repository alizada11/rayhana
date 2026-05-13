import { QueryClient } from "@tanstack/react-query";
import * as queries from "../../../server/src/db/queries";
import type { SupportedLocale } from "./types";

type PrefetchOptions = {
  queryClient: QueryClient;
  path: string;
};

function asContentRecord(key: string, entry: any) {
  return {
    key,
    data: entry?.data ?? {},
    updatedAt: entry?.updatedAt ?? null,
  };
}

async function seedGlobalContent(queryClient: QueryClient) {
  const [seo, settings, contact] = await Promise.all([
    queries.getSiteContentByKey("seo"),
    queries.getSiteContentByKey("settings"),
    queries.getSiteContentByKey("contact"),
  ]);

  queryClient.setQueryData(["content", "seo"], asContentRecord("seo", seo));
  queryClient.setQueryData(
    ["content", "settings"],
    asContentRecord("settings", settings)
  );
  queryClient.setQueryData(
    ["content", "contact"],
    asContentRecord("contact", contact)
  );
}

export async function prefetchRouteData({ queryClient, path }: PrefetchOptions) {
  await seedGlobalContent(queryClient);

  if (path === "/") {
    const homepage = await queries.getHomepageBundle();
    queryClient.setQueryData(["homepage"], homepage);
    return { status: 200, locale: "en" as SupportedLocale };
  }

  if (path === "/products") {
    queryClient.setQueryData(["products"], await queries.getAllProducts());
    return { status: 200, locale: "en" as SupportedLocale };
  }

  if (path === "/about") {
    queryClient.setQueryData(
      ["content", "about"],
      asContentRecord("about", await queries.getSiteContentByKey("about"))
    );
    return { status: 200, locale: "en" as SupportedLocale };
  }

  if (path === "/blog") {
    queryClient.setQueryData(
      ["blogs", { page: 1, limit: 9 }],
      await queries.getBlogPostsPaginated({ page: 1, limit: 9 })
    );
    return { status: 200, locale: "en" as SupportedLocale };
  }

  if (path.startsWith("/blog/")) {
    const slug = decodeURIComponent(path.replace(/^\/blog\//, "")).replace(/\/+$/, "");
    const post = await queries.getBlogPostBySlug(slug);
    if (!post || post.status !== "published") {
      queryClient.setQueryData(["blog", slug], null);
      return { status: 404, locale: "en" as SupportedLocale };
    }
    queryClient.setQueryData(["blog", slug], post);
    queryClient.setQueryData(
      ["blogComments", post.id],
      await queries.getBlogCommentsByBlogId(post.id)
    );
    return { status: 200, locale: "en" as SupportedLocale };
  }

  if (path === "/help" || path.startsWith("/help/")) {
    const help = await queries.getSiteContentByKey("help");
    queryClient.setQueryData(["content", "help"], asContentRecord("help", help));
    if (path.startsWith("/help/")) {
      const slug = decodeURIComponent(path.replace(/^\/help\//, "")).replace(/\/+$/, "");
      const articles = Array.isArray(help?.data?.articles) ? help.data.articles : [];
      const article = articles.find((item: any) => item.slug === slug);
      return { status: article ? 200 : 404, locale: "en" as SupportedLocale };
    }
    return { status: 200, locale: "en" as SupportedLocale };
  }

  if (path === "/terms") {
    queryClient.setQueryData(
      ["content", "terms"],
      asContentRecord("terms", await queries.getSiteContentByKey("terms"))
    );
    return { status: 200, locale: "en" as SupportedLocale };
  }

  return { status: 200, locale: "en" as SupportedLocale };
}
