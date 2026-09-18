import InvalidValueError from "../exception/InvalidValueError.js";

export const QuestType = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  NORMAL: "NORMAL",
  BOSS: "BOSS",
  STUDY: "STUDY",
  WORK: "WORK",
} as const;

export type QuestType = (typeof QuestType)[keyof typeof QuestType];

const VALUES = new Set<string>(Object.values(QuestType));

export function isQuestType(value: string): value is QuestType {
  return VALUES.has(value);
}

export function parseQuestType(value: string): QuestType {
  if (!isQuestType(value)) {
    throw new InvalidValueError(`Invalid quest type: ${value}`);
  }

  return value;
}

export const DAILY_QUEST_SOFT_LIMIT = 3;
