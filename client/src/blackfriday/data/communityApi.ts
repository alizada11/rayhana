import type {
  CommunityState,
  CommunityStateResponse,
  CommunityStartResponse,
  CommunityStep,
} from "@shared/community";
import api from "@/lib/axios";

export type CommunityErrorCode = "offline" | "network" | "server" | "storage" | "invalid" | "incorrect";

export class CommunityApiError extends Error {
  constructor(public code: CommunityErrorCode) {
    super(code);
  }
}

const STORAGE_KEY = "rayhana-table-progress-v1";
const RESPONSE_ID_KEY = "rayhana-table-anonymous-response-id-v1";
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
type SavedSession = { token: string; state: CommunityState };

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException("Request aborted", "AbortError");
}

function readSession(): SavedSession | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    const session = JSON.parse(value) as SavedSession;
    if (
      typeof session?.token !== "string" ||
      typeof session?.state?.expiresAt !== "string" ||
      !Number.isFinite(Date.parse(session.state.expiresAt))
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (Date.parse(session.state.expiresAt) <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    throw new CommunityApiError("storage");
  }
}

function saveSession(session: SavedSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    throw new CommunityApiError("storage");
  }
}

function newToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function responseId() {
  const createId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map(value => value.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
  };
  try {
    const saved = localStorage.getItem(RESPONSE_ID_KEY);
    if (saved) return saved;
    const id = createId();
    localStorage.setItem(RESPONSE_ID_KEY, id);
    return id;
  } catch {
    return createId();
  }
}

function applyStep(state: CommunityState, input: CommunityStep): CommunityState {
  switch (input.step) {
    case "memory":
      return { ...state, memory: input.choice };
    case "safety":
      if (input.answer !== "intact") throw new CommunityApiError("incorrect");
      return { ...state, safety: true };
    case "recipe":
      return { ...state, recipe: input.choice };
    case "vote":
      return {
        ...state,
        vote: input.choice,
        ...(input.pattern === undefined ? {} : { pattern: input.pattern }),
      };
  }
}

function withPoints(state: CommunityState): CommunityState {
  const points = [state.memory !== null, state.safety, state.recipe !== null, state.vote !== null]
    .filter(Boolean).length * 25;
  return { ...state, points };
}

function emptyState(): CommunityState {
  return {
    memory: null,
    safety: false,
    recipe: null,
    vote: null,
    pattern: null,
    points: 0,
    expiresAt: new Date(Date.now() + RETENTION_MS).toISOString(),
  };
}

export const communityApi = {
  async start(signal: AbortSignal): Promise<CommunityStartResponse> {
    throwIfAborted(signal);
    const session = { token: newToken(), state: emptyState() };
    saveSession(session);
    return session;
  },

  async restore(token: string, signal: AbortSignal): Promise<CommunityStateResponse> {
    throwIfAborted(signal);
    const session = readSession();
    if (!session || session.token !== token) throw new CommunityApiError("invalid");
    return { state: session.state };
  },

  async step(token: string, input: CommunityStep, signal: AbortSignal): Promise<CommunityStateResponse> {
    throwIfAborted(signal);
    const session = readSession();
    if (!session || session.token !== token) throw new CommunityApiError("invalid");
    const state = withPoints(applyStep(session.state, input));
    const updated = { ...session, state };
    saveSession(updated);
    return { state };
  },

  async delete(token: string, signal: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    const session = readSession();
    if (!session || session.token !== token) throw new CommunityApiError("invalid");
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(RESPONSE_ID_KEY);
    } catch {
      throw new CommunityApiError("storage");
    }
  },

  async submitAnonymous(state: CommunityState, signal: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    if (!state.memory || !state.recipe || !state.vote || !state.safety) {
      throw new CommunityApiError("invalid");
    }
    try {
      await api.post(
        "/community/responses",
        {
          responseId: responseId(),
          memory: state.memory,
          safety: state.safety,
          recipe: state.recipe,
          vote: state.vote,
          pattern: state.pattern,
        },
        { signal }
      );
      try {
        localStorage.removeItem(RESPONSE_ID_KEY);
      } catch {
        // A completed response remains safe to retry with the same id.
      }
    } catch {
      throw new CommunityApiError("network");
    }
  },
};
