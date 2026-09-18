import Achievement from "../../domain/achievement/Achievement.js";
import AchievementUnlock from "../../domain/achievement/AchievementUnlock.js";
import {
  presentAchievement,
  presentAchievementList,
  presentUnlockAchievementResult,
} from "./AchievementPresenter.js";
import Character from "../../domain/character/Character.js";
import XpTransaction from "../../domain/xp/XpTransaction.js";

const achievement = Achievement.rebuild({
  id: "550e8400-e29b-41d4-a716-446655440010",
  slug: "first-pr",
  name: "First Pull Request",
  description: "Open your first pull request with evidence.",
  category: "Backend",
  rewardXp: 25,
  conditionType: "MANUAL",
});

describe("AchievementPresenter", () => {
  it("maps locked and unlocked achievements", () => {
    const unlock = AchievementUnlock.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440011",
      characterId: "550e8400-e29b-41d4-a716-446655440000",
      achievementId: achievement.getId().toString(),
      unlockedAt: new Date("2026-09-14T12:00:00.000Z"),
      evidenceId: null,
    });

    expect(presentAchievement(achievement, null)).toEqual(
      expect.objectContaining({
        slug: "first-pr",
        unlocked: false,
        unlockedAt: null,
      }),
    );
    expect(presentAchievement(achievement, unlock)).toEqual(
      expect.objectContaining({
        unlocked: true,
        unlockedAt: "2026-09-14T12:00:00.000Z",
      }),
    );
  });

  it("maps achievement collections and unlock results", () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const unlock = AchievementUnlock.create({
      characterId: character.getId().toString(),
      achievementId: achievement.getId().toString(),
    });
    const xpTransaction = XpTransaction.createFromAchievement({
      characterId: character.getId().toString(),
      achievementUnlockId: unlock.getId().toString(),
      amount: 25,
      description: "Achievement unlocked: First Pull Request",
    });

    expect(
      presentAchievementList([{ achievement, unlock: null }]).achievements,
    ).toHaveLength(1);
    expect(
      presentUnlockAchievementResult({
        achievement,
        unlock,
        character,
        xpTransaction,
        evidence: null,
      }),
    ).toEqual(
      expect.objectContaining({
        achievement: expect.objectContaining({ slug: "first-pr", unlocked: true }),
        xpTransaction: expect.objectContaining({ amount: 25 }),
      }),
    );
  });
});
