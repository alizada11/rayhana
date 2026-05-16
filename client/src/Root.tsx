import { HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import type { DehydratedState } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { AuthProvider } from "./lib/auth";
import App from "./App";

type RootProps = {
  queryClient: QueryClient;
  dehydratedState?: DehydratedState | null;
  ssrPath?: string;
  ssrSearch?: string;
};

export default function Root({
  queryClient,
  dehydratedState,
  ssrPath,
  ssrSearch,
}: RootProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <AuthProvider>
          <App ssrPath={ssrPath} ssrSearch={ssrSearch} />
        </AuthProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
