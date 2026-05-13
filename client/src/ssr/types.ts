export type SupportedLocale = "en" | "fa" | "ps";

export type SsrPayload = {
  lang: SupportedLocale;
  url: string;
  baseUrl: string;
  dehydratedState: unknown;
};

export type RuntimeConfig = {
  lang: SupportedLocale;
  baseUrl: string;
  requestPath: string;
  isServer: boolean;
  isSsrRender: boolean;
};
