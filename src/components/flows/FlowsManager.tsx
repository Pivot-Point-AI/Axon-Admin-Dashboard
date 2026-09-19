"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ApiError } from "@/lib/api/client";
import { getFlows, updateFlow } from "@/lib/api/flows";
import { asRecordArray } from "@/lib/api/normalize";

export default function FlowsManager() {
  const { accessToken } = useAdminAuth();
  const [flows, setFlows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyIntent, setBusyIntent] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getFlows(accessToken);
      setFlows(asRecordArray(data));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load flows.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (flow: Record<string, unknown>, enabled: boolean) => {
    if (!accessToken) return;
    const intentName = String(flow.intent_name ?? "");
    if (!intentName) return;
    setBusyIntent(intentName);
    try {
      await updateFlow(
        { intent_name: intentName, is_enabled: enabled },
        accessToken,
      );
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update flow.");
    } finally {
      setBusyIntent(null);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-7">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Conversation Flows
        </h3>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error-500 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Intent
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Enabled
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  Loading flows…
                </TableCell>
              </TableRow>
            ) : flows.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  No flows found.
                </TableCell>
              </TableRow>
            ) : (
              flows.map((flow, index) => {
                const intentName = String(flow.intent_name ?? index);
                return (
                  <TableRow key={intentName}>
                    <TableCell className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                      {intentName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm">
                      <Checkbox
                        checked={Boolean(flow.is_enabled ?? true)}
                        disabled={busyIntent === intentName}
                        onChange={(checked) => handleToggle(flow, checked)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
