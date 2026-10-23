import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

const directory = fileURLToPath(
  new URL("../src/components/analytics/", import.meta.url),
);
const cache = new Map();
function load(name) {
  const filename = path.resolve(directory, `${name}.ts`);
  if (cache.has(filename)) return cache.get(filename);
  const loadedModule = { exports: {} };
  cache.set(filename, loadedModule.exports);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  new Function("require", "module", "exports", outputText)(
    (dependency) => load(dependency),
    loadedModule,
    loadedModule.exports,
  );
  return loadedModule.exports;
}
const journeys = load("analyticsJourneyInsights");
const chartData = load("analyticsChartData");
const trends = load("analyticsTrends");
const quality = load("analyticsQualityData");
const summaries = load("analyticsSummaryData");
const telemetry = load("analyticsTelemetryData");

test("current journey blocks merge category counts with outcome rates", () => {
  const rows = journeys.journeyCategories({
    flow_breakdown_by_type: {
      bank_fund_transfer: { completion_rate_pct: 10, abandonment_rate_pct: 60 },
    },
    most_popular_journeys: [{ flow_type: "bank_fund_transfer", count: 40 }],
    journey_outcomes_detail: [
      {
        flow_type: "show_list",
        initialized_count: 20,
        completed_count: 2,
        abandoned_count: 12,
      },
    ],
  });
  assert.equal(rows.length, 2);
  assert.equal(rows[0].count, 40);
  assert.equal(rows[0].completionRate, 10);
  assert.equal(rows[1].count, 20);
  assert.equal(rows[1].abandonmentRate, 60);
});

test("journey counts can be nested and merged before computing outcome rates", () => {
  const rows = journeys.journeyCategories({
    journey_outcomes_detail: [
      {
        flow_type: "bank_fund_transfer",
        outcomes: { completed: 2, abandoned: 3 },
      },
    ],
    most_popular_journeys: [
      { flow_type: "bank_fund_transfer", total: { count: 10 } },
    ],
  });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].count, 10);
  assert.equal(rows[0].completionRate, 20);
  assert.equal(rows[0].abandonmentRate, 30);
});

test("dated KPI history supplies journey observations while undated sparklines cannot", () => {
  const data = {
    top_kpis: {
      total_initialized_flows: {
        sparkline: { labels: ["2026-10-20", "2026-10-21"], values: [8, 0] },
      },
      total_completed_flows: { sparkline: [2, 3] },
    },
  };
  const points = journeys.journeyTrendPoints(data);
  assert.equal(points.length, 2);
  assert.equal(points[0].started, 8);
  assert.equal(points[1].started, 0);
  assert.equal(points[0].completed, null);
  assert.deepEqual(
    journeys.journeyTrendPoints({
      top_kpis: { total_initialized_flows: { sparkline: [8, 0] } },
    }),
    [],
  );
});

test("summary aliases support the current OpenAPI fields while preserving legacy zeroes", () => {
  const input = {
    end_to_end_latency_ms: {},
    response_time_percentiles: { avg: 0, p95: 15 },
    average_time_by_stage: { llm_generation: 0 },
    slowest_interactions: [{ request_id: "a" }],
  };
  const result = summaries.analyticsSummaryData("performance", input);
  assert.equal(result.end_to_end_latency_ms.avg, 0);
  assert.equal(result.stage_averages_ms.llm_generation, 0);
  assert.equal(result.top_slowest_turns[0].request_id, "a");
  assert.deepEqual(input.end_to_end_latency_ms, {});
  const logs = summaries.analyticsSummaryData("logs", {
    conversation_channels: { voice: 10, text: 5 },
    recognized_errors: [],
    token_usage_breakdown: { total: 5290 },
  });
  assert.equal(logs.sources.voice, 10);
  assert.deepEqual(logs.errors, []);
  assert.equal(logs.token_usage.total, 5290);
});

