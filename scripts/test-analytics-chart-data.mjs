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
