"use client";

import { useLayoutEffect, useRef } from "react";

const pattern = /^([^\d]*)(\d{1,3}(?:,\d{3})*|\d+)(\.\d+)?(.*)$/;

function parse(text: string) {
  const match = text.match(pattern);
  if (!match) return null;
  const decimals = match[3] ? match[3].length - 1 : 0;
  return {
    prefix: match[1],
    suffix: match[4],
    decimals,
    value: Number(`${match[2].replaceAll(",", "")}${match[3] ?? ""}`),
    grouped: match[2].includes(","),
  };
}

// Counts an already-formatted figure ("3,594", "54.16%") up to its value.
// The final text is always the one passed in, so behaviour never changes:
// anything that isn't a plain ASCII number is shown as is.
export default function CountUpText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef<number | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    const parsed = parse(text);
    if (
      !element ||
      !parsed ||
      typeof window === "undefined" ||
      !window.requestAnimationFrame ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      previous.current = parsed?.value ?? null;
      return;
    }
    // `previous` only advances once a count finishes, so React's dev-mode
    // double effect run (mount, cleanup, mount) still starts from zero.
    const from = previous.current ?? 0;
    if (from === parsed.value) return;
    const render = (value: number) =>
      `${parsed.prefix}${value.toLocaleString("en-US", {
        minimumFractionDigits: parsed.decimals,
        maximumFractionDigits: parsed.decimals,
        useGrouping: parsed.grouped,
      })}${parsed.suffix}`;
    const duration = 1600;
    const start = performance.now();
    let frame = 0;
    element.textContent = render(from);
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 4;
      element.textContent =
        progress < 1 ? render(from + (parsed.value - from) * eased) : text;
      if (progress < 1) frame = requestAnimationFrame(tick);
      else previous.current = parsed.value;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      element.textContent = text;
    };
  }, [text]);

  return <span ref={ref}>{text}</span>;
}
