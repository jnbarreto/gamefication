import { apiGet } from "./client";
import type { DashboardResponse } from "./types";

export function fetchDashboard(): Promise<DashboardResponse> {
  return apiGet<DashboardResponse>("/dashboard");
}
