import InvalidValueError from "../exception/InvalidValueError.js";
import { XP_TIERS } from "../shared/XpAmount.js";

export const QuestDifficulty = {
  SMALL: "SMALL",
  MEDIUM: "MEDIUM",
  LARGE: "LARGE",
  BOSS: "BOSS",
} as const;

export type QuestDifficulty = (typeof QuestDifficulty)[keyof typeof QuestDifficulty];

const VALUES = new Set<string>(Object.values(QuestDifficulty));

export function isQuestDifficulty(value: string): value is QuestDifficulty {
  return VALUES.has(value);
}

export function parseQuestDifficulty(value: string): QuestDifficulty {
  if (!isQuestDifficulty(value)) {
    throw new InvalidValueError(`Invalid quest difficulty: ${value}`);
  }

  return value;
}

export function defaultXpForDifficulty(difficulty: QuestDifficulty): number {
  switch (difficulty) {
    case QuestDifficulty.SMALL:
      return XP_TIERS.SMALL;
    case QuestDifficulty.MEDIUM:
      return XP_TIERS.MEDIUM;
    case QuestDifficulty.LARGE:
      return XP_TIERS.LARGE;
    case QuestDifficulty.BOSS:
      return XP_TIERS.BOSS_MIN;
  }
}
