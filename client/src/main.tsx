import { hydrateRoot } from "react-dom/client";
import "./index.css";
import "./fonts.css";
import { QueryClient } from "@tanstack/react-query";
import { dehydrate } from "@tanstack/react-query";
import { createI18n } from "./lib/i18n";
import { AppShell } from "./ssr/app-shell";
import { normalizeLocale, stripLocaleFromPath } from "./lib/routing/locale";

declare global {
  interface Window {
    __SSR_PAYLOAD__?: {
      locale?: string;
      pathname?: string;
      origin?: string;
      dehydratedState?: unknown;
    };
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const bootstrap = async () => {
  const ssrPayload = window.__SSR_PAYLOAD__;
  const route = stripLocaleFromPath(window.location.pathname);
  const locale = normalizeLocale(ssrPayload?.locale || route.locale);
  const pathname = ssrPayload?.pathname || route.pathname;
  const origin = ssrPayload?.origin || window.location.origin;
  const i18n = await createI18n(locale);

  hydrateRoot(
    document.getElementById("root")!,
    <AppShell
      queryClient={queryClient}
      dehydratedState={(ssrPayload?.dehydratedState as any) || dehydrate(queryClient)}
      i18n={i18n}
      locale={locale}
      pathname={pathname}
      origin={origin}
      seo={{ current: null, setCurrent: () => undefined }}
    />
  );
};

void bootstrap();
