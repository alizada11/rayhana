import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSeoDefaults, type SeoDefaults } from "@/hooks/useSeoDefaults";
import { generateMeta } from "@/seo/generateMeta";
import { useSeoHeadContext } from "@/seo/context";
import { useRuntime } from "@/ssr/runtime";

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
  schemas?: Array<{ key: string; value: Record<string, any> }>;
};

export default function SeoTags(props: SeoTagsProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";
  const runtime = useRuntime();
  const headContext = useSeoHeadContext();
  const { seo } = useSeoDefaults({
    initialData: props.seoData,
    enabled: !props.seoData,
  });

  const meta = generateMeta({
    pageKey: props.pageKey,
    lang,
    baseUrl: runtime.baseUrl || seo?.baseUrl || "",
    title: props.title,
    description: props.description,
    image: props.image,
    url: props.url || runtime.requestPath,
    type: props.type,
    publishedTime: props.publishedTime,
    modifiedTime: props.modifiedTime,
    seoData: seo,
  });

  if (runtime.isServer && headContext) {
    headContext.setMeta(meta);
    for (const schema of props.schemas || []) {
      headContext.addSchema(schema.key, schema.value);
    }
  }

  useEffect(() => {
    document.title = meta.title;
    setMeta("name", "description", meta.description);
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:type", meta.type);
    if (meta.siteName) setMeta("property", "og:site_name", meta.siteName);
    if (meta.canonicalUrl) setMeta("property", "og:url", meta.canonicalUrl);
    if (meta.image) setMeta("property", "og:image", meta.image);
    setMeta("name", "twitter:card", "summary_large_image");
    if (meta.twitterHandle)
      setMeta("name", "twitter:site", `@${meta.twitterHandle}`);
    setMeta("name", "twitter:title", meta.title);
    setMeta("name", "twitter:description", meta.description);
    if (meta.image) setMeta("name", "twitter:image", meta.image);
    if (meta.publishedTime)
      setMeta("property", "article:published_time", meta.publishedTime);
    if (meta.modifiedTime)
      setMeta("property", "article:modified_time", meta.modifiedTime);
    if (meta.canonicalUrl) {
      let link = document.querySelector("link[rel='canonical']") as
        | HTMLLinkElement
        | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = meta.canonicalUrl;
    }

    for (const schema of props.schemas || []) {
      let script = document.querySelector(
        `script[data-schema-key="${schema.key}"]`
      ) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.dataset.schemaKey = schema.key;
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema.value);
    }
  }, [
    meta,
    props.schemas,
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
