"use client";

import { useState } from "react";

export function isMissingRequired(value: unknown): boolean {
  return value == null || (typeof value === "string" && !value.trim());
}

export default function useRequiredFields() {
  const [attempted, setAttempted] = useState(false);

  return {
    validate(values: unknown[]) {
      setAttempted(true);
      return !values.some(isMissingRequired);
    },
    invalid: (value: unknown) => attempted && isMissingRequired(value),
    reset: () => setAttempted(false),
  };
}
