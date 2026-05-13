import { createContext, useContext } from "react";
import type { RuntimeConfig } from "./types";

const RuntimeContext = createContext<RuntimeConfig>({
  lang: "en",
  baseUrl: "",
  requestPath: "/",
  isServer: false,
  isSsrRender: false,
});

export function RuntimeProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: RuntimeConfig;
}) {
  return (
    <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>
  );
}

export function useRuntime() {
  return useContext(RuntimeContext);
}
