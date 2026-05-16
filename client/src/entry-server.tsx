import { renderToString } from "react-dom/server";
import type { DehydratedState, QueryClient } from "@tanstack/react-query";
import { AppShell } from "@/ssr/app-shell";
import { createI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/routing/locale";
import { renderSeoHead } from "@/seo/render-head";
import type { SeoPayload } from "@/seo/seo-context";

export async function renderApp({
  queryClient,
  dehydratedState,
  locale,
  pathname,
  origin,
}: {
  queryClient: QueryClient;
  dehydratedState: DehydratedState;
  locale: Locale;
  pathname: string;
  origin: string;
}) {
  const i18n = await createI18n(locale);
  let currentSeo: SeoPayload | null = null;

  const html = renderToString(
    <AppShell
      queryClient={queryClient}
      dehydratedState={dehydratedState}
      i18n={i18n}
      locale={locale}
      pathname={pathname}
      origin={origin}
      seo={{
        current: currentSeo,
        setCurrent: payload => {
          currentSeo = payload;
        },
      }}
    />
  );

  return {
    html,
    head: renderSeoHead(currentSeo),
  };
}
