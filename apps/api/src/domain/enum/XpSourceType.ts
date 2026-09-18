import InvalidValueError from "../exception/InvalidValueError.js";

export const XpSourceType = {
  QUEST: "QUEST",
  STREAK_BONUS: "STREAK_BONUS",
  ACHIEVEMENT: "ACHIEVEMENT",
  MANUAL: "MANUAL",
} as const;

export type XpSourceType = (typeof XpSourceType)[keyof typeof XpSourceType];

const VALUES = new Set<string>(Object.values(XpSourceType));

export function isXpSourceType(value: string): value is XpSourceType {
  return VALUES.has(value);
}

export function parseXpSourceType(value: string): XpSourceType {
  if (!isXpSourceType(value)) {
    throw new InvalidValueError(`Invalid XP source type: ${value}`);
  }

  return value;
}
