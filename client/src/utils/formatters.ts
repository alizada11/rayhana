export const formatDate = (
  value?: string | number | Date | null,
  locale?: string
): string => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale || undefined);
};

export const displayUser = (
  user?: { name?: string | null; email?: string | null },
  opts?: { isRTL?: boolean; guestLabel?: string }
) => {
  const fallback =
    opts?.guestLabel ?? (opts?.isRTL ? "مهمان" : "Guest");
  return user?.name?.trim() || user?.email || fallback;
};
