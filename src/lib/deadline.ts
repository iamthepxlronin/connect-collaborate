/** Whole days from today until the deadline (date string YYYY-MM-DD). Negative = passed. */
export function daysUntil(deadline: string | null, now = new Date()): number | null {
  if (!deadline) return null;
  const [y, m, d] = deadline.split("-").map(Number);
  const due = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due - today) / 86400000);
}

export function deadlineLabel(days: number | null): { text: string; urgent: boolean } | null {
  if (days === null || days > 7) return null;
  if (days < 0) return { text: "Deadline passed", urgent: true };
  if (days === 0) return { text: "Closes today", urgent: true };
  if (days === 1) return { text: "Closes tomorrow", urgent: true };
  return { text: `Closes in ${days} days`, urgent: days <= 3 };
}
