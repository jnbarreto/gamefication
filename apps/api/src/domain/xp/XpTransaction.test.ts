import { XpSourceType } from "../enum/XpSourceType.js";
import InvalidValueError from "../exception/InvalidValueError.js";
import XpTransaction from "./XpTransaction.js";

const characterId = "550e8400-e29b-41d4-a716-446655440000";
const questId = "550e8400-e29b-41d4-a716-446655440001";
const skillId = "550e8400-e29b-41d4-a716-446655440002";
const achievementUnlockId = "550e8400-e29b-41d4-a716-446655440003";

describe("XpTransaction", () => {
  it("creates a quest transaction for character-level XP", () => {
    const transaction = XpTransaction.createFromQuest({
      characterId,
      questId,
      amount: 25,
      description: "Completed quest: Implement Redis cache",
    });

    expect(transaction.getSourceType()).toBe(XpSourceType.QUEST);
    expect(transaction.getSourceId()?.toString()).toBe(questId);
    expect(transaction.getAmount().amount).toBe(25);
    expect(transaction.isCharacterLevel()).toBe(true);
    expect(transaction.getSkillId()).toBeNull();
  });

  it("creates a quest transaction allocated to a skill", () => {
    const transaction = XpTransaction.createFromQuest({
      characterId,
      questId,
      amount: 15,
      skillId,
      description: "Quest XP for Node.js",
    });

    expect(transaction.isCharacterLevel()).toBe(false);
    expect(transaction.getSkillId()?.toString()).toBe(skillId);
  });

  it("creates streak bonus and manual transactions", () => {
    const streak = XpTransaction.createFromStreakBonus({
      characterId,
      amount: 10,
      description: "7-day streak bonus",
    });

    const manual = XpTransaction.createManual({
      characterId,
      amount: 50,
      description: "Manual XP adjustment",
    });

    expect(streak.getSourceType()).toBe(XpSourceType.STREAK_BONUS);
    expect(manual.getSourceType()).toBe(XpSourceType.MANUAL);
  });

  it("creates achievement transactions with required source id", () => {
    const transaction = XpTransaction.createFromAchievement({
      characterId,
      achievementUnlockId,
      amount: 20,
      description: "Unlocked: First endpoint Node",
    });

    expect(transaction.getSourceType()).toBe(XpSourceType.ACHIEVEMENT);
    expect(transaction.getSourceId()?.toString()).toBe(achievementUnlockId);
  });

  it("requires sourceId for quest and achievement transactions", () => {
    expect(() =>
      XpTransaction.createFromQuest({
        characterId,
        questId: "",
        amount: 10,
        description: "Invalid quest transaction",
      }),
    ).toThrow(InvalidValueError);
  });

  it("requires a non-empty description", () => {
    expect(() =>
      XpTransaction.createManual({
        characterId,
        amount: 10,
        description: "   ",
      }),
    ).toThrow(InvalidValueError);
  });

  it("rebuilds from persistence without creating a new id timeline", () => {
    const createdAt = new Date("2026-09-14T12:00:00.000Z");

    const transaction = XpTransaction.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440004",
      characterId,
      amount: 25,
      sourceType: XpSourceType.QUEST,
      sourceId: questId,
      skillId: null,
      description: "Completed quest",
      createdAt,
    });

    expect(transaction.getId().toString()).toBe("550e8400-e29b-41d4-a716-446655440004");
    expect(transaction.getCreatedAt()).toEqual(createdAt);
  });
});
