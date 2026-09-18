"use client";

import { useCallback, useEffect, useState } from "react";

// TEMPORARY: the backend only issues bearer tokens via /start-session and has
// no admin/staff login endpoint yet. Until that auth API is provided, the
// token used for bearer-protected calls (e.g. chat history) is entered
// manually here and kept in localStorage.
const STORAGE_KEY = "bankAssistant.manualAccessToken";

export function useAccessToken() {
  const [token, setTokenState] = useState<string>("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setTokenState(stored);
    } catch {
      // localStorage unavailable (e.g. private browsing) — ignore
    }
  }, []);

  const setToken = useCallback((value: string) => {
    setTokenState(value);
    try {
      if (value) {
        localStorage.setItem(STORAGE_KEY, value);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  return { token, setToken };
}
