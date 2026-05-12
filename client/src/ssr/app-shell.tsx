import { HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import type { DehydratedState, QueryClient } from "@tanstack/react-query";
import { Router } from "wouter";
import App from "@/App";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { getLocalePrefix, type Locale } from "@/lib/routing/locale";
import { SeoProvider, type SeoPayload } from "@/seo/seo-context";
import { RequestProvider } from "@/ssr/request-context";
import type { i18n as I18nInstance } from "i18next";

export function AppShell({
  queryClient,
  dehydratedState,
  i18n,
  locale,
  pathname,
  origin,
  seo,
}: {
  queryClient: QueryClient;
  dehydratedState?: DehydratedState;
  i18n: I18nInstance;
  locale: Locale;
  pathname: string;
  origin: string;
  seo: { current: SeoPayload | null; setCurrent: (payload: SeoPayload) => void };
}) {
  return (
    <SeoProvider value={seo}>
      <RequestProvider
        value={{
          locale,
          pathname,
          origin,
          isServer: typeof window === "undefined",
        }}
      >
        <I18nProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={dehydratedState}>
              <AuthProvider>
                <Router base={getLocalePrefix(locale) || undefined} ssrPath={pathname}>
                  <App />
                </Router>
              </AuthProvider>
            </HydrationBoundary>
          </QueryClientProvider>
        </I18nProvider>
      </RequestProvider>
    </SeoProvider>
  );
}
