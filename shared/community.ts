export type CommunityState = {
  memory: "qabili" | "rice" | "other" | "skip" | null;
  safety: boolean;
  recipe: "qabili" | "rice" | "suggestion" | null;
  vote: "yes" | "no" | "unsure" | null;
  pattern: "simple" | "carpet" | null;
  points: number;
  expiresAt: string;
};

export type CommunityStep =
  | { step: "memory"; choice: NonNullable<CommunityState["memory"]> }
  | { step: "safety"; answer: "intact" | "damaged" }
  | { step: "recipe"; choice: NonNullable<CommunityState["recipe"]> }
  | {
      step: "vote";
      choice: NonNullable<CommunityState["vote"]>;
      pattern?: NonNullable<CommunityState["pattern"]>;
    };

export type CommunityStartResponse = { token: string; state: CommunityState };
export type CommunityStateResponse = { state: CommunityState };
