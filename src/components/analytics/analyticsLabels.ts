/** "averageResponseTime" / "avg_turn_time" -> "Average Response Time". */
export function titleCase(text: string) {
  const spaced = /\s/.test(text)
    ? text
    : text.replace(/[_-]+/g, " ").replace(/([a-z\d])([A-Z])/g, "$1 $2");
  return spaced.replace(/(^|\s)(\S)/g, (_, space: string, letter: string) => {
    return `${space}${letter.toUpperCase()}`;
  });
}

const unitNames: Record<string, string> = {
  s: "s",
  sec: "s",
  secs: "s",
  second: "s",
  seconds: "s",
  ms: "ms",
  millisecond: "ms",
  milliseconds: "ms",
  min: "min",
  mins: "min",
  minute: "min",
  minutes: "min",
  percent: "%",
  pct: "%",
};

/** The unit the response states, in its short form; none is guessed. */
export function unitOf(
  record: Record<string, unknown>,
  text: string,
  key = "",
): string | null {
  const stated = [record.unit, record.units, record.value_unit].find(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
  if (stated) return unitNames[stated.trim().toLowerCase()] ?? stated;
  // A unit written into the field name, e.g. "avg_response_ms".
  const suffix = key.toLowerCase().match(/(?:^|[_\s-])([a-z]+)$/)?.[1];
  if (suffix && unitNames[suffix] && suffix !== "s" && suffix !== "min")
    return unitNames[suffix];
  if (/(^|[^a-z])milliseconds?([^a-z]|$)|\(ms\)/i.test(text)) return "ms";
  if (/(^|[^a-z])(seconds?|secs?)([^a-z]|$)|\(s\)/i.test(text)) return "s";
  return null;
}
