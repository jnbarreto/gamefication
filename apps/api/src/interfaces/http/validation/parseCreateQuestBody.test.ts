import InvalidValueError from "../../../domain/exception/InvalidValueError.js";
import { QuestDifficulty } from "../../../domain/enum/QuestDifficulty.js";
import { QuestType } from "../../../domain/enum/QuestType.js";
import ValidationError from "../../../shared/exception/ValidationError.js";
import { parseCreateQuestBody } from "./parseCreateQuestBody.js";

const nodeSkillId = "550e8400-e29b-41d4-a716-446655440001";

describe("parseCreateQuestBody", () => {
  it("parses a valid create quest payload", () => {
    expect(
      parseCreateQuestBody({
        title: "Implement endpoint",
        type: QuestType.WORK,
        difficulty: QuestDifficulty.MEDIUM,
        skillAllocations: [{ skillId: nodeSkillId, xp: 25 }],
      }),
    ).toEqual({
      title: "Implement endpoint",
      type: QuestType.WORK,
      difficulty: QuestDifficulty.MEDIUM,
      skillAllocations: [{ skillId: nodeSkillId, xp: 25 }],
    });
  });

  it("requires at least one skill allocation", () => {
    expect(() =>
      parseCreateQuestBody({
        title: "Implement endpoint",
        type: QuestType.WORK,
        difficulty: QuestDifficulty.MEDIUM,
        skillAllocations: [],
      }),
    ).toThrow(ValidationError);
  });

  it("rejects invalid quest types", () => {
    expect(() =>
      parseCreateQuestBody({
        title: "Implement endpoint",
        type: "INVALID",
        difficulty: QuestDifficulty.MEDIUM,
        skillAllocations: [{ skillId: nodeSkillId, xp: 25 }],
      }),
    ).toThrow(InvalidValueError);
  });
});
