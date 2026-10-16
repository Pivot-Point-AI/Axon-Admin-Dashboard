"use client";

import { useState } from "react";

export interface PaginationControls {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  start: number;
  end: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export default function usePagination<T>(
  items: readonly T[],
  resetKey = "",
  initialPageSize = 10,
  followLatest = false,
) {
  const [state, setState] = useState({
    page: 1,
    pageSize: initialPageSize,
    resetKey,
  });
  const pageCount = Math.max(1, Math.ceil(items.length / state.pageSize));
  const page = followLatest
    ? pageCount
    : state.resetKey === resetKey
      ? Math.min(state.page, pageCount)
      : 1;
  // Keep the stored page in sync when filters change or rows are removed.
  if (state.resetKey !== resetKey || state.page !== page) {
    setState({ ...state, resetKey, page });
  }
  const offset = (page - 1) * state.pageSize;

  return {
    items: items.slice(offset, offset + state.pageSize),
    page,
    pageSize: state.pageSize,
    pageCount,
    total: items.length,
    start: items.length ? offset + 1 : 0,
    end: Math.min(offset + state.pageSize, items.length),
    setPage: (next: number) =>
      setState((previous) => ({
        ...previous,
        resetKey,
        page: Math.max(1, Math.min(next, pageCount)),
      })),
    setPageSize: (size: number) =>
      setState({
        page: 1,
        pageSize: Math.max(1, size),
        resetKey,
      }),
  };
}
