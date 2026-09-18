import InvalidValueError from "../exception/InvalidValueError.js";

export const QuestStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type QuestStatus = (typeof QuestStatus)[keyof typeof QuestStatus];

const VALUES = new Set<string>(Object.values(QuestStatus));

export function isQuestStatus(value: string): value is QuestStatus {
  return VALUES.has(value);
}

export function parseQuestStatus(value: string): QuestStatus {
  if (!isQuestStatus(value)) {
    throw new InvalidValueError(`Invalid quest status: ${value}`);
  }

  return value;
}

export const QUEST_STATUS_TRANSITIONS: Record<QuestStatus, QuestStatus[]> = {
  [QuestStatus.TODO]: [QuestStatus.IN_PROGRESS, QuestStatus.CANCELLED],
  [QuestStatus.IN_PROGRESS]: [QuestStatus.COMPLETED, QuestStatus.CANCELLED],
  [QuestStatus.COMPLETED]: [QuestStatus.TODO],
  [QuestStatus.CANCELLED]: [QuestStatus.TODO],
};

export function canTransitionQuestStatus(from: QuestStatus, to: QuestStatus): boolean {
  return QUEST_STATUS_TRANSITIONS[from].includes(to);
}
