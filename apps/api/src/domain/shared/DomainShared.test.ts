import InvalidValueError from "../exception/InvalidValueError.js";
import DomainError from "../exception/DomainError.js";
import {
  QuestStatus,
  canTransitionQuestStatus,
  parseQuestStatus,
} from "../enum/QuestStatus.js";
import { masteryLevelFromXp, MasteryLevel } from "../enum/MasteryLevel.js";
import { defaultXpForDifficulty, QuestDifficulty } from "../enum/QuestDifficulty.js";

describe("InvalidValueError", () => {
  it("is a DomainError with generated code", () => {
    const error = new InvalidValueError("invalid");

    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe("INVALID_VALUE_ERROR");
  });
});

describe("QuestStatus", () => {
  it("parses valid values", () => {
    expect(parseQuestStatus("TODO")).toBe(QuestStatus.TODO);
  });

  it("rejects invalid values", () => {
    expect(() => parseQuestStatus("DONE")).toThrow(InvalidValueError);
  });

  it("allows valid transitions only", () => {
    expect(canTransitionQuestStatus(QuestStatus.TODO, QuestStatus.IN_PROGRESS)).toBe(
      true,
    );
    expect(canTransitionQuestStatus(QuestStatus.TODO, QuestStatus.COMPLETED)).toBe(
      false,
    );
    expect(canTransitionQuestStatus(QuestStatus.COMPLETED, QuestStatus.TODO)).toBe(
      true,
    );
    expect(canTransitionQuestStatus(QuestStatus.CANCELLED, QuestStatus.TODO)).toBe(
      true,
    );
  });
});

describe("MasteryLevel", () => {
  it("derives level from accumulated skill XP", () => {
    expect(masteryLevelFromXp(0)).toBe(MasteryLevel.UNKNOWN);
    expect(masteryLevelFromXp(25)).toBe(MasteryLevel.SUPERFICIAL);
    expect(masteryLevelFromXp(200)).toBe(MasteryLevel.SOLO);
    expect(masteryLevelFromXp(500)).toBe(MasteryLevel.TEACH);
  });
});

describe("QuestDifficulty", () => {
  it("maps difficulty to default XP tiers", () => {
    expect(defaultXpForDifficulty(QuestDifficulty.SMALL)).toBe(10);
    expect(defaultXpForDifficulty(QuestDifficulty.MEDIUM)).toBe(25);
    expect(defaultXpForDifficulty(QuestDifficulty.LARGE)).toBe(50);
    expect(defaultXpForDifficulty(QuestDifficulty.BOSS)).toBe(100);
  });
});
