import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import React from "react";

const loadDependency = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messages = JSON.parse(
  fs.readFileSync(new URL("../src/messages/en.json", import.meta.url), "utf8"),
);

// Exercise component handlers and rerenders without a browser or live API.
function harness(overrides = {}) {
  const state = [];
  let cursor = 0;
  let changed = false;
  const cache = new Map();
  const effects = [];
  const react = {
    ...React,
    useState(initial) {
      const slot = cursor++;
      if (!(slot in state))
        state[slot] = typeof initial === "function" ? initial() : initial;
      return [
        state[slot],
        (next) => {
          const value = typeof next === "function" ? next(state[slot]) : next;
          changed ||= !Object.is(value, state[slot]);
          state[slot] = value;
        },
      ];
    },
    useEffect(effect) {
      effects.push(effect);
    },
    useLayoutEffect() {},
    useContext: (context) => context._currentValue,
    useCallback: (fn) => fn,
    useMemo: (factory) => factory(),
    useRef: (value) => ({ current: value }),
    useId: () => "test-id",
  };
  function load(relative) {
    const filename = path.resolve(__dirname, "..", relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2017,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const loadedModule = { exports: {} };
    cache.set(filename, loadedModule);
    function localRequire(name) {
      if (name in overrides) return overrides[name];
      if (name === "react") return react;
      if (name === "next-intl")
        return {
          useFormatter: () => ({
            number: (value, options) =>
              new Intl.NumberFormat("en-US", options).format(value),
            dateTime: (value, options) =>
              new Intl.DateTimeFormat("en-US", options).format(value),
          }),
          useTranslations:
            (namespace) =>
            (key, values = {}) => {
              const text =
                key.split(".").reduce(
                  (value, part) => value?.[part],
                  namespace
                    .split(".")
                    .reduce((value, part) => value?.[part], messages),
                ) ?? key;
              return text.replace(/\{(\w+)\}/g, (_, part) => values[part]);
            },
        };
      if (name.startsWith("@/icons"))
        return new Proxy(
          { __esModule: true },
          { get: (_, key) => (key === "__esModule" ? true : "svg") },
        );
      if (name === "@/i18n/navigation") return { Link: "a" };
      if (name === "@/context/AdminAuthContext")
        return { useAdminAuth: () => ({ accessToken: "test-token" }) };
      if (name === "@/context/FeedbackContext")
        return { useConfirm: () => async () => true };
      if (name === "@/lib/feedback")
        return {
          notify: () =>
            assert.fail("Local validation must not notify globally"),
        };
      if (name === "@/components/analytics/AnalyticsPeriodContext")
        return load("src/components/analytics/AnalyticsPeriodContext.tsx");
      if (
        name.startsWith("@/components/") &&
        !fs.existsSync(path.resolve(__dirname, "../src", `${name.slice(2)}.ts`))
      )
        return new Proxy(
          { __esModule: true, default: name },
          { get: (value, key) => value[key] ?? String(key) },
        );
      if (name.startsWith("@/") || name.startsWith(".")) {
        const stem = name.startsWith("@/")
          ? path.resolve(__dirname, "../src", name.slice(2))
          : path.resolve(path.dirname(filename), name);
        if (stem.endsWith(".json") && fs.existsSync(stem))
          return JSON.parse(fs.readFileSync(stem, "utf8"));
        const target = [".ts", ".tsx", "/index.ts", "/index.tsx"]
          .map((extension) => stem + extension)
          .find(fs.existsSync);
        if (target)
          return load(path.relative(path.resolve(__dirname, ".."), target));
      }
      return loadDependency(name);
    }
    new Function(
      "require",
      "module",
      "exports",
      "__filename",
      "__dirname",
      output,
    )(
      localRequire,
      loadedModule,
      loadedModule.exports,
      filename,
      path.dirname(filename),
    );
    return loadedModule.exports;
  }
  return {
    load,
    async runEffects() {
      for (const effect of effects.splice(0)) await effect();
      await new Promise((resolve) => setImmediate(resolve));
    },
    render(component, props) {
      let result;
      let count = 0;
      do {
        cursor = 0;
        changed = false;
        result = component(props);
        assert.ok(++count < 20, "Render must settle");
      } while (changed);
      return result;
    },
  };
}

function elements(tree) {
  if (Array.isArray(tree)) return tree.flatMap(elements);
  if (!React.isValidElement(tree)) return [];
  return [tree, ...elements(tree.props.children)];
}
const byId = (tree, id) =>
  elements(tree).find((element) => element.props.id === id);
const button = (tree, label) =>
  elements(tree).find(
    (element) =>
      element.type === "@/components/ui/button/Button" &&
      element.props.children === label,
  );

test("date-time picker blocks past values and accepts a future value", () => {
  const runtime = harness();
  const Field = runtime.load("src/components/form/DateTimeField.tsx").default;
  const { localDateTimeValue } = runtime.load("src/utils/dateTime.ts");
  const saved = [];
  const render = () =>
    runtime.render(Field, {
      id: "expiry",
      value: "",
      onChange: (value) => saved.push(value),
    });
  let tree = render();
  byId(tree, "expiry").props.onClick();
  tree = render();
  const past = localDateTimeValue(new Date(Date.now() - 86400000));
  byId(tree, "expiry-date").props.onChange(past.split("T")[0]);
  byId(tree, "expiry-time").props.onChange({
    target: { value: past.split("T")[1] },
  });
  tree = render();
  button(tree, messages.fixes.saveDate).props.onClick();
  tree = render();
  assert.equal(saved.length, 0);
  assert.equal(
    elements(tree).find((element) => element.props.role === "alert").props
      .children,
    messages.fixes.futureDateRequired,
  );
  const future = localDateTimeValue(new Date(Date.now() + 86400000));
  byId(tree, "expiry-date").props.onChange(future.split("T")[0]);
  byId(tree, "expiry-time").props.onChange({
    target: { value: future.split("T")[1] },
  });
  tree = render();
  button(tree, messages.fixes.saveDate).props.onClick();
  assert.deepEqual(saved, [future]);
});

test("institution submission rechecks expiry after the picker closes", async () => {
  const calls = [];
  const runtime = harness({
    "@/lib/api/institutions": {
      getAllInstitutions: async () => [],
      createInstitution: async (body) => {
        calls.push(body);
        return { institution_id: "1", license_key: "key" };
      },
    },
  });
  const Manager = runtime.load(
    "src/components/institutions/InstitutionsManager.tsx",
  ).default;
  const { localDateTimeValue } = runtime.load("src/utils/dateTime.ts");
  const render = () => runtime.render(Manager);
  let tree = render();
  button(tree, "New Institution").props.onClick();
  tree = render();
  byId(tree, "create-name").props.onChange({ target: { value: "Test Bank" } });
  byId(tree, "create-expiry").props.onChange(
    localDateTimeValue(new Date(Date.now() - 60000)),
  );
  tree = render();
  await button(tree, "Create Institution").props.onClick();
  assert.equal(calls.length, 0);
  byId(render(), "create-expiry").props.onChange(
    localDateTimeValue(new Date(Date.now() + 86400000)),
  );
  await button(render(), "Create Institution").props.onClick();
  assert.equal(calls.length, 1);
});

test("institution status-only edits and license renewal preserve inactive selection", async () => {
  const calls = [];
  const item = {
    institution_id: "bank-1",
    institution_name: "Test Bank",
    license_expires_at: new Date(Date.now() + 86400000).toISOString(),
    is_active: true,
  };
  const runtime = harness({
    "@/lib/api/institutions": {
      getAllInstitutions: async () => [item],
      updateInstitution: async (...args) => {
        calls.push(["update", ...args]);
      },
      renewInstitutionLicense: async (...args) => {
        calls.push(["renew", ...args]);
      },
    },
  });
  const Manager = runtime.load(
    "src/components/institutions/InstitutionsManager.tsx",
  ).default;
  const render = () => runtime.render(Manager);
  render();
  await runtime.runEffects();
  let tree = render();
  elements(tree)
    .find((element) => element.props.title === messages.fixes.editInstitution)
    .props.onClick();
  tree = render();
  byId(tree, "institution-active").props.onChange(false);
  tree = render();
  assert.equal(button(tree, "Save Changes").props.disabled, false);
  await button(tree, "Save Changes").props.onClick();
  assert.deepEqual(calls[0], [
    "update",
    "bank-1",
    { institution_name: "Test Bank", is_active: false },
    "test-token",
  ]);
  tree = render();
  elements(tree)
    .find((element) => element.props.title === "Renew license")
    .props.onClick();
  tree = render();
  byId(tree, "license-active").props.onChange(false);
  tree = render();
  await button(tree, "Renew License").props.onClick();
  assert.equal(calls[1][0], "renew");
  assert.ok(Date.parse(calls[1][2].license_expires_at) > Date.now());
  assert.deepEqual(calls[2], [
    "update",
    "bank-1",
    { is_active: false },
    "test-token",
  ]);
});

test("FAQ responses preserve inactive rows, grouped ordering, and real identifiers", () => {
  const runtime = harness();
  const { faqData } = runtime.load("src/components/faqs/faqData.ts");
  const data = faqData({
    settings: { title: "Help", subtitle: "Answers" },
    sections: [
      {
        section_title: "Payments",
        section_order: 2,
        items: [
          {
            faq_id: "42",
            question: "How?",
            answer: "Here",
            item_order: 1,
            is_active: "false",
          },
        ],
      },
      {
        section_title: "Accounts",
        section_order: 1,
        items: [{ id: 7, question: "Where?", answer: "There" }],
      },
    ],
  });
  assert.deepEqual(data.settings, { title: "Help", subtitle: "Answers" });
  assert.deepEqual(
    data.items.map((item) => item.id),
    [7, 42],
  );
  assert.equal(data.items[1].is_active, false);
  assert.equal(data.items[1].section_title, "Payments");
  assert.equal(
    faqData({
      faqs: [{ question: "Missing ID", answer: "Text", section_title: "Help" }],
    }).items[0].id,
    null,
  );
});

test("FAQ editing sends visibility and display order to the selected record", async () => {
  const calls = [];
  const runtime = harness({
    "@/lib/api/faqs": { updateFaq: async (...args) => calls.push(args) },
  });
  const Editor = runtime.load("src/components/faqs/FaqEditor.tsx").default;
  const item = {
    id: 42,
    section_title: "Payments",
    question: "How?",
    answer: "Here",
    section_order: 2,
    item_order: 3,
    is_active: true,
  };
  let closed = false;
  const props = {
    item,
    accessToken: "test-token",
    onSaved: () => {
      closed = true;
    },
    onClose() {},
  };
  let tree = runtime.render(Editor, props);
  byId(tree, "faq-active").props.onChange(false);
  byId(tree, "faq-item_order").props.onChange({ target: { value: "4" } });
  tree = runtime.render(Editor, props);
  await elements(tree)
    .find((element) => element.type === "form")
    .props.onSubmit({ preventDefault() {} });
  assert.deepEqual(calls, [
    [
      42,
      {
        section_title: "Payments",
        question: "How?",
        answer: "Here",
        section_order: 2,
        item_order: 4,
        is_active: false,
      },
      "test-token",
    ],
  ]);
  assert.equal(closed, true);
});

test("FAQ search, visibility, and section filters compose and reset pagination", () => {
  const runtime = harness();
  const Panel = runtime.load(
    "src/components/faqs/FaqQuestionsPanel.tsx",
  ).default;
  const Row = runtime.load("src/components/faqs/FaqQuestion.tsx").default;
  const items = Array.from({ length: 12 }, (_, index) => ({
    id: index,
    section_title: index === 11 ? "Payments" : "Accounts",
    question:
      index === 11 ? "How do I pay a bill?" : `Account question ${index}`,
    answer: "A useful answer",
    is_active: index !== 11,
  }));
  const props = {
    items,
    selected: null,
    loading: false,
    error: "",
    busyId: null,
    onRefresh() {},
    onCreate() {},
    onEdit() {},
    onDelete() {},
    onSelectSection: (section) => {
      props.selected = section;
    },
  };
  const render = () => runtime.render(Panel, props);
  const rows = (tree) =>
    elements(tree).filter((element) => element.type === Row);
  let tree = render();
  assert.equal(rows(tree).length, 10);
  elements(tree)
    .find((element) => element.props.variant === "header")
    .props.pagination.setPage(2);
  tree = render();
  assert.equal(rows(tree).length, 2);
  elements(tree)
    .find((element) => element.props["aria-label"] === messages.faqs.search)
    .props.onChange({ target: { value: "pay a bill" } });
  tree = render();
  assert.equal(rows(tree).length, 1);
  assert.equal(
    elements(tree).find((element) => element.props.variant === "header").props
      .pagination.page,
    1,
  );
  elements(tree)
    .find(
      (element) =>
        element.props["aria-label"] === messages.faqs.design.statusFilter,
    )
    .props.onChange({ target: { value: "active" } });
  tree = render();
  assert.equal(rows(tree).length, 0);
  button(tree, messages.faqs.design.clearFilters).props.onClick();
  props.selected = "Payments";
  tree = render();
  assert.equal(rows(tree).length, 1);
  assert.equal(rows(tree)[0].props.item.is_active, false);
});

test("FAQ answers expand accessibly while edit and delete remain separate actions", () => {
  const runtime = harness();
  const Row = runtime.load("src/components/faqs/FaqQuestion.tsx").default;
  const item = {
    id: 4,
    section_title: "Help",
    question: "How does it work?",
    answer: "A complete answer\nwith a second paragraph.",
    is_active: true,
  };
  let edits = 0;
  const props = { item, busy: false, onEdit: () => edits++, onDelete() {} };
  let tree = runtime.render(Row, props);
  const toggle = elements(tree).find(
    (element) => element.props["aria-expanded"] !== undefined,
  );
  const answerId = toggle.props["aria-controls"];
  assert.equal(byId(tree, answerId).props.hidden, true);
  toggle.props.onClick();
  tree = runtime.render(Row, props);
  assert.equal(byId(tree, answerId).props.hidden, false);
  assert.equal(byId(tree, answerId).props.children.props.children, item.answer);
  elements(tree)
    .find((element) => element.props.tone === "edit")
    .props.onClick();
  assert.equal(edits, 1);
});

test("FAQ header editing preserves long subtitles and saves through the existing API", async () => {
  const calls = [];
  const runtime = harness({
    "@/lib/api/faqs": { updateFaqHeader: async (...args) => calls.push(args) },
  });
  const Header = runtime.load(
    "src/components/faqs/FaqHeaderSettings.tsx",
  ).default;
  const settings = { title: "Axon FAQ", subtitle: "Original introduction" };
  let saved = null;
  const props = {
    settings,
    accessToken: "test-token",
    onSaved: (value) => {
      saved = value;
    },
  };
  let tree = runtime.render(Header, props);
  elements(tree)
    .find((element) => element.props.title === messages.faqs.design.editHeader)
    .props.onClick();
  tree = runtime.render(Header, props);
  assert.equal(button(tree, messages.faqs.saveHeader).props.disabled, true);
  const subtitle = "Helpful answers across every supported banking service. "
    .repeat(5)
    .trim();
  byId(tree, "faq-header-subtitle").props.onChange({
    target: { value: subtitle },
  });
  tree = runtime.render(Header, props);
  assert.equal(button(tree, messages.faqs.saveHeader).props.disabled, false);
  await elements(tree)
    .find((element) => element.type === "form")
    .props.onSubmit({ preventDefault() {} });
  assert.deepEqual(calls, [
    [{ title: settings.title, subtitle }, "test-token"],
  ]);
  assert.deepEqual(saved, { title: settings.title, subtitle });
});

test("analytics page filters forward presets and custom dates through the shared picker", () => {
  const runtime = harness({
    "./AnalyticsPeriodSelect": { __esModule: true, default: "period-picker" },
  });
  const Filters = runtime.load(
    "src/components/analytics/AnalyticsFilters.tsx",
  ).default;
  const calls = [];
  const props = {
    dated: false,
    filters: {},
    onApply: (filters) => calls.push(filters),
  };
  const tree = runtime.render(Filters, props);
  const picker = elements(tree).find(
    (element) => element.type === "period-picker",
  );
  assert.equal(picker.props.value, "allTime");
  picker.props.onChange("last7Days");
  assert.equal(calls[0].period, "last_7_days");
  assert.equal(new Date(calls[0].start_time).getHours(), 0);
  assert.equal(new Date(calls[0].end_time).getHours(), 23);
  picker.props.onCustomChange("2026-10-01", "2026-10-15");
  assert.equal(calls[1].start_date, "2026-10-01");
  assert.equal(calls[1].end_date, "2026-10-15");
  const dated = runtime.render(Filters, {
    ...props,
    dated: true,
    filters: { date: "today" },
  });
  const datedPicker = elements(dated).find(
    (element) => element.type === "period-picker",
  );
  assert.deepEqual(datedPicker.props.options, ["today", "yesterday"]);
  datedPicker.props.onChange("yesterday");
  assert.deepEqual(calls[2], { date: "yesterday" });
  datedPicker.props.onCustomChange("2026-10-02", "2026-10-02");
  assert.deepEqual(calls[3], { date: "2026-10-02" });
});

test("analytics endpoints apply only the filters supported by each summary", async () => {
  const calls = [];
  const runtime = harness({
    "./client": {
      ADMIN_API_BASE_URL: "/backend/admin",
      apiRequest: async (...args) => {
        calls.push(args);
        return {};
      },
    },
  });
  const { getAnalyticsSummary } = runtime.load("src/lib/api/analytics.ts");
  const filters = {
    date: "2026-10-19",
    start_date: "2026-10-01",
    end_date: "2026-10-19",
    start_time: "2026-10-01T00:00:00Z",
    end_time: "2026-10-19T23:59:59Z",
  };
  for (const section of [
    "users",
    "chats",
    "flows",
    "nlp",
    "performance",
    "logs",
  ])
    await getAnalyticsSummary(section, "test-token", filters);
  assert.deepEqual(
    calls.map(([url]) => url),
    ["user", "chat", "flow", "nlp", "performance", "log"].map(
      (name) => `/dashboard-analytics/${name}-summary`,
    ),
  );
  assert.deepEqual(calls[0][1].query, {
    period: "all_time",
    start_date: filters.start_date,
    end_date: filters.end_date,
  });
  assert.deepEqual(calls[2][1].query, calls[0][1].query);
  assert.deepEqual(calls[1][1].query, {
    period: undefined,
    start_date: filters.start_date,
    end_date: filters.end_date,
    start_time: filters.start_time,
    end_time: filters.end_time,
  });
  assert.deepEqual(calls[3][1].query, { date: filters.date });
  assert.ok(
    calls.every(
      ([, options]) =>
        options.bearerToken === "test-token" &&
        options.baseUrl === "/backend/admin",
    ),
  );
});

test("analytics language charts preserve wrapped counts, shares, and readable language names", () => {
  const runtime = harness();
  const { languageRows, languageName, distributionRows } = runtime.load(
    "src/components/analytics/analyticsData.ts",
  );
  const result = languageRows({
    total: 14,
    languages: {
      ur: { count: 9, percentage: 64.29 },
      en: { count: 5, percentage: 35.71 },
    },
  });
  assert.equal(result.total, 14);
  assert.deepEqual(
    result.rows.map(({ key, count, percentage }) => [key, count, percentage]),
    [
      ["ur", 9, 64.29],
      ["en", 5, 35.71],
    ],
  );
  assert.equal(languageName("ur", "en"), "Urdu");
  assert.equal(languageName("en", "en"), "English");
  const partial = languageRows({ total: 10, languages: { en: { count: 8 } } });
  assert.deepEqual(
    partial.rows.map(({ key, count }) => [key, count]),
    [
      ["en", 8],
      ["unknown", 2],
    ],
  );
  assert.deepEqual(languageRows({ total: 0, languages: {} }), {
    total: 0,
    rows: [],
  });
  assert.deepEqual(
    distributionRows([
      { hour: 0, count: 0 },
      { hour: 1, count: 3 },
    ]).map(({ key, count }) => [key, count]),
    [
      ["0", 0],
      ["1", 3],
    ],
  );
});

test("analytics charts retain reported zeroes and sparse categories while ordering time buckets", () => {
  const runtime = harness();
  const { chartRows } = runtime.load(
    "src/components/analytics/analyticsChartData.ts",
  );
  const hours = [
    { hour: 18, count: 3 },
    { hour: 0, count: 0 },
    { hour: 9, count: 8 },
  ];
  const original = JSON.stringify(hours);
  assert.deepEqual(
    chartRows("peak_activity_hours", hours).map(({ key, count }) => [
      key,
      count,
    ]),
    [
      ["0", 0],
      ["9", 8],
      ["18", 3],
    ],
  );
  assert.equal(
    JSON.stringify(hours),
    original,
    "Plotting must not reorder the original response or invent missing hours",
  );
  const days = [
    { day_index: 4, day_name: "Friday", count: 6 },
    { day_index: 0, day_name: "Monday", count: 1 },
  ];
  assert.deepEqual(
    chartRows("activity_by_day_of_week", days).map((row) => row.key),
    ["Monday", "Friday"],
  );
  const buckets = {
    high: { count: 8, percentage: 80 },
    low: { count: 0, percentage: 0 },
    medium: { count: 2, percentage: 20 },
  };
  assert.deepEqual(
    chartRows("intent_confidence_buckets", buckets).map(
      ({ key, count, percentage }) => [key, count, percentage],
    ),
    [
      ["low", 0, 0],
      ["medium", 2, 20],
      ["high", 8, 80],
    ],
  );
});

test("chart keyboard inspection skips missing values and follows RTL direction without changing the series", () => {
  const runtime = harness();
  const Chart = runtime.load(
    "src/components/analytics/AnalyticsPeriodChart.tsx",
  ).default;
  const points = [
    { label: "Today", value: 0 },
    { label: "Missing", value: null },
    { label: "This week", value: 14 },
  ];
  const original = JSON.stringify(points);
  const render = () => runtime.render(Chart, { points });
  const canvas = (tree) =>
    elements(tree).find((element) => element.type === "canvas");
  const tooltip = (tree) =>
    elements(tree).find((element) => element.props.role === "status");
  let tree = render();
  canvas(tree).props.onFocus();
  tree = render();
  assert.equal(tooltip(tree).props.children[0].props.children, "Today");
  assert.equal(tooltip(tree).props.children[1].props.children, "0");
  const previousStyle = globalThis.getComputedStyle;
  let direction = "ltr";
  globalThis.getComputedStyle = () => ({ direction });
  try {
    canvas(tree).props.onKeyDown({
      key: "ArrowRight",
      currentTarget: {},
      preventDefault() {},
    });
    tree = render();
    assert.equal(tooltip(tree).props.children[0].props.children, "This week");
    assert.equal(tooltip(tree).props.children[1].props.children, "14");
    direction = "rtl";
    canvas(tree).props.onKeyDown({
      key: "ArrowRight",
      currentTarget: {},
      preventDefault() {},
    });
    tree = render();
    assert.equal(tooltip(tree).props.children[0].props.children, "Today");
    canvas(tree).props.onKeyDown({
      key: "End",
      currentTarget: {},
      preventDefault() {},
    });
    tree = render();
    assert.equal(tooltip(tree).props.children[0].props.children, "This week");
    canvas(tree).props.onKeyDown({ key: "Escape" });
    assert.equal(tooltip(render()), undefined);
    assert.equal(JSON.stringify(points), original);
  } finally {
    if (previousStyle) globalThis.getComputedStyle = previousStyle;
    else delete globalThis.getComputedStyle;
  }
});

test("analytics detail tables keep nested diagnostics in aligned columns", () => {
  const runtime = harness();
  const { analyticsTableRows } = runtime.load(
    "src/components/analytics/analyticsData.ts",
  );
  assert.deepEqual(
    analyticsTableRows([
      {
        request_id: "req-1",
        timing: { average: 45, p95: 90 },
        error: "<script>raw text</script>",
      },
    ]),
    [
      {
        request_id: "req-1",
        "timing.average": 45,
        "timing.p95": 90,
        error: "<script>raw text</script>",
      },
    ],
  );
  assert.deepEqual(
    analyticsTableRows({ transfer: { completed: 4, failed: 0 } }),
    [{ name: "transfer", completed: 4, failed: 0 }],
  );
});

test("log rows expand the complete JSON and collapse without changing the payload", () => {
  const runtime = harness();
  const Row = runtime.load("src/components/logs/RawLogRow.tsx").default;
  const entry = {
    id: "event-1",
    data: {
      level: "info",
      event: "turn_started",
      nested: { message: "<script>text</script>" },
    },
  };
  const render = () => runtime.render(Row, { entry });
  let tree = render();
  let toggle = elements(tree).find((element) => element.type === "button");
  assert.equal(toggle.props.children[0].props.children, "View more");
  assert.equal(toggle.props["aria-expanded"], false);
  assert.equal(
    elements(tree).find((element) => element.type === "pre").props.hidden,
    true,
  );
  toggle.props.onClick();
  tree = render();
  toggle = elements(tree).find((element) => element.type === "button");
  const details = elements(tree).find((element) => element.type === "pre");
  assert.equal(toggle.props.children[0].props.children, "View less");
  assert.equal(toggle.props["aria-expanded"], true);
  assert.equal(toggle.props["aria-controls"], details.props.id);
  assert.equal(details.props.hidden, false);
  assert.deepEqual(JSON.parse(details.props.children), entry.data);
  toggle.props.onClick();
  tree = render();
  assert.equal(
    elements(tree).find((element) => element.type === "pre").props.hidden,
    true,
  );
});

test("pagination resets for filters and page size, clamps after deletion, and reports empty ranges", () => {
  const runtime = harness();
  const paginate = runtime.load("src/hooks/usePagination.ts").default;
  let rows = Array.from({ length: 26 }, (_, index) => index + 1);
  let key = "all";
  const render = () => runtime.render(() => paginate(rows, key));
  let page = render();
  assert.deepEqual(page.items, rows.slice(0, 10));
  page.setPage(3);
  page = render();
  assert.deepEqual([page.start, page.end, page.total], [21, 26, 26]);
  rows = rows.slice(0, 20);
  page = render();
  assert.equal(page.page, 2);
  key = "filtered";
  page = render();
  assert.equal(page.page, 1);
  key = "all";
  page = render();
  assert.equal(
    page.page,
    1,
    "Restoring a filter must not restore a stale page",
  );
  page.setPageSize(20);
  page = render();
  assert.deepEqual([page.page, page.pageSize, page.items.length], [1, 20, 20]);
  rows = [];
  page = render();
  assert.deepEqual(
    [page.start, page.end, page.page, page.pageCount],
    [0, 0, 1, 1],
  );
});

test("live pagination follows the latest page and allows a paused snapshot to be browsed", () => {
  const runtime = harness();
  const paginate = runtime.load("src/hooks/usePagination.ts").default;
  const rows = Array.from({ length: 120 }, (_, index) => index);
  let page = runtime.render(() => paginate(rows, "", 50, true));
  assert.equal(page.page, 3);
  page.setPage(1);
  page = runtime.render(() => paginate(rows, "", 50, false));
  assert.equal(page.page, 1);
  assert.equal(page.items[0], 0);
});

test("empty institution submission highlights both fields, blocks the API, and resets when reopened", async () => {
  let requests = 0;
  const runtime = harness({
    "@/lib/api/institutions": {
      getAllInstitutions: async () => [],
      createInstitution: async () => {
        requests++;
        return { institution_id: "1", license_key: "key" };
      },
    },
  });
  const Manager = runtime.load(
    "src/components/institutions/InstitutionsManager.tsx",
  ).default;
  const render = () => runtime.render(Manager);
  let tree = render();
  button(tree, "New Institution").props.onClick();
  tree = render();
  await button(tree, "Create Institution").props.onClick();
  tree = render();
  assert.equal(byId(tree, "create-name").props.error, true);
  assert.equal(byId(tree, "create-expiry").props.error, true);
  assert.equal(requests, 0);
  byId(tree, "create-name").props.onChange({ target: { value: "  " } });
  tree = render();
  assert.equal(byId(tree, "create-name").props.error, true);
  byId(tree, "create-name").props.onChange({ target: { value: "Test Bank" } });
  byId(tree, "create-expiry").props.onChange("2027-10-16T12:00");
  tree = render();
  assert.equal(byId(tree, "create-name").props.error, false);
  assert.equal(byId(tree, "create-expiry").props.error, false);
  await button(tree, "Create Institution").props.onClick();
  assert.equal(requests, 1);
  tree = render();
  button(tree, "New Institution").props.onClick();
  tree = render();
  assert.equal(byId(tree, "create-name").props.error, false);
});

test("configuration edits validate per field and save only the selected value", async () => {
  const runtime = harness();
  const Row = runtime.load(
    "src/components/configurations/ConfigurationRow.tsx",
  ).default;
  const calls = [];
  const config = {
    config_key: "LIMIT",
    config_value: "10",
    data_type: "integer",
    min_value: 1,
    max_value: 50,
  };
  const props = {
    config,
    editing: true,
    value: "",
    saving: false,
    busy: false,
    onChange: () => {},
    onSave: async (...args) => calls.push(args),
  };
  let tree = runtime.render(Row, props);
  await button(tree, "Save").props.onClick();
  tree = runtime.render(Row, props);
  assert.equal(byId(tree, "configuration-LIMIT").props.error, true);
  assert.equal(
    elements(tree).some((element) => element.props.role === "alert"),
    false,
    "Empty required fields should have no general message",
  );
  props.value = "51";
  tree = runtime.render(Row, props);
  await button(tree, "Save").props.onClick();
  assert.equal(calls.length, 0);
  props.value = "25";
  tree = runtime.render(Row, props);
  await button(tree, "Save").props.onClick();
  assert.deepEqual(calls, [[config, "25"]]);
  const cells = tree.props.children.filter(Boolean);
  assert.ok(
    elements(cells.at(-1)).some((element) => element.props.children === "Save"),
    "Save belongs after Last updated",
  );
});

test("native required validation suppresses browser messages and clears red state when corrected", () => {
  const runtime = harness();
  const Input = runtime.load(
    "src/components/form/input/InputField.tsx",
  ).default;
  let tree = runtime.render(Input, { id: "required-input", required: true });
  let suppressed = false;
  byId(tree, "required-input").props.onInvalid({
    preventDefault: () => {
      suppressed = true;
    },
  });
  tree = runtime.render(Input, { id: "required-input", required: true });
  assert.equal(suppressed, true);
  assert.equal(byId(tree, "required-input").props["aria-invalid"], true);
  byId(tree, "required-input").props.onChange({
    currentTarget: { validity: { valid: true } },
  });
  tree = runtime.render(Input, { id: "required-input", required: true });
  assert.equal(byId(tree, "required-input").props["aria-invalid"], undefined);
});

test("user editing saves changed details and status, and disables Save after reverting", async () => {
  const calls = [];
  let closed = 0;
  let reloaded = 0;
  const runtime = harness({
    "@/lib/api/adminUsers": {
      updateDashboardUser: async (...args) => calls.push(args),
    },
  });
  const Editor = runtime.load("src/components/users/EditUserModal.tsx").default;
  const user = {
    user_id: "user/17",
    username: "jane",
    email: "jane@example.com",
    role: "MANAGER",
    is_active: true,
  };
  const render = () =>
    runtime.render(Editor, {
      user,
      accessToken: "test-token",
      onClose: () => closed++,
      onSaved: async () => reloaded++,
    });
  const submit = async (tree) =>
    elements(tree)
      .find((el) => el.type === "form")
      .props.onSubmit({ preventDefault() {} });
  let tree = render();
  assert.equal(button(tree, "Save Changes").props.disabled, true);
  await submit(tree);
  assert.equal(calls.length, 0);
  byId(tree, "edit-email").props.onChange({
    target: { value: "new@example.com" },
  });
  tree = render();
  assert.equal(button(tree, "Save Changes").props.disabled, false);
  byId(tree, "edit-email").props.onChange({ target: { value: user.email } });
  tree = render();
  assert.equal(button(tree, "Save Changes").props.disabled, true);
  byId(tree, "edit-user-active").props.onChange(false);
  tree = render();
  assert.equal(button(tree, "Save Changes").props.disabled, false);
  byId(tree, "edit-user-active").props.onChange(true);
  tree = render();
  assert.equal(button(tree, "Save Changes").props.disabled, true);
  byId(tree, "edit-role").props.onChange({ target: { value: "VIEWER" } });
  byId(tree, "edit-user-active").props.onChange(false);
  tree = render();
  await submit(tree);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(calls, [
    [
      "user/17",
      {
        username: "jane",
        email: "jane@example.com",
        role: "VIEWER",
        is_active: false,
      },
      "test-token",
    ],
  ]);
  assert.equal(closed, 1);
  assert.equal(reloaded, 1);
});

test("failed user updates keep edits available for retry", async () => {
  let closed = false;
  const runtime = harness({
    "@/lib/api/adminUsers": {
      updateDashboardUser: async () => {
        throw new Error("unavailable");
      },
    },
  });
  const Editor = runtime.load("src/components/users/EditUserModal.tsx").default;
  const render = () =>
    runtime.render(Editor, {
      user: {
        user_id: "17",
        username: "jane",
        email: "jane@example.com",
        role: "SUPER_ADMIN",
        is_active: true,
      },
      accessToken: "test-token",
      onClose: () => {
        closed = true;
      },
      onSaved: async () => {},
    });
  let tree = render();
  assert.equal(byId(tree, "edit-role").props.value, "SUPER_ADMIN");
  byId(tree, "edit-username").props.onChange({
    target: { value: "jane.updated" },
  });
  tree = render();
  elements(tree)
    .find((el) => el.type === "form")
    .props.onSubmit({ preventDefault() {} });
  await new Promise((resolve) => setImmediate(resolve));
  tree = render();
  assert.equal(closed, false);
  assert.equal(byId(tree, "edit-username").props.value, "jane.updated");
  assert.equal(button(tree, "Save Changes").props.disabled, false);
  assert.equal(
    elements(tree).find((el) => el.props.role === "alert").props.children,
    "Failed to update user.",
  );
});

test("card edits preserve the real ID and inactive state; unchanged and reverted forms cannot save", async () => {
  const calls = [];
  const record = { type_id: 7, type_name: "credit", is_active: false };
  const runtime = harness();
  const Section = runtime.load(
    "src/components/masterData/MasterDataSection.tsx",
  ).default;
  const props = {
    title: "Card Types",
    idField: "type_id",
    fields: [
      { key: "type_name", label: "Card Type", type: "text", required: true },
      { key: "is_active", label: "Active", type: "checkbox" },
    ],
    fetchItems: async () => [record],
    createItem: async () => {},
    updateItem: async (...args) => calls.push(args),
  };
  const render = () => runtime.render(Section, props);
  let tree = render();
  await runtime.runEffects();
  tree = render();
  elements(tree)
    .find((el) => el.props.title === "Edit")
    .props.onClick();
  tree = render();
  assert.equal(button(tree, "Save Changes").props.disabled, true);
  await button(tree, "Save Changes").props.onClick();
  assert.equal(calls.length, 0);
  byId(
    elements(tree).find((el) => el.type === "Modal" && el.props.isOpen),
    "field-type_name",
  ).props.onChange({
    target: { value: "credit updated" },
  });
  tree = render();
  assert.equal(button(tree, "Save Changes").props.disabled, false);
  byId(
    elements(tree).find((el) => el.type === "Modal" && el.props.isOpen),
    "field-type_name",
  ).props.onChange({ target: { value: "credit" } });
  tree = render();
  assert.equal(button(tree, "Save Changes").props.disabled, true);
  byId(
    elements(tree).find((el) => el.type === "Modal" && el.props.isOpen),
    "field-type_name",
  ).props.onChange({
    target: { value: "credit updated" },
  });
  tree = render();
  await button(tree, "Save Changes").props.onClick();
  assert.deepEqual(calls, [
    [7, { type_name: "credit updated", is_active: false }, "test-token"],
  ]);
});

test("dashboard includes all ten overview metrics", () => {
  const runtime = harness();
  const Dashboard = runtime.load(
    "src/components/dashboard/DashboardStats.tsx",
  ).default;
  const MetricCard = runtime.load(
    "src/components/dashboard/AnalyticsMetricCard.tsx",
  ).default;
  const panels = [
    "AnalyticsKpiCards",
    "EngagementOverview",
    "FlowOutcomes",
  ].map((name) => runtime.load(`src/components/dashboard/${name}.tsx`).default);
  const tree = runtime.render(Dashboard);
  const children = elements(tree).filter((element) =>
    panels.includes(element.type),
  );
  assert.equal(children.length, 3);
  const SharedCards = runtime.load(
    "src/components/common/AudienceKpiCards.tsx",
  ).default;
  const metrics = children
    .flatMap((element) => elements(runtime.render(element.type, element.props)))
    .flatMap((element) =>
      element.type === "@/components/common/AudienceKpiCards"
        ? elements(runtime.render(SharedCards, element.props))
        : [element],
    )
    .filter(
      (element) =>
        element.type === MetricCard ||
        element.type === "@/components/dashboard/AnalyticsMetricCard",
    );
  assert.equal(metrics.length, 10);
  assert.equal(new Set(metrics.map((element) => element.props.label)).size, 10);
});

test("metric trends preserve reported percentages, zero history and missing samples", () => {
  const { readMetricTrend } = harness().load(
    "src/components/analytics/analyticsTrends.ts",
  );
  const source = {
    change_pct: 0,
    comparison_label: "last_hour",
    sparkline: [0, null, 2, NaN, 0],
    is_positive: false,
  };
  const trend = readMetricTrend(source);
  assert.equal(trend.change, 0);
  assert.equal(trend.direction, "flat");
  assert.equal(trend.comparison, "last_hour");
  assert.deepEqual(
    trend.points.map((point) => point.value),
    [0, null, 2, null, 0],
  );
  assert.equal(trend.favorable, false);
  assert.ok(Number.isNaN(source.sparkline[3]));
  assert.equal(readMetricTrend({ value: 40 }), null);
  assert.equal(
    readMetricTrend({ change_pct: Infinity, sparkline: [null, NaN] }),
    null,
  );
});

test("metric trend lookup matches API blocks and keeps the legacy DAU comparison", () => {
  const { metricTrend } = harness().load(
    "src/components/analytics/analyticsTrends.ts",
  );
  const data = {
    top_kpis: {
      total_unique_users: {
        trend: { pct: 12.5, comparison: "last_month" },
        sparkline: { values: [1, 2], labels: ["A", "B"] },
      },
    },
    audience_and_retention: [{ key: "returning_users", change_pct: -3 }],
    daily_active_users_growth: { growth_pct: -88.9, yesterday_count: 9 },
  };
  const users = metricTrend(data, "total_users");
  assert.equal(users.change, 12.5);
  assert.deepEqual(users.points, [
    { value: 1, label: "A" },
    { value: 2, label: "B" },
  ]);
  assert.equal(
    metricTrend(data, "returning_users", ["audience_and_retention"]).change,
    -3,
  );
  assert.equal(metricTrend(data, "daily_active_users").previousCount, 9);
  assert.equal(metricTrend(data, "daily_active_users").comparison, "yesterday");
  assert.equal(metricTrend(data, "total_sessions"), null);
});

test("reported history retains dates and constant mini charts are omitted", () => {
  const runtime = harness();
  const { metricHistory, readMetricTrend } = runtime.load(
    "src/components/analytics/analyticsTrends.ts",
  );
  assert.deepEqual(
    metricHistory(
      {
        active_audience: {
          series: [
            { date: "2026-10-20", count: 0 },
            { date: "2026-10-21", count: 7 },
          ],
        },
      },
      "active_audience",
    ),
    [
      { label: "2026-10-20", value: 0 },
      { label: "2026-10-21", value: 7 },
    ],
  );
  assert.deepEqual(metricHistory({}, "active_audience"), []);
  const Sparkline = runtime.load(
    "src/components/analytics/MetricSparkline.tsx",
  ).default;
  assert.equal(
    runtime.render(Sparkline, {
      points: readMetricTrend({ sparkline: [0, 0, 0] }).points,
    }),
    null,
  );
  assert.equal(
    runtime.render(Sparkline, {
      points: readMetricTrend({ sparkline: [7, 7, 7] }).points,
    }),
    null,
  );
  assert.equal(
    runtime.render(Sparkline, {
      points: readMetricTrend({ sparkline: [0, 1, 0] }).points,
    }).type,
    "canvas",
  );
});

test("trend colors distinguish direction from improvement and treat zero as neutral", () => {
  const { readMetricTrend, trendSentiment, lowerMetricIsBetter } =
    harness().load("src/components/analytics/analyticsTrends.ts");
  const falling = readMetricTrend({ change_pct: -2 });
  assert.equal(trendSentiment(falling), "negative");
  assert.equal(
    trendSentiment(falling, lowerMetricIsBetter("flow_abandonment_rate_pct")),
    "positive",
  );
  assert.equal(
    trendSentiment(
      readMetricTrend({ change_pct: 2 }),
      lowerMetricIsBetter("average_response_time"),
    ),
    "negative",
  );
  assert.equal(
    trendSentiment(readMetricTrend({ change_pct: 0, is_positive: true })),
    "neutral",
  );
  assert.equal(
    trendSentiment(readMetricTrend({ change_pct: -2, is_improvement: true })),
    "positive",
  );
});

test("trend badges show a neutral zero and preserve a reported comparison label", () => {
  const runtime = harness();
  const { readMetricTrend } = runtime.load(
    "src/components/analytics/analyticsTrends.ts",
  );
  const { MetricTrendBadge } = runtime.load(
    "src/components/analytics/MetricTrend.tsx",
  );
  const tree = runtime.render(MetricTrendBadge, {
    trend: readMetricTrend({ change_pct: 0, comparison_label: "last_hour" }),
  });
  const text = elements(tree)
    .flatMap((el) => React.Children.toArray(el.props.children))
    .filter((child) => typeof child === "string");
  assert.ok(text.includes("0%"));
  assert.ok(text.includes("vs last hour"));
  assert.ok(
    elements(tree).some((el) => el.props.className?.includes("bg-gray-100")),
  );
});

test("journey chart preserves zero, missing outcomes and reported totals without mutating the source", () => {
  const runtime = harness();
  const { journeyChartRows } = runtime.load(
    "src/components/analytics/analyticsJourneyData.ts",
  );
  const source = {
    bank_transfer: {
      total: 36,
      completed: 0,
      cancelled: 0,
      failed: 0,
      abandoned: 36,
      completion_rate_pct: 0,
    },
    add_beneficiary: {
      total_initialized_flows: 22,
      total_completed_flows: 2,
      total_failed_flows: 2,
      total_abandoned_flows: 18,
    },
    missing: { total: 0, initialized: 9, failed: -1 },
  };
  const original = JSON.stringify(source);
  const rows = journeyChartRows(source);
  assert.equal(rows[0].label, "bank transfer");
  assert.deepEqual(rows[0].values, {
    total: 36,
    completed: 0,
    cancelled: 0,
    failed: 0,
    abandoned: 36,
  });
  assert.deepEqual(rows[1].values, {
    total: 22,
    completed: 2,
    cancelled: null,
    failed: 2,
    abandoned: 18,
  });
  assert.deepEqual(rows[2].values, {
    total: 0,
    completed: null,
    cancelled: null,
    failed: null,
    abandoned: null,
  });
  assert.equal(JSON.stringify(source), original);
  assert.equal(
    journeyChartRows([{ flow_type: "show_list", total: 33 }])[0].label,
    "show list",
  );
});

test("journey View All opens its analytics section and invalid section links fall back to Audience", async () => {
  const runtime = harness({
    "next-intl/server": {
      setRequestLocale: () => {},
      getTranslations: async () => (key) => key,
    },
  });
  const Flows = runtime.load(
    "src/components/dashboard/FlowOutcomes.tsx",
  ).default;
  const link = elements(runtime.render(Flows, { overview: null })).find(
    (element) => element.type === "a",
  );
  assert.equal(link.props.href, "/analytics?section=flows");
  assert.ok(React.Children.toArray(link.props.children).includes("View All"));
  const Page = runtime.load(
    "src/app/[locale]/(admin)/(others-pages)/analytics/page.tsx",
  ).default;
  for (const [section, expected] of [
    ["flows", "flows"],
    ["users", "users"],
    [undefined, "users"],
    ["unknown", "users"],
    ["toString", "users"],
    [["flows", "users"], "users"],
  ]) {
    const tree = await Page({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ section }),
    });
    assert.equal(tree.props.initialSection, expected);
    assert.equal(tree.key, expected);
  }
});

