import { useContent } from "@/hooks/useContent";

export type SeoDefaults = {
  defaultTitle?: Record<string, string>;
  defaultDescription?: Record<string, string>;
  defaultImage?: string;
  twitterHandle?: string;
  siteName?: string;
  baseUrl?: string;
  pages?:
    | Record<
        string,
        {
          title?: Record<string, string>;
          description?: Record<string, string>;
          image?: string;
        }
      >
    | Array<{
        key: string;
        title?: Record<string, string>;
        description?: Record<string, string>;
        image?: string;
      }>;
};

export const useSeoDefaults = () => {
  const { data, isLoading, isError } = useContent("seo");
  const rawSeo = (data?.data || {}) as SeoDefaults;

  const pages =
    Array.isArray(rawSeo.pages) && rawSeo.pages.length
      ? rawSeo.pages.reduce<Record<string, any>>((acc, item) => {
          if (!item?.key) return acc;
          acc[item.key] = { ...item, key: undefined };
          return acc;
        }, {})
      : (rawSeo.pages as Record<string, any>) || {};

  const seo = { ...rawSeo, pages };
  return { seo, isLoading, isError };
};
