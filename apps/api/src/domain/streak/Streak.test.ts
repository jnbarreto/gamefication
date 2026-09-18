import {
  STREAK_MILESTONES,
  previousCalendarDay,
  xpBonusForMilestone,
} from "./StreakMilestones.js";
import Streak from "./Streak.js";

const characterId = "550e8400-e29b-41d4-a716-446655440000";

describe("StreakMilestones", () => {
  it("maps milestone days to bonus XP", () => {
    expect(xpBonusForMilestone(3)).toBe(10);
    expect(xpBonusForMilestone(30)).toBe(200);
    expect(STREAK_MILESTONES[7]).toBe(30);
  });

  it("calculates previous calendar day", () => {
    expect(previousCalendarDay("2026-09-14")).toBe("2026-09-13");
  });
});

describe("Streak", () => {
  it("starts with zero streak", () => {
    const streak = Streak.create({ characterId });

    expect(streak.getCurrentCount()).toBe(0);
    expect(streak.getBestCount()).toBe(0);
    expect(streak.getLastActivityDay()).toBeNull();
  });

  it("records first activity as day 1", () => {
    const streak = Streak.create({ characterId });

    const result = streak.recordActivity("2026-09-14");

    expect(result.incremented).toBe(true);
    expect(result.reset).toBe(false);
    expect(streak.getCurrentCount()).toBe(1);
    expect(streak.getBestCount()).toBe(1);
    expect(result.bonuses).toEqual([]);
  });

  it("does not increment twice on the same calendar day", () => {
    const streak = Streak.create({ characterId });

    streak.recordActivity("2026-09-14");
    const result = streak.recordActivity("2026-09-14");

    expect(result.incremented).toBe(false);
    expect(streak.getCurrentCount()).toBe(1);
  });

  it("increments on consecutive days", () => {
    const streak = Streak.create({ characterId });

    streak.recordActivity("2026-09-13");
    const result = streak.recordActivity("2026-09-14");

    expect(result.incremented).toBe(true);
    expect(result.reset).toBe(false);
    expect(streak.getCurrentCount()).toBe(2);
  });

  it("resets streak after a gap and clears claimed bonuses", () => {
    const streak = Streak.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440001",
      characterId,
      currentCount: 7,
      bestCount: 7,
      lastActivityDay: "2026-09-10",
      bonusesClaimed: [3, 7],
      createdAt: new Date("2026-09-01T00:00:00.000Z"),
      updatedAt: new Date("2026-09-10T00:00:00.000Z"),
    });

    const result = streak.recordActivity("2026-09-14");

    expect(result.reset).toBe(true);
    expect(streak.getCurrentCount()).toBe(1);
    expect(streak.getBestCount()).toBe(7);
    expect(streak.getBonusesClaimed()).toEqual([]);
  });

  it("awards milestone bonus once per streak cycle", () => {
    const streak = Streak.create({ characterId });

    streak.recordActivity("2026-09-12");
    streak.recordActivity("2026-09-13");
    const dayThree = streak.recordActivity("2026-09-14");

    expect(dayThree.bonuses).toEqual([{ milestoneDays: 3, xp: 10 }]);
    expect(streak.getBonusesClaimed()).toEqual([3]);

    const duplicate = streak.recordActivity("2026-09-14");
    expect(duplicate.bonuses).toEqual([]);
  });

  it("can award milestone again after streak reset", () => {
    const streak = Streak.create({ characterId });

    streak.recordActivity("2026-09-12");
    streak.recordActivity("2026-09-13");
    streak.recordActivity("2026-09-14");

    streak.recordActivity("2026-09-20");
    streak.recordActivity("2026-09-21");
    const result = streak.recordActivity("2026-09-22");

    expect(result.bonuses).toEqual([{ milestoneDays: 3, xp: 10 }]);
  });

  it("rebuilds from persistence", () => {
    const streak = Streak.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440002",
      characterId,
      currentCount: 5,
      bestCount: 10,
      lastActivityDay: "2026-09-14",
      bonusesClaimed: [3],
      createdAt: new Date("2026-09-01T00:00:00.000Z"),
      updatedAt: new Date("2026-09-14T00:00:00.000Z"),
    });

    expect(streak.getCurrentCount()).toBe(5);
    expect(streak.getBestCount()).toBe(10);
    expect(streak.getBonusesClaimed()).toEqual([3]);
  });
});