test("FAQ proxy preserves the trailing slash before the generic backend rewrite", async () => {
  const runtime = harness({ "next-intl/plugin": () => (config) => config });
  const config = runtime.load("next.config.ts").default;
  const routes = await config.rewrites();
  const faqIndex = routes.findIndex(
    (route) => route.source === "/backend/admin/faqs/",
  );
  assert.ok(faqIndex >= 0);
  assert.ok(routes[faqIndex].destination.endsWith("/admin/faqs/"));
  assert.ok(
    faqIndex < routes.findIndex((route) => route.source === "/backend/:path*"),
  );
});

test("analytics display API percentages without inventing trends or hiding zero outcomes", () => {
  const runtime = harness();
  const overview = {
    total_users: 43,
    total_sessions: 3008,
    active_sessions: 1,
    daily_active_users: { count: 6, yesterday_count: 2, growth_pct: 200 },
    stickiness_ratio_pct: 33.3,
    engaged_sessions_rate_pct: 44.7,
    returning_user_rate_pct: 83.3,
    total_flows_initiated: 19,
    flow_completion_rate_pct: 0,
    flow_abandonment_rate_pct: 100,
  };
  const Cards = runtime.load(
    "src/components/dashboard/AnalyticsKpiCards.tsx",
  ).default;
  const MetricCard = runtime.load(
    "src/components/dashboard/AnalyticsMetricCard.tsx",
  ).default;
  const SharedCards = runtime.load(
    "src/components/common/AudienceKpiCards.tsx",
  ).default;
  const Badge = runtime.load(
    "src/components/analytics/MetricTrend.tsx",
  ).MetricTrendBadge;
  const expandCards = (tree) => [
    tree,
    ...elements(tree).flatMap((element) => {
      if (element.type === "@/components/common/AudienceKpiCards")
        return expandCards(runtime.render(SharedCards, element.props));
      if (
        element.type === MetricCard ||
        element.type === "@/components/dashboard/AnalyticsMetricCard"
      )
        return expandCards(runtime.render(MetricCard, element.props));
      if (element.type === "MetricTrendBadge" || element.type === Badge)
        return expandCards(runtime.render(Badge, element.props));
      // The counter shows its final text, so read it from the prop.
      if (element.type === "@/components/common/CountUpText")
        return [React.createElement("span", null, element.props.text)];
      return [];
    }),
  ];
  let tree = runtime.render(Cards, { overview });
  const copy = (tree) =>
    elements(expandCards(tree))
      .flatMap((el) => React.Children.toArray(el.props.children))
      .filter((child) => typeof child === "string");
  assert.ok(copy(tree).includes("3,008"));
  assert.ok(copy(tree).includes("+200%"));
  const Engagement = runtime.load(
    "src/components/dashboard/EngagementOverview.tsx",
  ).default;
  tree = runtime.render(Engagement, { overview });
  assert.deepEqual(
    elements(expandCards(tree))
      .filter((el) => el.props.role === "progressbar")
      .map((el) => el.props["aria-valuenow"]),
    [44.7, 83.3, 33.3],
  );
  const Outcomes = runtime.load(
    "src/components/dashboard/FlowOutcomes.tsx",
  ).default;
  tree = runtime.render(Outcomes, { overview });
  assert.ok(copy(tree).includes("0%"));
  assert.ok(copy(tree).includes("100%"));
  assert.ok(copy(tree).includes("19"));
  tree = runtime.render(Outcomes, {
    overview: { ...overview, total_flows_initiated: 0 },
  });
  assert.ok(copy(tree).includes("No banking journeys started yet"));
  tree = runtime.render(Outcomes, { overview: null });
  assert.equal(copy(tree).includes("0%"), false);
});