test("telemetry retains total token counts and zero categories", () => {
  const rows = telemetry.telemetryDistribution({
    total: 5290,
    prompt: 3200,
    completion: 0,
    extractions: 70,
  });
  assert.equal(rows.find((row) => row.key === "total").count, 5290);
  assert.equal(rows.find((row) => row.key === "completion").count, 0);
  assert.equal(
    telemetry.telemetryDistribution([{ action: "add_biller", count: 2 }])[0]
      .key,
    "add_biller",
  );
});

test("performance charts never infer histograms or total-processing percentiles from summary timings", () => {
  const input = {
    end_to_end_latency_ms: { avg: 2973.84, p95: 5142.48 },
    stt_transcription_latency_ms: { avg: 0 },
    llm_generation_latency_ms: { p95: 28.17 },
  };
  const rows = telemetry.performanceStages(input);
  assert.equal(rows.length, 3);
  assert.equal(rows[1].average, 0);
  assert.equal(rows[1].p95, null);
  assert.equal(rows[2].average, null);
  assert.deepEqual(telemetry.responseHistogram(input), []);
  assert.deepEqual(telemetry.telemetryHistory(input, ["average", "p95"]), []);
});

test("journey rates use reported outcomes, including cancelled and failed journeys", () => {
  const [row] = journeys.journeyCategories({
    flow_breakdown_by_type: {
      bank_fund_transfer: {
        total: 10,
        completed: 2,
        abandoned: 3,
        cancelled: 4,
        failed: 1,
      },
    },
  });
  assert.equal(row.completionRate, 20);
  assert.equal(row.abandonmentRate, 30);
  assert.equal(journeys.journeyLabelKey(row.key), "bankFundTransfer");
});
test("missing outcomes stay missing and zero denominators produce no rates", () => {
  const rows = journeys.journeyCategories({
    flow_breakdown_by_type: {
      a: { total: 10, completed: 2 },
      b: { total: 0, completed: 0, abandoned: 0 },
    },
  });
  assert.equal(rows[0].abandonmentRate, null);
  assert.equal(rows[1].completionRate, null);
  assert.equal(rows[1].abandonmentRate, null);
  assert.deepEqual(
    journeys.journeyDistribution({ total_initialized_flows: 283 }).rows,
    [],
  );
});
test("journey distribution aggregates remaining categories without losing reported totals", () => {
  const result = journeys.journeyDistribution({
    total_initialized_flows: 100,
    flow_breakdown_by_type: { a: 30, b: 20, c: 10, d: 8, e: 7, f: 6, g: 5 },
  });
  assert.equal(result.total, 100);
  assert.equal(result.rows.length, 6);
  assert.deepEqual(result.rows[5], { key: "others", count: 25 });
  assert.equal(
    result.rows.reduce((sum, row) => sum + row.count, 0),
    100,
  );
});
test("aggregate journey totals never generate synthetic history or steps", () => {
  const totals = { total_initialized_flows: 283, total_completed_flows: 20 };
  assert.deepEqual(journeys.journeyTrendPoints(totals), []);
  assert.deepEqual(journeys.journeySteps(totals), []);
  const points = journeys.journeyTrendPoints({
    journey_trends: [
      { date: "invalid", started: 10 },
      { date: "2026-10-21", started: 0, completed: -1 },
      { date: "2026-10-20", started: 8, completed: 2 },
    ],
  });
  assert.equal(points.length, 2);
  assert.equal(points[0].started, 8);
  assert.equal(points[1].started, 0);
  assert.equal(points[1].completed, null);
});
test("reported journey steps retain their counts without ratios or minimums", () => {
  assert.deepEqual(
    journeys.journeySteps({
      journey_steps: [
        { key: "started", count: 8 },
        { key: "step_1", count: 0 },
        { key: "step_2", count: -3 },
      ],
    }),
    [
      { key: "started", label: null, count: 8 },
      { key: "step_1", label: null, count: 0 },
    ],
  );
});
test("confidence and safety levels use the reference order with semantic colors", () => {
  assert.deepEqual(
    quality
      .qualityRows("intent_confidence_buckets", { low: 20, high: 8, medium: 2 })
      .map((row) => row.key),
    ["high", "medium", "low"],
  );
  assert.deepEqual(
    quality
      .qualityRows("guardrail_violations_by_risk", {
        low: 10,
        high: 1,
        critical: 2,
        medium: 4,
      })
      .map((row) => row.key),
    ["critical", "high", "medium", "low"],
  );
  assert.equal(
    quality.qualityColor("guardrail_violations_by_risk", "high", 0),
    "error-500",
  );
  assert.equal(
    quality.qualityColor("fallback_reasons", "other", 0),
    "gray-400",
  );
});
test("quality shares use actual counts and retain unclassified reported totals", () => {
  const result = quality.qualityDistribution("intent_distribution", {
    total: 20,
    distribution: { qr_code: 7, chat: 2, add_biller: 2 },
  });
  assert.equal(result.total, 20);
  assert.equal(result.rows.find((row) => row.key === "qr_code").percentage, 35);
  assert.equal(result.rows.find((row) => row.key === "others").count, 9);
  assert.equal(
    quality.qualityDistribution("fallback_reasons", { other: 0 }).rows[0]
      .percentage,
    0,
  );
});
test("safety trends require real dated observations and preserve zero versus missing", () => {
  assert.deepEqual(
    quality.safetyTrendPoints({ guardrail_violations_count: 30 }),
    [],
  );
  const points = quality.safetyTrendPoints({
    guardrail_violations_trend: [
      { date: "2026-10-21", high: 0, medium: -1 },
      { date: "bad", high: 4 },
      { date: "2026-10-20", by_risk: { high: 8, low: 1 } },
    ],
  });
  assert.equal(points.length, 2);
  assert.equal(points[0].high, 8);
  assert.equal(points[1].high, 0);
  assert.equal(points[1].medium, null);
});

