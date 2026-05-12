const DATE_LOCALES = {
  en: "en-US",
  fa: "fa-IR",
  ps: "ps-AF",
} as const;

export function formatLocalizedDate(
  value: string | number | Date,
  language: keyof typeof DATE_LOCALES = "en"
) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(DATE_LOCALES[language]).format(date);
}

