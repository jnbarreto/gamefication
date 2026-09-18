import { apiGet, apiPost } from "./client";
import type { AchievementListResponse, UnlockAchievementResponse } from "./types";

export type UnlockAchievementEvidence = {
  type: string;
  value: string;
  description?: string | null;
};

export function fetchAchievements(): Promise<AchievementListResponse> {
  return apiGet<AchievementListResponse>("/achievements");
}

export function unlockAchievement(
  slug: string,
  evidence?: UnlockAchievementEvidence,
): Promise<UnlockAchievementResponse> {
  return apiPost<UnlockAchievementResponse>(
    `/achievements/${slug}/unlock`,
    evidence ? { evidence } : {},
  );
}
