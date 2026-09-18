import type { QuestResponse } from "@/lib/api/types";

export function allQuestMissionsCompleted(quest: QuestResponse): boolean {
  return quest.missions.length === 0 || quest.missions.every((mission) => mission.isCompleted);
}

export function completedMissionCount(quest: QuestResponse): number {
  return quest.missions.filter((mission) => mission.isCompleted).length;
}
