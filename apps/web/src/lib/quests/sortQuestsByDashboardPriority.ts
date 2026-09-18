import type { QuestResponse } from "@/lib/api/types";

const QUEST_TYPE_PRIORITY: Record<string, number> = {
  BOSS: 0,
  DAILY: 1,
  WEEKLY: 2,
  WORK: 3,
  NORMAL: 4,
  STUDY: 5,
};

const QUEST_STATUS_PRIORITY: Record<string, number> = {
  IN_PROGRESS: 0,
  TODO: 1,
  COMPLETED: 2,
  CANCELLED: 3,
};

export function sortQuestsByDashboardPriority(
  quests: QuestResponse[],
): QuestResponse[] {
  return [...quests].sort((left, right) => {
    const typeDiff =
      (QUEST_TYPE_PRIORITY[left.type] ?? 99) -
      (QUEST_TYPE_PRIORITY[right.type] ?? 99);

    if (typeDiff !== 0) {
      return typeDiff;
    }

    const statusDiff =
      (QUEST_STATUS_PRIORITY[left.status] ?? 99) -
      (QUEST_STATUS_PRIORITY[right.status] ?? 99);

    if (statusDiff !== 0) {
      return statusDiff;
    }

    return left.title.localeCompare(right.title, undefined, { sensitivity: "base" });
  });
}
