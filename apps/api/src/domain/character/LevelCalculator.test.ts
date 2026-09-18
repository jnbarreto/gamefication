import {
  cumulativeXpForLevel,
  levelFromTotalXp,
  progressToNextLevel,
  xpToNextLevel,
} from "./LevelCalculator.js";

describe("LevelCalculator", () => {
  it("uses cumulative thresholds from AD-018", () => {
    expect(cumulativeXpForLevel(1)).toBe(0);
    expect(cumulativeXpForLevel(2)).toBe(100);
    expect(cumulativeXpForLevel(3)).toBe(300);
    expect(cumulativeXpForLevel(4)).toBe(600);
  });

  it("derives level from total XP", () => {
    expect(levelFromTotalXp(0)).toBe(1);
    expect(levelFromTotalXp(99)).toBe(1);
    expect(levelFromTotalXp(100)).toBe(2);
    expect(levelFromTotalXp(299)).toBe(2);
    expect(levelFromTotalXp(300)).toBe(3);
  });

  it("calculates progress to next level", () => {
    expect(xpToNextLevel(50, 1)).toBe(50);
    expect(progressToNextLevel(50, 1)).toBe(0.5);
    expect(progressToNextLevel(100, 2)).toBe(0);
  });
});
