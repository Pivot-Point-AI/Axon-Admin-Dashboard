"use client";

import { useEffect, useState } from "react";

const canAnimate = () =>
  typeof window !== "undefined" &&
  Boolean(window.requestAnimationFrame) &&
  !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Eased 0 → 1 progress that restarts whenever `key` changes, for drawing
// canvas charts in. Without animation support it is simply 1.
export default function useReveal(key: string, duration = 1200) {
  const [state, setState] = useState({ key, progress: canAnimate() ? 0 : 1 });
  useEffect(() => {
    if (!canAnimate()) return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const linear = Math.min(1, (now - start) / duration);
      setState({ key, progress: 1 - (1 - linear) ** 3 });
      if (linear < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [key, duration]);
  return state.key === key ? state.progress : canAnimate() ? 0 : 1;
}