const periods = load("analyticsPeriods");

test("analytics presets use inclusive calendar dates and distinguish yesterday", () => {
  const now = new Date(2026, 9, 22, 15, 30);
  const expected = {
    today: ["2026-10-22", "2026-10-22"],
    yesterday: ["2026-10-21", "2026-10-21"],
    last7Days: ["2026-10-16", "2026-10-22"],
    last14Days: ["2026-10-09", "2026-10-22"],
    last30Days: ["2026-09-23", "2026-10-22"],
  };
  for (const [preset, [start, end]] of Object.entries(expected)) {
    const filters = periods.periodFilters(preset, now);
    assert.equal(filters.start_date, start);
    assert.equal(filters.end_date, end);
    assert.equal(periods.selectedPeriod(filters, now), preset);
    assert.equal(new Date(filters.start_time).getHours(), 0);
    assert.equal(new Date(filters.end_time).getHours(), 23);
  }
  assert.deepEqual(periods.periodFilters("allTime", now), {
    period: "all_time",
  });
  assert.equal(periods.selectedPeriod({}, now), "allTime");
});

test("date filtering rejects stale and future observations rather than anchoring to the last sample", () => {
  const now = new Date(2026, 9, 22, 15);
  const observations = [
    "2025-10-22",
    "2026-10-15",
    "2026-10-16",
    "2026-10-21",
    "2026-10-22",
    "2026-10-23",
  ].map((date) => ({ date, timestamp: periods.analyticsTimestamp(date) }));
  assert.deepEqual(
    periods.filterPeriodPoints(observations, "today", now).map((p) => p.date),
    ["2026-10-22"],
  );
  assert.deepEqual(
    periods
      .filterPeriodPoints(observations, "yesterday", now)
      .map((p) => p.date),
    ["2026-10-21"],
  );
  assert.deepEqual(
    periods
      .filterPeriodPoints(observations, "last7Days", now)
      .map((p) => p.date),
    ["2026-10-16", "2026-10-21", "2026-10-22"],
  );
  assert.equal(
    periods.filterPeriodPoints(observations, "allTime", now).length,
    6,
  );
  assert.equal(periods.filterPeriodPoints([], "today", now).length, 0);
});

