export function cumulativeXpForLevel(level: number): number {
  if (level <= 1) {
    return 0;
  }

  return (level * (level - 1) * 100) / 2;
}

export function levelFromTotalXp(totalXp: number): number {
  if (totalXp < 0) {
    return 1;
  }

  let level = 1;

  while (totalXp >= cumulativeXpForLevel(level + 1)) {
    level += 1;
  }

  return level;
}

export function xpToNextLevel(totalXp: number, level: number): number {
  return cumulativeXpForLevel(level + 1) - totalXp;
}

export function progressToNextLevel(totalXp: number, level: number): number {
  const currentThreshold = cumulativeXpForLevel(level);
  const nextThreshold = cumulativeXpForLevel(level + 1);
  const span = nextThreshold - currentThreshold;

  if (span <= 0) {
    return 1;
  }

  return (totalXp - currentThreshold) / span;
}
