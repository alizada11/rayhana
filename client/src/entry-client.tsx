import { hydrateRoot } from "react-dom/client";
import {
  HydrationBoundary,
  QueryClientProvider,
  type DehydratedState,
} from "@tanstack/react-query";
import { Router } from "wouter";
import App from "./App";
import "./index.css";
import "./fonts.css";
import { AuthProvider } from "./lib/auth";
import { initI18n } from "./lib/i18n";
import { createQueryClient } from "./ssr/queryClient";
import { getSsrPayload } from "./ssr/state";
import { RuntimeProvider } from "./ssr/runtime";

const queryClient = createQueryClient();
const payload = getSsrPayload();

async function start() {
  await initI18n(payload?.lang || "en");

  hydrateRoot(
    document.getElementById("root")!,
    <Router>
      <RuntimeProvider
        value={{
          lang: payload?.lang || "en",
          baseUrl: payload?.baseUrl || window.location.origin,
          requestPath: payload?.url || window.location.pathname,
          isServer: false,
          isSsrRender: Boolean(payload),
        }}
      >
        <QueryClientProvider client={queryClient}>
          <HydrationBoundary state={payload?.dehydratedState as DehydratedState | undefined}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </HydrationBoundary>
        </QueryClientProvider>
      </RuntimeProvider>
    </Router>
  );
}

void start();
