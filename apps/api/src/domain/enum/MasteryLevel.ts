import InvalidValueError from "../exception/InvalidValueError.js";

export const MasteryLevel = {
  UNKNOWN: "UNKNOWN",
  SUPERFICIAL: "SUPERFICIAL",
  WITH_HELP: "WITH_HELP",
  SOLO: "SOLO",
  TEACH: "TEACH",
} as const;

export type MasteryLevel = (typeof MasteryLevel)[keyof typeof MasteryLevel];

const VALUES = new Set<string>(Object.values(MasteryLevel));

export const MASTERY_XP_THRESHOLDS: Record<MasteryLevel, number> = {
  [MasteryLevel.UNKNOWN]: 0,
  [MasteryLevel.SUPERFICIAL]: 25,
  [MasteryLevel.WITH_HELP]: 75,
  [MasteryLevel.SOLO]: 200,
  [MasteryLevel.TEACH]: 500,
};

export function isMasteryLevel(value: string): value is MasteryLevel {
  return VALUES.has(value);
}

export function parseMasteryLevel(value: string): MasteryLevel {
  if (!isMasteryLevel(value)) {
    throw new InvalidValueError(`Invalid mastery level: ${value}`);
  }

  return value;
}

export function masteryLevelFromXp(skillXp: number): MasteryLevel {
  if (skillXp >= MASTERY_XP_THRESHOLDS[MasteryLevel.TEACH]) {
    return MasteryLevel.TEACH;
  }

  if (skillXp >= MASTERY_XP_THRESHOLDS[MasteryLevel.SOLO]) {
    return MasteryLevel.SOLO;
  }

  if (skillXp >= MASTERY_XP_THRESHOLDS[MasteryLevel.WITH_HELP]) {
    return MasteryLevel.WITH_HELP;
  }

  if (skillXp >= MASTERY_XP_THRESHOLDS[MasteryLevel.SUPERFICIAL]) {
    return MasteryLevel.SUPERFICIAL;
  }

  return MasteryLevel.UNKNOWN;
}
