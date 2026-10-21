import { analyticsNumber, asAnalyticsRecord } from "./analyticsData";

const duration = (value: unknown): number | null => {
  const number = analyticsNumber(value);
  return number !== null && number >= 0 ? number : null;
};

export function latencyData(value: unknown) {
  const data = asAnalyticsRecord(value);
  const average = duration(data.avg) ?? duration(data.average);
  const minimum = duration(data.min);
  const maximum = duration(data.max);
  const percentiles = [50, 90, 95, 99].flatMap((percentile) => {
    const value =
      duration(data[`p${percentile}`]) ??
      (percentile === 50 ? duration(data.median) : null);
    return value === null ? [] : [{ percentile, value }];
  });
  const values = [
    average,
    minimum,
    maximum,
    ...percentiles.map((row) => row.value),
  ].filter((value): value is number => value !== null);
  const count = duration(data.count) ?? duration(data.sample_count);
  return {
    average,
    minimum,
    maximum,
    percentiles,
    count: count !== null && Number.isInteger(count) ? count : null,
    scale: Math.max(0, ...values),
    hasData: values.length > 0,
    allZero: values.length > 0 && values.every((value) => value === 0),
  };
}
