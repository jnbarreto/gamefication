export const QUEST_TYPES = [
  "DAILY",
  "WEEKLY",
  "NORMAL",
  "BOSS",
  "STUDY",
  "WORK",
] as const;

export const QUEST_DIFFICULTIES = ["SMALL", "MEDIUM", "LARGE", "BOSS"] as const;

export const QUEST_STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

export const XP_BY_DIFFICULTY: Record<(typeof QUEST_DIFFICULTIES)[number], number> = {
  SMALL: 10,
  MEDIUM: 25,
  LARGE: 50,
  BOSS: 100,
};