test("configuration validation rejects incorrect types and enforces numeric bounds", () => {
  const runtime = harness();
  const { validateConfigValue, isConfigDraft } = runtime.load(
    "src/components/configurations/configurationFields.ts",
  );
  const t = (key) => key;
  const base = { config_key: "SETTING", config_value: "10" };
  for (const data_type of ["int", "integer"]) {
    const config = { ...base, data_type };
    for (const value of [
      "1.5",
      "1.0",
      "abc",
      "true",
      "1e3",
      "0x10",
      "NaN",
      "Infinity",
      "",
      " ",
    ]) {
      assert.notEqual(
        validateConfigValue(config, value, t),
        null,
        `${data_type}: ${value}`,
      );
    }
    for (const value of ["0", "15", "-10"])
      assert.equal(validateConfigValue(config, value, t), null);
    for (const value of ["1.5", "abc", "1e3", "0x10"])
      assert.equal(isConfigDraft(config, value), false);
    assert.equal(
      isConfigDraft(config, "-"),
      true,
      "Negative integers can be entered incrementally",
    );
  }
  for (const data_type of ["float", "double", "decimal", "number"]) {
    const config = { ...base, data_type, min_value: 0, max_value: 1 };
    for (const value of ["0", "0.5", ".25", "1"])
      assert.equal(validateConfigValue(config, value, t), null);
    for (const value of [
      "-0.1",
      "1.1",
      "abc",
      "true",
      "NaN",
      "Infinity",
      "1e3",
      "0x10",
      ".",
      "-",
    ])
      assert.notEqual(validateConfigValue(config, value, t), null);
    assert.equal(isConfigDraft(config, "0."), true);
    assert.equal(isConfigDraft(config, "abc"), false);
  }
  for (const data_type of ["bool", "boolean"]) {
    const config = { ...base, data_type };
    for (const value of ["true", "false"])
      assert.equal(validateConfigValue(config, value, t), null);
    for (const value of ["yes", "no", "1", "0", "other"])
      assert.notEqual(validateConfigValue(config, value, t), null);
  }
  assert.equal(
    validateConfigValue(
      { ...base, data_type: "string" },
      "arbitrary text 123",
      t,
    ),
    null,
  );
});

