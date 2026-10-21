"use client";

import { useEffect, useRef, type CanvasHTMLAttributes } from "react";

export interface AnalyticsCanvasFrame {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  color: (token: string) => string;
  dark: boolean;
  rtl: boolean;
  font: string;
}

interface AnalyticsChartCanvasProps extends CanvasHTMLAttributes<HTMLCanvasElement> {
  draw: (frame: AnalyticsCanvasFrame) => void;
}

export default function AnalyticsChartCanvas({
  draw,
  ...props
}: AnalyticsChartCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let disposed = false;
    const paint = () => {
      if (disposed) return;
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const style = getComputedStyle(canvas);
      const root = getComputedStyle(document.documentElement);
      draw({
        ctx,
        width,
        height,
        color: (token) => root.getPropertyValue(`--color-${token}`).trim(),
        dark: document.documentElement.classList.contains("dark"),
        rtl: style.direction === "rtl",
        font: style.fontFamily,
      });
    };
    const resize = new ResizeObserver(paint);
    const theme = new MutationObserver(paint);
    resize.observe(canvas);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "dir", "style"],
    });
    document.fonts.ready.then(paint);
    window.addEventListener("resize", paint);
    paint();
    return () => {
      disposed = true;
      resize.disconnect();
      theme.disconnect();
      window.removeEventListener("resize", paint);
    };
  }, [draw]);

  return <canvas ref={ref} role="img" {...props} />;
}
