import createDOMPurify from "dompurify";

type SanitizeConfig = any;

const browserPurify = () => {
  if (typeof window === "undefined") return null;
  const candidate = createDOMPurify as any;
  return typeof candidate.sanitize === "function"
    ? candidate
    : candidate(window);
};

export function sanitizeHtml(value: string, config?: SanitizeConfig) {
  const html = value || "";
  const purify = browserPurify();
  if (purify) return purify.sanitize(html, config);

  if (Array.isArray(config?.ALLOWED_TAGS) && config.ALLOWED_TAGS.length === 0) {
    return stripHtml(html);
  }

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)=("|')javascript:[^"']*\2/gi, "");
}

export function stripHtml(value: string) {
  return (value || "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

export function decodeHtml(value: string) {
  if (typeof DOMParser === "undefined") return value || "";
  const doc = new DOMParser().parseFromString(value || "", "text/html");
  return doc.body?.innerHTML || "";
}

export function addHeadingFont(html: string) {
  if (typeof DOMParser === "undefined") {
    return (html || "").replace(
      /<(h[1-6])(\s[^>]*)?>/gi,
      (_match, tag, attrs = "") => {
        if (/class\s*=/.test(attrs)) {
          return `<${tag}${attrs.replace(/class=(["'])(.*?)\1/i, (_classMatch: string, quote: string, classes: string) => `class=${quote}${classes} font-serif${quote}`)}>`;
        }
        return `<${tag}${attrs} class="font-serif">`;
      }
    );
  }

  const doc = new DOMParser().parseFromString(html || "", "text/html");
  doc.body?.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach(el => {
    el.classList.add("font-serif");
  });
  return doc.body?.innerHTML || "";
}

export function allowBlogTables(html: string) {
  if (typeof DOMParser === "undefined") return html || "";

  const doc = new DOMParser().parseFromString(html || "", "text/html");
  doc.body?.querySelectorAll("table").forEach(table => {
    table.classList.add("w-full", "border-collapse", "my-6");
  });
  doc.body?.querySelectorAll("th").forEach(cell => {
    cell.classList.add("border", "px-3", "py-2", "text-left", "font-semibold");
  });
  doc.body?.querySelectorAll("td").forEach(cell => {
    cell.classList.add("border", "px-3", "py-2");
  });
  return doc.body?.innerHTML || "";
}
