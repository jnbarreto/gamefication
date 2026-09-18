export const MASTERY_LEVELS = [
  "UNKNOWN",
  "SUPERFICIAL",
  "WITH_HELP",
  "SOLO",
  "TEACH",
] as const;

export type MasteryLevel = (typeof MASTERY_LEVELS)[number];

export const MASTERY_XP_THRESHOLDS: Record<MasteryLevel, number> = {
  UNKNOWN: 0,
  SUPERFICIAL: 25,
  WITH_HELP: 75,
  SOLO: 200,
  TEACH: 500,
};

export function xpToNextMasteryLevel(
  skillXp: number,
  masteryLevel: string,
): number | null {
  const currentIndex = MASTERY_LEVELS.indexOf(masteryLevel as MasteryLevel);

  if (currentIndex === -1 || currentIndex === MASTERY_LEVELS.length - 1) {
    return null;
  }

  const nextLevel = MASTERY_LEVELS[currentIndex + 1]!;
  const nextThreshold = MASTERY_XP_THRESHOLDS[nextLevel];

  return Math.max(nextThreshold - skillXp, 0);
}

export function progressToNextMasteryLevel(
  skillXp: number,
  masteryLevel: string,
): number {
  const level = masteryLevel as MasteryLevel;
  const currentThreshold = MASTERY_XP_THRESHOLDS[level] ?? 0;
  const remaining = xpToNextMasteryLevel(skillXp, masteryLevel);

  if (remaining === null) {
    return 1;
  }

  const currentIndex = MASTERY_LEVELS.indexOf(level);

  if (currentIndex === -1 || currentIndex === MASTERY_LEVELS.length - 1) {
    return 1;
  }

  const nextLevel = MASTERY_LEVELS[currentIndex + 1]!;
  const nextThreshold = MASTERY_XP_THRESHOLDS[nextLevel];
  const span = nextThreshold - currentThreshold;

  if (span <= 0) {
    return 1;
  }

  return (skillXp - currentThreshold) / span;
}
