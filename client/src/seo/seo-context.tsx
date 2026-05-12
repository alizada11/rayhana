import {
  createContext,
  useContext,
  type PropsWithChildren,
} from "react";

export type AlternateLink = {
  hrefLang: string;
  href: string;
};

export type SeoPayload = {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: string;
  image?: string;
  type?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
  siteName?: string;
  twitterHandle?: string;
  alternates?: AlternateLink[];
  structuredData?: Array<Record<string, any>>;
};

type SeoContextValue = {
  current: SeoPayload | null;
  setCurrent: (payload: SeoPayload) => void;
};

const noop = () => undefined;

const SeoContext = createContext<SeoContextValue>({
  current: null,
  setCurrent: noop,
});

export function SeoProvider({
  value,
  children,
}: PropsWithChildren<{ value: SeoContextValue }>) {
  return <SeoContext.Provider value={value}>{children}</SeoContext.Provider>;
}

export const useSeoContext = () => useContext(SeoContext);

