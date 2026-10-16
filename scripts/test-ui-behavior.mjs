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
    useEffect() {},
    useLayoutEffect() {},
    useCallback: (fn) => fn,
    useRef: (value) => ({ current: value }),
    useId: () => "test-id",
  };
  function load(relative) {
    const filename = path.resolve(__dirname, "..", relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
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
          useTranslations:
            (namespace) =>
            (key, values = {}) => {
              const text =
                key
                  .split(".")
                  .reduce(
                    (value, part) => value?.[part],
                    messages[namespace],
                  ) ?? key;
              return text.replace(/\{(\w+)\}/g, (_, part) => values[part]);
            },
        };
      if (name.startsWith("@/icons"))
        return new Proxy(
          { __esModule: true },
          { get: (_, key) => (key === "__esModule" ? true : "svg") },
        );
      if (name === "@/context/AdminAuthContext")
        return { useAdminAuth: () => ({ accessToken: "test-token" }) };
      if (name === "@/context/FeedbackContext")
        return { useConfirm: () => async () => true };
      if (name === "@/lib/feedback")
        return {
          notify: () =>
            assert.fail("Local validation must not notify globally"),
        };
      if (name.startsWith("@/components/"))
        return new Proxy(
          { __esModule: true, default: name },
          { get: (value, key) => value[key] ?? String(key) },
        );
      if (name.startsWith("@/") || name.startsWith(".")) {
        const stem = name.startsWith("@/")
          ? path.resolve(__dirname, "../src", name.slice(2))
          : path.resolve(path.dirname(filename), name);
        const target = [".ts", ".tsx", "/index.ts", "/index.tsx"]
          .map((extension) => stem + extension)
          .find(fs.existsSync);
        if (target)
          return load(path.relative(path.resolve(__dirname, ".."), target));
      }
      return loadDependency(name);
    }
    new Function("require", "module", "exports", output)(
      localRequire,
      loadedModule,
      loadedModule.exports,
    );
    return loadedModule.exports;
  }
  return {
    load,
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
  page.setPageSize(25);
  page = render();
  assert.deepEqual([page.page, page.pageSize, page.items.length], [1, 25, 20]);
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
