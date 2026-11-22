import type { CommunityState } from "@shared/community";

export type CommunityErrorCode = "offline" | "network" | "server";

export class CommunityApiError extends Error {
  constructor(public code: CommunityErrorCode) {
    super(code);
  }
}

function apiUrl(path: string) {
  const base = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
  return `${base}${path}`;
}

export const communityApi = {
  async submitAnonymous(
    state: CommunityState,
    responseId: string,
    signal: AbortSignal
  ): Promise<void> {
    if (!state.memory || !state.recipe || !state.vote || !state.safety) {
      throw new CommunityApiError("server");
    }

    let response: Response;
    try {
      response = await fetch(apiUrl("/community/responses"), {
        method: "POST",
        signal,
        credentials: "omit",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseId,
          memory: state.memory,
          safety: state.safety,
          recipe: state.recipe,
          vote: state.vote,
          pattern: state.pattern,
        }),
      });
    } catch (error) {
      if (signal.aborted) throw error;
      throw new CommunityApiError(
        typeof navigator !== "undefined" && !navigator.onLine
          ? "offline"
          : "network"
      );
    }

    if (!response.ok) throw new CommunityApiError("server");
  },
};