test("custom dates include both endpoints and remain separate from presets", () => {
  const filters = periods.customPeriodFilters("2026-10-02", "2026-10-05");
  assert.equal(
    periods.selectedPeriod(filters, new Date(2026, 9, 22)),
    undefined,
  );
  const points = [
    { timestamp: new Date(2026, 9, 1, 23, 59, 59).getTime() },
    { timestamp: new Date(2026, 9, 2).getTime() },
    { timestamp: new Date(2026, 9, 5, 23, 59, 59, 999).getTime() },
    { timestamp: new Date(2026, 9, 6).getTime() },
  ];
  assert.deepEqual(
    periods.filterCustomPoints(points, "2026-10-02", "2026-10-05"),
    points.slice(1, 3),
  );
});

test("range arithmetic handles month and year boundaries", () => {
  const range = periods.periodFilters("last14Days", new Date(2027, 0, 5));
  assert.equal(range.start_date, "2026-12-23");
  assert.equal(range.end_date, "2027-01-05");
});

test("all summary requests forward supported date filters to the API", async () => {
  const filename = path.resolve(directory, "../../lib/api/analytics.ts");
  const calls = [];
  const loadedModule = { exports: {} };
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  new Function("require", "module", "exports", outputText)(
    () => ({
      ADMIN_API_BASE_URL: "/backend/admin",
      apiRequest: (endpoint, options) => {
        calls.push({ endpoint, ...options });
        return Promise.resolve({});
      },
    }),
    loadedModule,
    loadedModule.exports,
  );
  const filters = periods.periodFilters("last14Days", new Date(2026, 9, 22));
  for (const section of ["users", "flows", "chats"]) {
    await loadedModule.exports.getAnalyticsSummary(
      section,
      "test-token",
      filters,
    );
    const query = calls.at(-1).query;
    assert.equal(query.start_date, "2026-10-09");
    assert.equal(query.end_date, "2026-10-22");
    if (section === "chats") assert.equal(query.start_time, filters.start_time);
  }
  for (const section of ["nlp", "performance", "logs"]) {
    await loadedModule.exports.getAnalyticsSummary(section, "test-token", {
      date: "yesterday",
    });
    assert.deepEqual(calls.at(-1).query, { date: "yesterday" });
  }
  await loadedModule.exports.getAnalyticsSummary(
    "users",
    "test-token",
    periods.periodFilters("allTime"),
  );
  assert.equal(calls.at(-1).query.period, "all_time");
  assert.equal(calls.at(-1).query.start_date, undefined);
});

const daily = load("analyticsDailyHistory");

test("daily history requires an explicit calendar range and resolves individual telemetry dates", () => {
  const now = new Date(2026, 9, 22, 15);
  assert.deepEqual(daily.historyDates({ period: "all_time" }, now), []);
  assert.deepEqual(daily.historyDates({ date: "today" }, now), ["2026-10-22"]);
  assert.deepEqual(daily.historyDates({ date: "yesterday" }, now), [
    "2026-10-21",
  ]);
  assert.deepEqual(
    daily.historyDates(
      { start_date: "2026-10-20", end_date: "2026-10-22" },
      now,
    ),
    ["2026-10-20", "2026-10-21", "2026-10-22"],
  );
  assert.deepEqual(
    daily.historyDates(
      { start_date: "2026-10-22", end_date: "2026-10-20" },
      now,
    ),
    [],
  );
});