test("configuration controls reject invalid drafts and block invalid saves without a Type column", async () => {
  for (const [kind, invalid, valid] of [
    ["integer", ["abc", "1.5", "1e3"], "25"],
    ["number", ["abc", "0x10", "1e3"], "0.5"],
  ]) {
    const runtime = harness();
    const Row = runtime.load(
      "src/components/configurations/ConfigurationRow.tsx",
    ).default;
    const calls = [];
    const changes = [];
    const config = {
      config_key: "LIMIT",
      config_value: "10",
      data_type: kind,
      min_value: 0,
      max_value: 50,
    };
    const props = {
      config,
      editing: true,
      value: "10",
      saving: false,
      busy: false,
      onChange: (value) => {
        changes.push(value);
        props.value = value;
      },
      onSave: async (...args) => calls.push(args),
    };
    const render = () => runtime.render(Row, props);
    let tree = render();
    assert.equal(
      tree.props.children.filter(Boolean).length,
      5,
      "Only setting, description, value, update time, and actions remain",
    );
    assert.equal(
      byId(tree, "configuration-LIMIT").props.step,
      kind === "integer" ? 1 : "any",
    );
    for (const value of invalid) {
      byId(tree, "configuration-LIMIT").props.onChange({ target: { value } });
      tree = render();
      assert.equal(props.value, "10");
    }
    assert.deepEqual(changes, []);
    byId(tree, "configuration-LIMIT").props.onChange({
      target: { value: "51" },
    });
    tree = render();
    assert.equal(button(tree, "Save").props.disabled, true);
    await button(tree, "Save").props.onClick();
    assert.equal(calls.length, 0);
    byId(tree, "configuration-LIMIT").props.onChange({
      target: { value: valid },
    });
    tree = render();
    assert.equal(button(tree, "Save").props.disabled, false);
    await button(tree, "Save").props.onClick();
    assert.deepEqual(calls, [[config, valid]]);
  }
});

