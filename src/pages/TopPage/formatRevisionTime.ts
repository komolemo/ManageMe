export function formatRevisionTime(value: string, language: string) {
  const normalizedValue = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const updatedAt = new Date(normalizedValue);
  if (Number.isNaN(updatedAt.getTime())) return value;

  const now = new Date();
  const elapsedMilliseconds = Math.max(0, now.getTime() - updatedAt.getTime());
  const elapsedMinutes = Math.floor(elapsedMilliseconds / 60_000);
  const relativeTime = new Intl.RelativeTimeFormat(language, { numeric: "auto" });

  if (elapsedMinutes < 1) return relativeTime.format(0, "second");
  if (elapsedMinutes < 60) return relativeTime.format(-elapsedMinutes, "minute");

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const updatedStart = new Date(
    updatedAt.getFullYear(),
    updatedAt.getMonth(),
    updatedAt.getDate(),
  );
  const daysAgo = Math.floor(
    (todayStart.getTime() - updatedStart.getTime()) / 86_400_000,
  );
  if (daysAgo === 0) {
    return relativeTime.format(-Math.floor(elapsedMinutes / 60), "hour");
  }
  if (daysAgo === 1) return relativeTime.format(-1, "day");

  return updatedAt.toLocaleDateString(language, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
