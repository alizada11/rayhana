import { createContext, useContext } from "react";
import type { ResolvedMeta } from "./generateMeta";

export type SeoHeadContextValue = {
  setMeta: (meta: ResolvedMeta) => void;
  addSchema: (key: string, schema: Record<string, any>) => void;
};

export const SeoHeadContext = createContext<SeoHeadContextValue | null>(null);

export function useSeoHeadContext() {
  return useContext(SeoHeadContext);
}
