import { createRoot, hydrateRoot } from "react-dom/client";
import type { DehydratedState } from "@tanstack/react-query";
import Root from "./Root";
import { createAppQueryClient } from "./queryClient";
import "./index.css";
import "./fonts.css";
import "./lib/i18n";

declare global {
  interface Window {
    __REACT_QUERY_STATE__?: unknown;
  }
}

const queryClient = createAppQueryClient();
const root = document.getElementById("root")!;
const app = (
  <Root
    queryClient={queryClient}
    dehydratedState={window.__REACT_QUERY_STATE__ as DehydratedState}
  />
);

if (root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
