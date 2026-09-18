import {
  MASTERY_XP_THRESHOLDS,
  MasteryLevel,
  masteryLevelFromXp,
} from "../enum/MasteryLevel.js";

const MASTERY_ORDER: MasteryLevel[] = [
  MasteryLevel.UNKNOWN,
  MasteryLevel.SUPERFICIAL,
  MasteryLevel.WITH_HELP,
  MasteryLevel.SOLO,
  MasteryLevel.TEACH,
];

export function calculateMasteryLevel(skillXp: number): MasteryLevel {
  return masteryLevelFromXp(skillXp);
}

export function xpToNextMasteryLevel(
  skillXp: number,
  masteryLevel: MasteryLevel,
): number | null {
  const currentIndex = MASTERY_ORDER.indexOf(masteryLevel);

  if (currentIndex === -1 || currentIndex === MASTERY_ORDER.length - 1) {
    return null;
  }

  const nextLevel = MASTERY_ORDER[currentIndex + 1];
  const nextThreshold = MASTERY_XP_THRESHOLDS[nextLevel];

  return Math.max(nextThreshold - skillXp, 0);
}

export function progressToNextMasteryLevel(
  skillXp: number,
  masteryLevel: MasteryLevel,
): number {
  const currentThreshold = MASTERY_XP_THRESHOLDS[masteryLevel];
  const remaining = xpToNextMasteryLevel(skillXp, masteryLevel);

  if (remaining === null) {
    return 1;
  }

  const nextIndex = MASTERY_ORDER.indexOf(masteryLevel) + 1;
  const nextThreshold = MASTERY_XP_THRESHOLDS[MASTERY_ORDER[nextIndex]];
  const span = nextThreshold - currentThreshold;

  if (span <= 0) {
    return 1;
  }

  return (skillXp - currentThreshold) / span;
}
