import DOMPurify from "dompurify";

const purifier = DOMPurify as unknown as {
  sanitize?: (value: string, config?: Record<string, unknown>) => string;
};

export function sanitizeHtml(
  value: string,
  config?: Record<string, unknown>
) {
  if (typeof purifier.sanitize === "function") {
    return purifier.sanitize(value || "", config);
  }

  return (value || "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]*)/gi, "");
}

export function sanitizeText(value: string) {
  return sanitizeHtml(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}
