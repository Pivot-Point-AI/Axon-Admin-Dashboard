export interface DistributionRow {
  key: string;
  count: number;
  percentage: number | null;
}

export function asAnalyticsRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function analyticsNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Breakdown endpoints return either counts, {count, percentage} rows, or
 * a wrapper such as {total, languages}. Keep totals separate from categories. */
export function distributionRows(value: unknown): DistributionRow[] {
  const root = asAnalyticsRecord(value);
  const wrapper = [
    "languages",
    "intents",
    "distribution",
    "breakdown",
    "buckets",
    "flows",
  ].find((key) => root[key] !== null && typeof root[key] === "object");
  const source = wrapper ? root[wrapper] : value;
  const total = analyticsNumber(root.total);
  const entries = Array.isArray(source)
    ? source.map((row, index): [string, unknown] => {
        const item = asAnalyticsRecord(row);
        return [
          String(
            item.day_name ??
              item.hour ??
              item.flow_type ??
              item.intent_name ??
              item.name ??
              item.type ??
              index + 1,
          ),
          row,
        ];
      })
    : Object.entries(asAnalyticsRecord(source)).filter(
        ([key]) => !["total", "total_count"].includes(key),
      );
  const rows = entries.flatMap(([key, entry]) => {
    const item = asAnalyticsRecord(entry);
    const count =
      analyticsNumber(entry) ??
      analyticsNumber(item.count) ??
      analyticsNumber(item.total) ??
      analyticsNumber(item.frequency);
    if (count === null || count < 0) return [];
    const percentage =
      analyticsNumber(item.percentage) ?? analyticsNumber(item.percentage_pct);
    return [{ key, count, percentage }];
  });
  const denominator =
    total !== null && total > 0
      ? total
      : rows.reduce((sum, row) => sum + row.count, 0);
  return rows.map((row) => ({
    ...row,
    percentage:
      row.percentage ??
      (denominator > 0 ? (row.count / denominator) * 100 : null),
  }));
}

export function languageRows(value: unknown): {
  rows: DistributionRow[];
  total: number;
} {
  const rows = distributionRows(value).sort((a, b) => b.count - a.count);
  const sum = rows.reduce((count, row) => count + row.count, 0);
  const total = Math.max(
    sum,
    analyticsNumber(asAnalyticsRecord(value).total) ?? 0,
  );
  if (total > sum)
    rows.push({
      key: "unknown",
      count: total - sum,
      percentage: ((total - sum) / total) * 100,
    });
  return { rows, total };
}

export function languageName(code: string, locale: string): string {
  try {
    return (
      new Intl.DisplayNames([locale], { type: "language" }).of(code) ?? code
    );
  } catch {
    return code;
  }
}

/** Flatten structured records into table columns; no recursive layout is
 * needed even when telemetry includes nested timing or error details. */
export function analyticsTableRows(value: unknown): Record<string, unknown>[] {
  const flatten = (input: unknown, prefix = ""): Record<string, unknown> => {
    const row: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(asAnalyticsRecord(input))) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (child !== null && typeof child === "object" && !Array.isArray(child))
        Object.assign(row, flatten(child, path));
      else
        row[path] = Array.isArray(child)
          ? child
              .map((entry) =>
                typeof entry === "object"
                  ? JSON.stringify(entry)
                  : String(entry),
              )
              .join(", ")
          : child;
    }
    return row;
  };
  if (Array.isArray(value))
    return value.map((row) =>
      typeof row === "object" && row !== null ? flatten(row) : { value: row },
    );
  return Object.entries(asAnalyticsRecord(value)).map(([name, child]) => ({
    name,
    ...(child !== null && typeof child === "object"
      ? flatten(child)
      : { value: child }),
  }));
}
