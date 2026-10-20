/** HTML date/time values are local wall-clock times, without a UTC offset. */
export function localDateTimeValue(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function nextMinuteValue(): string {
  return localDateTimeValue(new Date(Math.ceil(Date.now() / 60000) * 60000));
}

export function isFutureDateTime(value: string): boolean {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp > Date.now();
}
