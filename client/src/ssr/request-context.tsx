import {
  createContext,
  useContext,
  type PropsWithChildren,
} from "react";
import {
  DEFAULT_LOCALE,
  RTL_LOCALES,
  localizePath,
  type Locale,
} from "@/lib/routing/locale";

type RequestContextValue = {
  locale: Locale;
  pathname: string;
  origin: string;
  isServer: boolean;
};

const RequestContext = createContext<RequestContextValue>({
  locale: DEFAULT_LOCALE,
  pathname: "/",
  origin: "",
  isServer: typeof window === "undefined",
});

export function RequestProvider({
  value,
  children,
}: PropsWithChildren<{ value: RequestContextValue }>) {
  return (
    <RequestContext.Provider value={value}>{children}</RequestContext.Provider>
  );
}

export const useRequestContext = () => useContext(RequestContext);

export const useCurrentLocale = () => useRequestContext().locale;

export const useCurrentPath = () => useRequestContext().pathname;

export const useCanonicalUrl = (pathname?: string) => {
  const { origin, pathname: currentPath, locale } = useRequestContext();
  return `${origin}${localizePath(locale, pathname || currentPath)}`;
};

export const useDocumentDirection = () => {
  const locale = useCurrentLocale();
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
};

