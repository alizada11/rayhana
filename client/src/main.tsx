import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n";
import "@fontsource/vazirmatn";
import "@fontsource/poppins";
import "@fontsource/playfair-display";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./lib/auth";
// Import your Publishable Key
// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // fail fast to avoid long blank states on bad networks
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
);
