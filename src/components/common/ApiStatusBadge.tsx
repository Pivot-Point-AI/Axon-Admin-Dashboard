"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import { ADMIN_API_BASE_URL } from "@/lib/api/client";
import { getHealth } from "@/lib/api/health";

type Status = "checking" | "online" | "degraded" | "offline";

export default function ApiStatusBadge() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const controller = new AbortController();

    getHealth(controller.signal)
      .then(() => setStatus("online"))
      .catch(() => {
        // The /health endpoint itself is currently broken server-side
        // (returns a 500). Fall back to the admin API so a backend bug in
        // /health doesn't make the whole API look down. A 401 here still
        // proves the server is reachable — it just means we're not
        // authenticated for this probe, which is expected.
        fetch(`${ADMIN_API_BASE_URL}/institutions?limit=1`, {
          signal: controller.signal,
        })
          .then((res) =>
            setStatus(res.ok || res.status === 401 ? "degraded" : "offline"),
          )
          .catch(() => setStatus("offline"));
      });

    return () => controller.abort();
  }, []);

  if (status === "checking") {
    return <Badge color="light">Checking API…</Badge>;
  }
  if (status === "online") {
    return <Badge color="success">API Online</Badge>;
  }
  if (status === "degraded") {
    return (
      <span title="/health returns a server error, but the API itself is responding.">
        <Badge color="warning">API Online (health check broken)</Badge>
      </span>
    );
  }
  return <Badge color="error">API Unreachable</Badge>;
}