test("all requested page sizes render and paginate the correct slices", () => {
  const runtime = harness();
  const paginate = runtime.load("src/hooks/usePagination.ts").default;
  const rows = Array.from({ length: 125 }, (_, index) => index + 1);
  const render = () => runtime.render(() => paginate(rows));
  let pagination = render();
  for (const size of [10, 20, 30, 50, 100]) {
    pagination.setPageSize(size);
    pagination = render();
    assert.deepEqual(pagination.items, rows.slice(0, size));
    pagination.setPage(2);
    pagination = render();
    assert.deepEqual(pagination.items, rows.slice(size, size * 2));
  }
  const { RowsPerPage } = runtime.load("src/components/common/Pagination.tsx");
  const tree = runtime.render(RowsPerPage, { pagination });
  assert.deepEqual(
    elements(tree)
      .filter((el) => el.type === "option")
      .map((el) => el.props.value),
    [10, 20, 30, 50, 100],
  );
});

test("log date bounds use real timestamps regardless of ordering and skip invalid dates", () => {
  const runtime = harness();
  const { logDateBounds, logTimestamp } = runtime.load(
    "src/components/logs/logDates.ts",
  );
  const entries = [
    { data: { timestamp: "2026-10-19T09:30:00Z" } },
    { data: { timestamp: "invalid", created_at: "2026-10-18T18:00:00Z" } },
    { data: { timestamp: "2026-10-19T12:00:00Z" } },
    { data: {} },
  ];
  const bounds = logDateBounds(entries);
  assert.equal(bounds.start.toISOString(), "2026-10-18T18:00:00.000Z");
  assert.equal(bounds.end.toISOString(), "2026-10-19T12:00:00.000Z");
  assert.equal(logDateBounds([{ data: { timestamp: "invalid" } }]), null);
  assert.equal(logDateBounds([]), null);
  assert.equal(logTimestamp({ timestamp: " " }), null);
});