test("daily summaries supply real journey counts, safety levels and response-time percentiles", () => {
  assert.deepEqual(
    daily.dailyTrendPoint("flows", "2026-10-22", {
      total_initialized_flows: 12,
      total_completed_flows: 0,
      total_abandoned_flows: 3,
    }),
    {
      timestamp: periods.analyticsTimestamp("2026-10-22"),
      started: 12,
      completed: 0,
      abandoned: 3,
    },
  );
  const safety = daily.dailyTrendPoint("nlp", "2026-10-22", {
    date: "2026-10-22",
    safety_blocks_by_risk: { high: 0, medium: 4 },
  });
  assert.equal(safety.high, 0);
  assert.equal(safety.medium, 4);
  assert.equal(safety.low, null);
  const latency = daily.dailyTrendPoint("performance", "2026-10-22", {
    date: "2026-10-22",
    response_time_percentiles: { avg: 320, p95: 850 },
  });
  assert.equal(latency.average, 320);
  assert.equal(latency.p95, 850);
  assert.equal(
    daily.dailyTrendPoint("performance", "2026-10-22", {
      date: "2026-10-21",
      end_to_end_latency_ms: { avg: 123 },
    }),
    null,
  );
  assert.equal(
    daily.dailyTrendPoint("nlp", "2026-10-22", {
      found: false,
      guardrail_violations_by_risk: { high: 0 },
    }),
    null,
  );
});

test("history loads separate dates with bounded concurrency and keeps missing days as gaps", async () => {
  const dates = daily.historyDates({
    start_date: "2026-10-01",
    end_date: "2026-10-14",
  });
  let inFlight = 0,
    peak = 0;
  const requested = [];
  const history = await daily.loadDailyHistory(
    "flows",
    dates,
    async (date) => {
      requested.push(date);
      peak = Math.max(peak, ++inFlight);
      await new Promise((resolve) => setImmediate(resolve));
      inFlight--;
      return date === "2026-10-05"
        ? { found: false }
        : {
            total_initialized_flows: Number(date.slice(-2)),
            total_completed_flows: 0,
          };
    },
    new AbortController().signal,
  );
  assert.equal(requested.length, 14);
  assert.equal(new Set(requested).size, 14);
  assert.ok(peak <= 4);
  assert.equal(history.length, 14);
  assert.equal(history[0].started, 1);
  assert.equal(history[4].started, null);
  assert.equal(history[13].started, 14);
});

test("missing daily telemetry stays empty and request failures or cancellation never become fake zeroes", async () => {
  const dates = ["2026-10-21", "2026-10-22"];
  assert.deepEqual(
    await daily.loadDailyHistory(
      "performance",
      dates,
      async () => ({ found: false }),
      new AbortController().signal,
    ),
    [],
  );
  await assert.rejects(
    daily.loadDailyHistory(
      "nlp",
      dates,
      async () => {
        throw new Error("Failed to load daily telemetry");
      },
      new AbortController().signal,
    ),
    /Failed to load/,
  );
  const controller = new AbortController();
  controller.abort();
  let calls = 0;
  await assert.rejects(
    daily.loadDailyHistory(
      "flows",
      dates,
      async () => {
        calls++;
        return {};
      },
      controller.signal,
    ),
    { name: "AbortError" },
  );
  assert.equal(calls, 0);
});

test("daily safety and error charts use reported totals, including genuine zero activity", () => {
  const zero = daily.dailyTrendPoint("nlp", "2026-10-22", {
    date: "2026-10-22",
    guardrail_violations_count: 0,
    guardrail_violations_by_risk: {},
  });
  assert.equal(zero.total, 0);
  assert.equal(zero.high, 0);
  const unknownRisk = daily.dailyTrendPoint("nlp", "2026-10-22", {
    guardrail_violations_count: 3,
  });
  assert.equal(unknownRisk.total, 3);
  assert.equal(unknownRisk.high, null);
  const riskAlias = daily.dailyTrendPoint("nlp", "2026-10-22", {
    guardrail_violations_by_risk: { HIGH_RISK: 4 },
  });
  assert.equal(riskAlias.high, 4);
  const errors = daily.dailyTrendPoint("logs", "2026-10-22", {
    errors: [
      { error_type: "api_error" },
      { type: "timeout" },
      { category: "validation" },
      { type: "other_error" },
    ],
  });
  assert.equal(errors.total, 4);
  assert.equal(errors.api, 1);
  assert.equal(errors.validation, 1);
  assert.equal(errors.timeout, 1);
  assert.equal(errors.others, 1);
  const noErrors = daily.dailyTrendPoint("logs", "2026-10-22", { errors: [] });
  assert.equal(noErrors.total, 0);
  assert.equal(daily.dailyTrendPoint("logs", "2026-10-22", {}), null);
});

