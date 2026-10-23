"use client";

import AudienceKpiCards from "@/components/common/AudienceKpiCards";
import type { DashboardOverviewResponse } from "@/lib/api/types";

interface AnalyticsKpiCardsProps {
  overview: DashboardOverviewResponse | null;
}

export default function AnalyticsKpiCards({
  overview,
}: AnalyticsKpiCardsProps) {
  return <AudienceKpiCards data={overview} />;
}