test("log headers and rows expose date information and handle missing timestamps", () => {
  const runtime = harness();
  const Viewer = runtime.load("src/components/logs/RawLogViewer.tsx").default;
  const Row = runtime.load("src/components/logs/RawLogRow.tsx").default;
  const entries = [
    {
      id: 1,
      data: {
        timestamp: "2026-10-19T09:30:00Z",
        event: "started",
        level: "info",
      },
    },
    {
      id: 2,
      data: {
        timestamp: "2026-10-19T10:00:00Z",
        event: "finished",
        level: "info",
      },
    },
  ];
  let tree = runtime.render(Viewer, { entries });
  assert.deepEqual(
    elements(tree)
      .filter((el) => el.type === "time")
      .map((el) => el.props.dateTime),
    ["2026-10-19T09:30:00.000Z", "2026-10-19T10:00:00.000Z"],
  );
  assert.ok(elements(tree).some((el) => el.props.children === "Date & time"));
  tree = runtime.render(Row, { entry: entries[0] });
  assert.ok(
    elements(tree)
      .filter((el) => el.type === "time")
      .every((el) => el.props.dateTime === "2026-10-19T09:30:00.000Z"),
  );
  tree = runtime.render(Viewer, {
    entries: [{ id: 3, data: { event: "no_date" } }],
  });
  assert.ok(
    elements(tree).some((el) => el.props.children === "Timestamp unavailable"),
  );
});

