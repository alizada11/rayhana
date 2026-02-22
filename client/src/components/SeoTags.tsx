import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSeoDefaults, type SeoDefaults } from "@/hooks/useSeoDefaults";

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
  const lang = i18n.language || "en";
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
    document.title;
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
  const url = resolveUrl(props.url, seo?.baseUrl) || window?.location?.href;
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
