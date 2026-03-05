export function formatMeasuredTime(totalSeconds: number): string {
  if (totalSeconds == null) return "0m";

  const sec = Math.floor(totalSeconds);

  if (sec <= 0) return "0m";

  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);

  return parts.join("");
}