test("table summaries and page-size selectors stay in the header while navigation stays in the footer", () => {
  const runtime = harness();
  const Controls = runtime.load("src/components/common/Pagination.tsx").default;
  const changes = [];
  const pagination = {
    page: 1,
    pageSize: 10,
    pageCount: 20,
    total: 200,
    start: 1,
    end: 10,
    setPage: (page) => changes.push(["page", page]),
    setPageSize: (size) => changes.push(["size", size]),
  };
  let tree = runtime.render(Controls, { pagination, variant: "header" });
  assert.equal(tree.props["aria-label"], "Table controls");
  assert.equal(button(tree, "Next"), undefined);
  const { RowsPerPage } = runtime.load("src/components/common/Pagination.tsx");
  const select = elements(runtime.render(RowsPerPage, { pagination })).find(
    (el) => el.type === "select",
  );
  assert.ok(select);
  select.props.onChange({ target: { value: "30" } });
  assert.deepEqual(changes, [["size", 30]]);
  assert.equal(
    runtime.render(Controls, {
      pagination,
      variant: "header",
      showRows: false,
    }),
    null,
  );
  tree = runtime.render(Controls, { pagination, variant: "footer" });
  assert.equal(
    elements(tree).some((el) => el.type === "select"),
    false,
  );
  assert.equal(button(tree, "Previous").props.disabled, true);
  button(tree, "Next").props.onClick();
  assert.deepEqual(changes.at(-1), ["page", 2]);
});

test("shared header breadcrumbs identify the current page and nested log session", () => {
  let pathname = "/users";
  const runtime = harness({
    "@/i18n/navigation": { Link: "a", usePathname: () => pathname },
    "@/context/SidebarContext": {
      useSidebar: () => ({ toggleSidebar() {}, toggleMobileSidebar() {} }),
    },
  });
  const Header = runtime.load("src/layout/AppHeader.tsx").default;
  const render = () => runtime.render(Header);
  let tree = render();
  let breadcrumb = elements(tree).find(
    (el) => el.props["aria-label"] === "Breadcrumb",
  );
  assert.ok(breadcrumb);
  assert.equal(
    elements(breadcrumb).find((el) => el.props["aria-current"] === "page").props
      .children,
    "Dashboard Users",
  );
  assert.ok(
    elements(breadcrumb).some((el) => el.type === "a" && el.props.href === "/"),
  );
  pathname = "/logs/session-17";
  tree = render();
  breadcrumb = elements(tree).find(
    (el) => el.props["aria-label"] === "Breadcrumb",
  );
  assert.equal(
    elements(breadcrumb).find((el) => el.props["aria-current"] === "page").props
      .children,
    "Session log",
  );
  assert.ok(
    elements(breadcrumb).some(
      (el) => el.type === "a" && el.props.href === "/logs",
    ),
  );
});

test("one Messages Edit button enables all rows; drafts survive pagination and individual saves", async () => {
  const calls = [];
  let loads = 0;
  const records = Array.from({ length: 12 }, (_, index) => ({
    message_key: `message.${index}`,
    msg_en: "Original {amount}",
    msg_ur: "Urdu original",
    msg_ar: null,
    parameters: ["amount"],
    is_active: true,
    metadata: { preserve: index },
  }));
  const runtime = harness({
    "@/lib/api/messages": {
      getMessages: async () => {
        loads++;
        return records;
      },
      updateMessage: async (...args) => {
        calls.push(args);
        return { success: true };
      },
    },
  });
  const Manager = runtime.load(
    "src/components/messages/MessagesManager.tsx",
  ).default;
  const Row = runtime.load("src/components/messages/MessageRow.tsx").default;
  const render = () => runtime.render(Manager);
  const rows = (tree) => elements(tree).filter((el) => el.type === Row);
  const controls = (tree) =>
    elements(tree).find(
      (el) => el.props.variant === "footer" && el.props.pagination,
    );
  let tree = render();
  assert.equal(button(tree, "Edit").props.disabled, true);
  await runtime.runEffects();
  tree = render();
  assert.ok(rows(tree).every((row) => row.props.editing === false));
  assert.equal(
    elements(tree).filter(
      (el) => el.props.isHeader && el.props.children === "Actions",
    ).length,
    0,
  );
  button(tree, "Edit").props.onClick();
  tree = render();
  assert.ok(rows(tree).every((row) => row.props.editing === true));
  assert.equal(
    elements(tree).find((el) => el.type === "@/components/common/PageRefresh")
      .props.disabled,
    true,
  );
  let [first, second] = rows(tree);
  first.props.onChange({
    ...first.props.draft,
    msg_en: "Changed {amount}",
    is_active: false,
  });
  second.props.onChange({ ...second.props.draft, msg_ur: "Urdu draft" });
  tree = render();
  assert.equal(
    calls.length,
    0,
    "Editing a status or text must not save automatically",
  );
  controls(tree).props.pagination.setPage(2);
  tree = render();
  const later = rows(tree)[0];
  later.props.onChange({ ...later.props.draft, msg_ar: "Arabic draft" });
  tree = render();
  controls(tree).props.pagination.setPage(1);
  tree = render();
  [first, second] = rows(tree);
  assert.equal(first.props.draft.msg_en, "Changed {amount}");
  assert.equal(second.props.draft.msg_ur, "Urdu draft");
  await first.props.onSave(first.props.message, first.props.draft);
  tree = render();
  [first, second] = rows(tree);
  assert.deepEqual(calls, [
    [
      { ...records[0], msg_en: "Changed {amount}", is_active: false },
      "test-token",
    ],
  ]);
  assert.equal(
    calls[0][0].msg_ar,
    null,
    "An untouched null translation must be preserved",
  );
  assert.equal(
    loads,
    1,
    "Saving one row must not reload or discard other drafts",
  );
  assert.equal(second.props.draft.msg_ur, "Urdu draft");
  await first.props.onSave(first.props.message, first.props.draft);
  assert.equal(calls.length, 1, "An unchanged row must not save twice");
  controls(tree).props.pagination.setPage(2);
  tree = render();
  assert.equal(rows(tree)[0].props.draft.msg_ar, "Arabic draft");
  button(tree, "Cancel editing").props.onClick();
  tree = render();
  assert.equal(rows(tree)[0].props.draft.msg_ar, "");
  controls(tree).props.pagination.setPage(1);
  tree = render();
  assert.equal(
    rows(tree)[0].props.draft.msg_en,
    "Changed {amount}",
    "Cancel must retain saved changes",
  );
  assert.equal(
    rows(tree)[1].props.draft.msg_ur,
    "Urdu original",
    "Cancel must discard unsaved changes",
  );
  assert.ok(rows(tree).every((row) => row.props.editing === false));
});

test("message rows are read-only until Edit and Save only changed text or status", async () => {
  const runtime = harness();
  const Row = runtime.load("src/components/messages/MessageRow.tsx").default;
  const Field = runtime.load(
    "src/components/messages/MessageTextField.tsx",
  ).default;
  const { messageDraft } = runtime.load(
    "src/components/messages/messageFields.ts",
  );
  const message = {
    message_key: "transfer.amount",
    msg_en: "Send {amount}",
    msg_ur: "Urdu",
    msg_ar: "Arabic",
    parameters: ["amount"],
    is_active: false,
  };
  const calls = [];
  const props = {
    message,
    draft: messageDraft(message),
    editing: false,
    saving: false,
    busy: false,
    onChange: (draft) => {
      props.draft = draft;
    },
    onSave: async (...args) => calls.push(args),
  };
  const render = () => runtime.render(Row, props);
  let tree = render();
  assert.equal(
    elements(tree).some((el) => el.type === Field),
    false,
  );
  assert.equal(button(tree, "Save"), undefined);
  props.editing = true;
  tree = render();
  assert.equal(elements(tree).filter((el) => el.type === Field).length, 3);
  assert.equal(button(tree, "Save").props.disabled, true);
  elements(tree)
    .find((el) => el.type === Field && el.props.field.key === "msg_en")
    .props.onChange("Updated {amount}");
  tree = render();
  assert.equal(button(tree, "Save").props.disabled, false);
  elements(tree)
    .find((el) => el.type === Field && el.props.field.key === "msg_en")
    .props.onChange("Send {amount}");
  tree = render();
  assert.equal(button(tree, "Save").props.disabled, true);
  elements(tree)
    .find((el) => el.type === "@/components/form/input/Switch")
    .props.onChange(true);
  tree = render();
  assert.equal(calls.length, 0);
  await button(tree, "Save").props.onClick();
  assert.deepEqual(calls, [
    [message, { ...messageDraft(message), is_active: true }],
  ]);
  props.busy = true;
  tree = render();
  assert.equal(button(tree, "Save").props.disabled, true);
  await button(tree, "Save").props.onClick();
  assert.equal(calls.length, 1);
});

