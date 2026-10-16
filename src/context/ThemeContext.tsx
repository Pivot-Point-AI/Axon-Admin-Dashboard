"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
type ThemeMode = "light" | "dark" | "auto";
type Theme = "light" | "dark";
type ThemeContextType = {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const isMode = (value: string | null): value is ThemeMode =>
  value === "light" || value === "dark" || value === "auto";
function applyTheme(mode: ThemeMode): Theme {
  const resolved =
    mode === "auto"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : mode;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.colorScheme = resolved;
  document.documentElement.style.colorScheme = resolved;
  return resolved;
}
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeMode, setMode] = useState<ThemeMode>("light");
  const [theme, setTheme] = useState<Theme>("light");
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved =
        localStorage.getItem("theme-mode") || localStorage.getItem("theme");
    } catch {
      /* Storage may be unavailable in private mode. */
    }
    const mode = isMode(saved) ? saved : "light";
    setMode(mode);
    setTheme(applyTheme(mode));
    setInitialized(true);
  }, []);
  useEffect(() => {
    if (!initialized) return;
    setTheme(applyTheme(themeMode));
    if (themeMode !== "auto") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setTheme(applyTheme("auto"));
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [initialized, themeMode]);
  const setThemeMode = (mode: ThemeMode) => {
    setMode(mode);
    setTheme(applyTheme(mode));
    try {
      localStorage.setItem("theme-mode", mode);
    } catch {
      /* Theme still works without storage. */
    }
  };
  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        setThemeMode,
        toggleTheme: () => setThemeMode(theme === "dark" ? "light" : "dark"),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
