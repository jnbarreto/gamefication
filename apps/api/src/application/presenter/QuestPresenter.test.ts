import { QuestDifficulty } from "../../domain/enum/QuestDifficulty.js";
import { QuestStatus } from "../../domain/enum/QuestStatus.js";
import { QuestType } from "../../domain/enum/QuestType.js";
import Quest from "../../domain/quest/Quest.js";
import {
  presentCreateQuestResult,
  presentQuest,
  presentQuestList,
} from "./QuestPresenter.js";

describe("QuestPresenter", () => {
  it("maps quest fields to API response", () => {
    const quest = Quest.create({
      characterId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Implement endpoint",
      type: QuestType.WORK,
      difficulty: QuestDifficulty.MEDIUM,
      skillAllocations: [
        {
          skillId: "550e8400-e29b-41d4-a716-446655440001",
          xp: 25,
        },
      ],
    });

    expect(presentQuest(quest)).toEqual(
      expect.objectContaining({
        title: "Implement endpoint",
        type: QuestType.WORK,
        difficulty: QuestDifficulty.MEDIUM,
        baseXp: 25,
        status: QuestStatus.TODO,
        missions: [],
      }),
    );
  });

  it("wraps create result with warnings", () => {
    const quest = Quest.create({
      characterId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Daily quest",
      type: QuestType.DAILY,
      difficulty: QuestDifficulty.SMALL,
      skillAllocations: [
        {
          skillId: "550e8400-e29b-41d4-a716-446655440001",
          xp: 10,
        },
      ],
    });

    expect(
      presentCreateQuestResult({
        quest,
        warnings: ["Soft limit reached"],
      }),
    ).toEqual({
      quest: expect.objectContaining({ title: "Daily quest" }),
      warnings: ["Soft limit reached"],
    });
  });

  it("maps quest collections", () => {
    const quest = Quest.create({
      characterId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Implement endpoint",
      type: QuestType.WORK,
      difficulty: QuestDifficulty.MEDIUM,
      skillAllocations: [
        {
          skillId: "550e8400-e29b-41d4-a716-446655440001",
          xp: 25,
        },
      ],
    });

    expect(presentQuestList([quest]).quests).toHaveLength(1);
  });
});
