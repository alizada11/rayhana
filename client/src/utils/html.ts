import DOMPurify from "dompurify";

const STRIP_TAGS = /<[^>]*>/g;
const SCRIPT_TAGS = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_HANDLERS = /\son[a-z]+\s*=\s*(['"]).*?\1/gi;

export function decodeHtml(value: string) {
  if (!value) return "";
  if (typeof window === "undefined") return value;
  const doc = new window.DOMParser().parseFromString(value, "text/html");
  return doc.body?.innerHTML || "";
}

export function sanitizeRichHtml(value: string) {
  const decoded = decodeHtml(value);
  if (typeof window === "undefined") {
    return decoded.replace(SCRIPT_TAGS, "").replace(EVENT_HANDLERS, "");
  }

  return DOMPurify.sanitize(decoded, {
    ALLOWED_TAGS: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "br",
      "strong",
      "em",
      "u",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img",
      "span",
      "div",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "class",
      "src",
      "alt",
      "title",
      "style",
    ],
  });
}

export function stripHtml(value: string) {
  return decodeHtml(value).replace(STRIP_TAGS, " ").replace(/\s+/g, " ").trim();
}

export function addHeadingFontClasses(html: string) {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html.replace(
      /<h([1-6])(\s[^>]*)?>/gi,
      (_match: string, level: string, attrs = "") => {
        if (/class=/i.test(attrs)) {
          return `<h${level}${attrs.replace(
            /class=(['"])(.*?)\1/i,
            (
              _inner: string,
              quote: string,
              classes: string
            ) => `class=${quote}${classes} font-serif${quote}`
          )}>`;
        }
        return `<h${level}${attrs} class="font-serif">`;
      }
    );
  }

  const doc = new window.DOMParser().parseFromString(html, "text/html");
  doc.body?.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach(el => {
    el.classList.add("font-serif");
  });
  return doc.body?.innerHTML || "";
}
