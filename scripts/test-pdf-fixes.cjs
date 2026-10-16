const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const test = require("node:test");
const ts = require("typescript");
const notifications = [];
const cache = new Map();
function load(relative) {
  const filename = path.resolve(__dirname, "..", relative);
  if (cache.has(filename)) return cache.get(filename).exports;
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const module = { exports: {} };
  cache.set(filename, module);
  const localRequire = (name) => {
    if (name === "@/lib/feedback")
      return { notify: (detail) => notifications.push(detail) };
    if (name === "next-intl") return { useTranslations: () => (key) => key };
    if (name === "@/icons") {
      return { TableIcon: () => null, ChevronDownIcon: () => null };
    }
    if (name.startsWith("@/") || name.startsWith(".")) {
      const stem = name.startsWith("@/")
        ? path.resolve(__dirname, "../src", name.slice(2))
        : path.resolve(path.dirname(filename), name);
      const candidate = [".ts", ".tsx", "/index.ts"]
        .map((ext) => stem + ext)
        .find(fs.existsSync);
      if (candidate)
        return load(path.relative(path.resolve(__dirname, ".."), candidate));
    }
    return require(name);
  };
  new Function("require", "module", "exports", output)(
    localRequire,
    module,
    module.exports,
  );
  return module.exports;
}

test("serialized false does not enable master data switches", () => {
  const { asBoolean } = load("src/utils/boolean.ts");
  for (const value of [false, 0, "false", "False", "0", "no", "off", ""])
    assert.equal(asBoolean(value), false);
  for (const value of [true, 1, "true", "TRUE", "1", "yes", "on"])
    assert.equal(asBoolean(value), true);
  assert.equal(asBoolean(undefined, true), true);
});

test("bounded log requests, inactive bank updates, and error notifications", async () => {
  const { getLogHistory } = load("src/lib/api/logs.ts");
  const { updateBank } = load("src/lib/api/masterData.ts");
  const { apiRequest, ApiError } = load("src/lib/api/client.ts");
  const originalFetch = global.fetch;
  const requests = [];
  global.fetch = async (url, init) => {
    requests.push({ url, init });
    return new Response(JSON.stringify({ lines: [] }), {
      headers: { "content-type": "application/json" },
    });
  };
  try {
    await getLogHistory(
      {
        startDate: "2026-10-01",
        endDate: "2026-10-16",
        limit: 50,
        sessionId: "session & one",
      },
      "test-token",
    );
    const query = new URL(requests[0].url, "http://localhost").searchParams;
    assert.equal(query.get("limit"), "50");
    assert.equal(query.get("session_id"), "session & one");
    assert.equal(query.get("start_date"), "2026-10-01");
    await updateBank(
      7,
      { bank_name: "Test bank", is_active: false },
      "test-token",
    );
    assert.equal(requests[1].init.method, "PUT");
    assert.equal(JSON.parse(requests[1].init.body).is_active, false);
    assert.equal(notifications.at(-1).kind, "success");
    global.fetch = async () =>
      new Response(JSON.stringify({ detail: "Update rejected" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      });
    await assert.rejects(
      apiRequest("/test", { method: "PUT", body: { is_active: false } }),
      (error) => error instanceof ApiError && error.status === 403,
    );
    assert.equal(notifications.at(-1).kind, "error");
    assert.equal(notifications.at(-1).message, "Update rejected");
  } finally {
    global.fetch = originalFetch;
  }
});

test("raw log rendering escapes untrusted markup", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const RawLogViewer = load("src/components/logs/RawLogViewer.tsx").default;
  const html = renderToStaticMarkup(
    React.createElement(RawLogViewer, {
      entries: [
        {
          id: 1,
          data: {
            level: "info",
            event: "<script>unsafe()</script>",
            is_active: false,
          },
          text: "",
        },
      ],
    }),
  );
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("false"));
});

test("shared icons retain paint when consumers override className", () => {
  const { transform } = require("@svgr/core");
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  for (const name of [
    "close",
    "lock",
    "pencil",
    "trash",
    "time",
    "plus",
    "copy",
    "sun",
    "moon",
    "globe",
  ]) {
    const svg = fs.readFileSync(
      path.resolve(__dirname, `../src/icons/${name}.svg`),
      "utf8",
    );
    const jsx = transform.sync(
      svg,
      { plugins: ["@svgr/plugin-jsx"], jsxRuntime: "automatic" },
      { componentName: "TestIcon" },
    );
    const output = ts.transpileModule(jsx, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const module = { exports: {} };
    new Function("require", "module", "exports", output)(
      require,
      module,
      module.exports,
    );
    const html = renderToStaticMarkup(
      React.createElement(module.exports.default, {
        className: "size-5 text-brand-500",
      }),
    );
    assert.ok(html.includes("viewBox="), `${name} needs a scalable viewBox`);
    assert.ok(
      html.includes('fill="currentColor"') ||
        html.includes('stroke="currentColor"'),
      `${name} must inherit its button color`,
    );
    assert.ok(!html.includes('fill=""'), `${name} must not have empty paint`);
    assert.ok(
      html.includes('class="size-5 text-brand-500"'),
      `${name} must accept sizing classes`,
    );
  }
});

test("master-data updates resolve real record IDs without guessing from names", () => {
  const { recordId, asRecordArray } = load("src/lib/api/normalize.ts");
  const [bank] = asRecordArray({
    banks: [{ id: 17, bank_name: "Al Baraka Bank" }],
  });
  assert.equal(recordId(bank, "bank_id"), 17);
  assert.equal(recordId({ bank_id: "21" }, "bank_id"), 21);
  assert.equal(recordId({ bankId: 25 }, "bank_id"), 25);
  assert.equal(recordId({ biller_id: 31 }, "biller_id"), 31);
  for (const value of [
    null,
    undefined,
    "",
    "  ",
    false,
    true,
    "not-an-id",
    1.5,
    Infinity,
  ]) {
    assert.equal(
      recordId({ bank_id: value, bank_name: "Al Baraka Bank" }, "bank_id"),
      null,
    );
  }
  assert.equal(recordId({ bank_name: "Al Baraka Bank" }, "bank_id"), null);
  assert.equal(recordId({ bank_id: 42, id: 99 }, "bank_id"), 42);
});

test("bank edit submits the selected record ID even after its name changes", async () => {
  const { recordId } = load("src/lib/api/normalize.ts");
  const { updateBank } = load("src/lib/api/masterData.ts");
  const originalFetch = global.fetch;
  let request;
  global.fetch = async (url, init) => {
    request = { url, init };
    return new Response("{}", {
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const selected = { id: "17", bank_name: "Al Baraka Bank", is_active: true };
    await updateBank(
      recordId(selected, "bank_id"),
      { bank_name: "Al Baraka Bank Updated", is_active: false },
      "test-token",
    );
    assert.ok(
      new URL(request.url, "http://localhost").pathname.endsWith(
        "/master-data/banks/17",
      ),
    );
    assert.equal(request.init.method, "PUT");
    assert.deepEqual(JSON.parse(request.init.body), {
      bank_name: "Al Baraka Bank Updated",
      is_active: false,
    });
  } finally {
    global.fetch = originalFetch;
  }
});
