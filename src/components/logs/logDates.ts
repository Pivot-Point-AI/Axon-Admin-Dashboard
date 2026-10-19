import type { LogEvent } from "@/lib/api/types";
import type { LogEventEntry } from "@/lib/api/logs";

export function logTimestamp(data: LogEvent): Date | null {
  for (const value of [data.timestamp, data.created_at]) {
    if (typeof value !== "string" || !value.trim()) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
}

export function logDateBounds(entries: readonly LogEventEntry[]) {
  let start: number | null = null;
  let end: number | null = null;
  for (const { data } of entries) {
    const time = logTimestamp(data)?.getTime();
    if (time === undefined) continue;
    start = start === null ? time : Math.min(start, time);
    end = end === null ? time : Math.max(end, time);
  }
  return start === null || end === null
    ? null
    : { start: new Date(start), end: new Date(end) };
}