test("failed inline message saves preserve the row draft and show a friendly retry message", async () => {
  const runtime = harness();
  const Row = runtime.load("src/components/messages/MessageRow.tsx").default;
  const { ApiError } = runtime.load("src/lib/api/client.ts");
  const { messageDraft } = runtime.load(
    "src/components/messages/messageFields.ts",
  );
  const message = { message_key: "greeting", msg_en: "Hello", is_active: true };
  const draft = { ...messageDraft(message), msg_en: "Welcome" };
  const props = {
    message,
    draft,
    editing: true,
    saving: false,
    busy: false,
    onChange() {},
    onSave: async () => {
      throw new ApiError("Please try again in a moment.", 500);
    },
  };
  let tree = runtime.render(Row, props);
  await button(tree, "Save").props.onClick();
  tree = runtime.render(Row, props);
  assert.equal(
    elements(tree).find((el) => el.props.role === "alert").props.children,
    "Please try again in a moment.",
  );
  assert.equal(props.draft.msg_en, "Welcome");
  assert.equal(button(tree, "Save").props.disabled, false);
});

test("message parameter insertion respects the cursor, selections, and surrounding words", () => {
  const runtime = harness();
  const { insertMessageParameter } = runtime.load(
    "src/components/messages/messageFields.ts",
  );
  assert.deepEqual(insertMessageParameter("Send", "amount"), {
    text: "Send {amount}",
    caret: 13,
  });
  assert.deepEqual(insertMessageParameter("Send here", "amount", 5, 9), {
    text: "Send {amount}",
    caret: 13,
  });
  assert.deepEqual(insertMessageParameter("Send now", "amount", 5, 5), {
    text: "Send {amount} now",
    caret: 13,
  });
  assert.deepEqual(insertMessageParameter("Send", "amount", 0, 0), {
    text: "{amount} Send",
    caret: 8,
  });
});

test("analytics range picker applies presets and validates custom From/To dates", () => {
  const runtime = harness();
  const Picker = runtime.load(
    "src/components/analytics/AnalyticsPeriodSelect.tsx",
  ).default;
  const presets = [],
    ranges = [];
  const props = {
    value: "allTime",
    onChange: (value) => presets.push(value),
    onCustomChange: (from, to) => ranges.push([from, to]),
  };
  const render = () => runtime.render(Picker, props);
  let tree = render();
  const trigger = (tree) =>
    elements(tree).find(
      (element) => element.props["aria-haspopup"] === "dialog",
    );
  trigger(tree).props.onClick();
  tree = render();
  assert.equal(trigger(tree).props["aria-expanded"], true);
  elements(tree)
    .find(
      (element) =>
        element.type === "button" &&
        element.props.children?.[0] === messages.analytics.design.yesterday,
    )
    .props.onClick();
  assert.deepEqual(presets, ["yesterday"]);
  tree = render();
  assert.equal(trigger(tree).props["aria-expanded"], false);
  trigger(tree).props.onClick();
  tree = render();
  elements(tree)
    .find(
      (element) =>
        element.type === "button" && element.props["aria-expanded"] === false,
    )
    .props.onClick();
  tree = render();
  byId(tree, "test-id-from").props.onChange("2020-02-20");
  byId(tree, "test-id-to").props.onChange("2020-02-10");
  tree = render();
  assert.equal(button(tree, messages.analytics.apply).props.disabled, true);
  elements(tree)
    .find((element) => element.type === "form")
    .props.onSubmit({ preventDefault() {} });
  assert.equal(ranges.length, 0);
  byId(tree, "test-id-to").props.onChange("2020-02-25");
  tree = render();
  assert.equal(button(tree, messages.analytics.apply).props.disabled, false);
  elements(tree)
    .find((element) => element.type === "form")
    .props.onSubmit({ preventDefault() {} });
  assert.deepEqual(ranges, [["2020-02-20", "2020-02-25"]]);
  tree = render();
  assert.equal(trigger(tree).props["aria-expanded"], false);
});

test("Audience and Dashboard share the same four KPI labels, order and real values", () => {
  const runtime = harness();
  const Cards = runtime.load(
    "src/components/common/AudienceKpiCards.tsx",
  ).default;
  const data = {
    total_users: 45,
    total_sessions: 3562,
    daily_active_users: 4,
    active_sessions: 5,
  };
  const cards = elements(runtime.render(Cards, { data })).filter(
    (element) => element.type === "@/components/dashboard/AnalyticsMetricCard",
  );
  assert.deepEqual(
    cards.map((card) => card.props.label),
    [
      messages.dashboardAnalytics.totalUsers,
      messages.dashboardAnalytics.totalSessions,
      messages.dashboardAnalytics.dailyActiveUsers,
      messages.dashboardAnalytics.activeSessions,
    ],
  );
  assert.deepEqual(
    cards.map((card) => card.props.value),
    ["45", "3,562", "4", "5"],
  );
  const { sectionMetrics } = runtime.load(
    "src/components/analytics/analyticsPresentation.ts",
  );
  assert.deepEqual(sectionMetrics.users, Object.keys(data));
  const missing = elements(runtime.render(Cards, { data: {} })).filter(
    (element) => element.type === "@/components/dashboard/AnalyticsMetricCard",
  );
  assert.ok(missing.every((card) => card.props.value === "0"));
});

test("numeric trends use real current and previous values without inventing missing percentages", () => {
  const runtime = harness();
  const { readMetricTrend, metricTrend } = runtime.load(
    "src/components/analytics/analyticsTrends.ts",
  );
  assert.equal(readMetricTrend({ count: 15, previous_count: 10 }).change, 50);
  assert.equal(readMetricTrend({ count: 5, previous_count: 10 }).change, -50);
  assert.equal(readMetricTrend({ count: 0, previous_count: 0 }).change, 0);
  assert.equal(
    readMetricTrend({ count: 5, previous_count: 0, direction: "up" }).change,
    null,
  );
  assert.equal(
    metricTrend(
      {
        returning_users: 10,
        audience_and_retention: [
          { field: "returning_users", previous_count: 8, direction: "up" },
        ],
      },
      "returning_users",
      ["audience_and_retention"],
    ).change,
    25,
  );
  const Badge = runtime.load(
    "src/components/analytics/MetricTrend.tsx",
  ).MetricTrendBadge;
  const missing = runtime.render(Badge, {
    trend: readMetricTrend({ direction: "up" }),
  });
  // Direction only: just the arrow, no invented percentage and no dash.
  assert.ok(elements(missing).some((element) => element.type === "svg"));
  assert.equal(
    elements(missing).some(
      (element) => element.props.title === messages.metricTrends.missing,
    ),
    false,
  );
  assert.equal(
    elements(missing).some(
      (element) => element.props.children === "Increasing",
    ),
    false,
  );
});

test("history graph selectors default to the last seven days", () => {
  for (const name of ["AnalyticsSafetyTrend", "AnalyticsReportedTrend"]) {
    const runtime = harness();
    const Chart = runtime.load(`src/components/analytics/${name}.tsx`).default;
    const tree = runtime.render(
      Chart,
      name === "AnalyticsSafetyTrend"
        ? { data: {} }
        : {
            title: "Response time",
            description: "",
            field: "end_to_end_latency_ms",
            source: [],
            series: [],
          },
    );
    assert.equal(tree.props.actions.props.value, "last7Days");
  }
});

test("analytics places the universal date filter next to refresh and expands conversation activity", async () => {
  const payload = {
    total_messages: 10,
    total_sessions: 2,
    total_user_messages: 4,
    total_assistant_messages: 6,
    peak_activity_hours: { 12: 2 },
    activity_by_day_of_week: { Monday: 2 },
  };
  const runtime = harness({
    "@/lib/api/analytics": { getAnalyticsSummary: async () => payload },
  });
  const Summary = runtime.load(
    "src/components/analytics/AnalyticsSummary.tsx",
  ).default;
  const props = {
    section: "chats",
    accessToken: "test-token",
    filters: {},
    navigation: React.createElement("nav"),
    filterControls: React.createElement(
      "button",
      { id: "universal-period" },
      "Last 7 days",
    ),
  };
  runtime.render(Summary, props);
  await runtime.runEffects();
  const tree = runtime.render(Summary, props);
  const header = React.Children.toArray(tree.props.children)[0];
  assert.equal(
    elements(tree).filter((element) => element.props.id === "universal-period")
      .length,
    1,
  );
  assert.ok(byId(header, "universal-period"));
  // The refresh control is icon-only; its name lives in the title.
  const refresh = elements(header).find(
    (element) => element.props.title === messages.analytics.refresh,
  );
  assert.ok(refresh);
  // Every filtered card sits in its own period scope (render-prop child).
  const scoped = (node) =>
    node?.type?.name === "AnalyticsCardScope"
      ? node.props.children(payload)
      : node;
  const activity = elements(tree)
    .filter((element) => element.type?.name === "AnalyticsCardScope")
    .map((element) => element.props.children(payload))
    .filter((element) => element?.type?.name === "AnalyticsBreakdown");
  assert.deepEqual(
    activity.map((element) => element.props.field),
    ["peak_activity_hours", "activity_by_day_of_week"],
  );
  const pair = elements(tree).find(
    (element) =>
      element.type === "div" &&
      React.Children.toArray(element.props.children).some(
        (child) => scoped(child)?.type?.name === "AnalyticsComposition",
      ),
  );
  assert.ok(pair);
  assert.ok(
    React.Children.toArray(pair.props.children).some(
      (child) => child.type?.name === "AnalyticsMetricList",
    ),
  );
});