test("current chat and audience block names feed the existing charts", () => {
  const chats = summaries.analyticsSummaryData("chats", {
    activity_by_hour: {
      hours: [
        { hour: 13, count: 4 },
        { hour: 9, count: 2 },
      ],
    },
    activity_by_weekday: [
      { day_index: 1, day_name: "Monday", count: 5 },
      { day_index: 0, day_name: "Sunday", count: 1 },
    ],
  });
  assert.deepEqual(
    chartData
      .chartRows("peak_activity_hours", chats.peak_activity_hours)
      .map((row) => [row.key, row.count]),
    [
      ["9", 2],
      ["13", 4],
    ],
  );
  assert.deepEqual(
    chartData
      .chartRows("activity_by_day_of_week", chats.activity_by_day_of_week)
      .map((row) => row.key),
    ["Sunday", "Monday"],
  );
  const users = summaries.analyticsSummaryData("users", {
    language_preferences: {
      total: 16,
      items: [
        { language: "ur", users: 10, share_pct: 62.5 },
        { language: "en", users: 6, share_pct: 37.5 },
      ],
    },
  });
  assert.deepEqual(
    chartData
      .chartRows("language_breakdown", users.language_breakdown)
      .map((row) => [row.key, row.count, row.percentage]),
    [
      ["ur", 10, 62.5],
      ["en", 6, 37.5],
    ],
  );
  // The older field names still win when both are present.
  assert.deepEqual(
    summaries.analyticsSummaryData("chats", {
      peak_activity_hours: { 12: 3 },
      activity_by_hour: { hours: [{ hour: 1, count: 9 }] },
    }).peak_activity_hours,
    { 12: 3 },
  );
});

test("headline figures reported only inside KPI blocks fill the flat fields", () => {
  const users = summaries.analyticsSummaryData("users", {
    top_kpis: {
      total_unique_users: { value: 45, trend: { change_pct: 40.6 } },
      total_sessions: { value: 3594 },
    },
    audience_and_retention: [
      { label: "Returning Users", value: 35 },
      { label: "One-time Users", value: 10 },
    ],
  });
  assert.equal(users.total_users, 45);
  assert.equal(users.total_sessions, 3594);
  assert.equal(users.returning_users, 35);
  assert.equal(users.one_time_users, 10);
  // A reported top-level figure is never overwritten.
  assert.equal(
    summaries.analyticsSummaryData("users", {
      total_users: 7,
      top_kpis: { total_users: { value: 45 } },
    }).total_users,
    7,
  );
});

test("breakdown rows are named by whichever text field they carry", () => {
  const rows = chartData.chartRows("intent_confidence_buckets", [
    { confidence_level: "High confidence", count: 837 },
    { confidence_level: "Medium confidence", count: 0 },
    { confidence_level: "Low confidence", count: 166 },
  ]);
  assert.deepEqual(rows.map((row) => row.key).sort(), [
    "High confidence",
    "Low confidence",
    "Medium confidence",
  ]);
});

test("a comparison phrase is found under whatever field carries it", () => {
  const trend = trends.readMetricTrend({
    value: 11,
    growth_pct: -8.3,
    note: "vs last week",
  });
  assert.equal(trend.comparison, "vs last week");
});

test("a figure-led phrase becomes the display text, not a doubled comparison", () => {
  const trend = trends.readMetricTrend({
    value: 1,
    growth_pct: -80,
    note: "-80.0% vs yesterday",
  });
  assert.equal(trend.display, "-80.0% vs yesterday");
  assert.equal(trend.comparison, null);
});
