import { TEST_USER_ID } from '../../../test/testAuth.js';
import { QuestDifficulty } from "../../../domain/enum/QuestDifficulty.js";
import { QuestStatus } from "../../../domain/enum/QuestStatus.js";
import { QuestType } from "../../../domain/enum/QuestType.js";
import Character from "../../../domain/character/Character.js";
import Quest from "../../../domain/quest/Quest.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type { ListQuestsFilter } from "../../repository/QuestRepository.js";
import type QuestRepository from "../../repository/QuestRepository.js";
import ListQuests from "./ListQuests.js";
import { InMemoryQuestMissionRepository } from "./testing/InMemoryQuestMissionRepository.js";

class InMemoryCharacterRepository implements CharacterRepository {
  constructor(private character: Character | null) {}

  async findByUserId(_userId: string) {
    return this.character;
  }

  async save() {}
}

class InMemoryQuestRepository implements QuestRepository {
  constructor(private quests: Quest[]) {}

  async save() {}

  async update() {}

  async findById(_questId: string) {
    return null;
  }

  async findByCharacterId(characterId: string, filter: ListQuestsFilter = {}) {
    return this.quests.filter((quest) => {
      if (quest.getCharacterId().toString() !== characterId) {
        return false;
      }

      if (filter.status && quest.getStatus() !== filter.status) {
        return false;
      }

      if (filter.type && quest.getType() !== filter.type) {
        return false;
      }

      if (filter.createdAfter && quest.getCreatedAt() < filter.createdAfter) {
        return false;
      }

      return true;
    });
  }

  async findDailyQuestsForCalendarDay() {
    return [];
  }

  async countDailyQuestsForCalendarDay() {
    return 0;
  }

  async rolloverDailyQuests() {}

  async rolloverWeeklyQuests() {}
}

const nodeSkillId = "550e8400-e29b-41d4-a716-446655440001";

function createStoredQuest(
  character: Character,
  overrides: Partial<Parameters<typeof Quest.create>[0]> = {},
) {
  return Quest.create({
    characterId: character.getId().toString(),
    title: "Stored quest",
    type: QuestType.WORK,
    difficulty: QuestDifficulty.MEDIUM,
    skillAllocations: [{ skillId: nodeSkillId, xp: 25 }],
    ...overrides,
  });
}

describe("ListQuests", () => {
  it("returns quests for the default character", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const quests = [
      createStoredQuest(character),
      createStoredQuest(character, {
        title: "Daily task",
        type: QuestType.DAILY,
        difficulty: QuestDifficulty.SMALL,
        skillAllocations: [{ skillId: nodeSkillId, xp: 10 }],
      }),
    ];
    const useCase = new ListQuests(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository(quests),
      new InMemoryQuestMissionRepository(),
      "UTC",
    );

    const result = await useCase.execute(TEST_USER_ID);

    expect(result.quests).toHaveLength(2);
  });

  it("applies status and type filters", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const todoQuest = createStoredQuest(character);
    const dailyQuest = createStoredQuest(character, {
      title: "Daily task",
      type: QuestType.DAILY,
      difficulty: QuestDifficulty.SMALL,
      skillAllocations: [{ skillId: nodeSkillId, xp: 10 }],
    });
    dailyQuest.start();
    const useCase = new ListQuests(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([todoQuest, dailyQuest]),
      new InMemoryQuestMissionRepository(),
      "UTC",
    );

    const result = await useCase.execute(TEST_USER_ID, {
      status: QuestStatus.IN_PROGRESS,
      type: QuestType.DAILY,
    });

    expect(result.quests).toHaveLength(1);
    expect(result.quests[0]?.getTitle()).toBe("Daily task");
  });

  it("throws when no character exists", async () => {
    const useCase = new ListQuests(
      new InMemoryCharacterRepository(null),
      new InMemoryQuestRepository([]),
      new InMemoryQuestMissionRepository(),
      "UTC",
    );

    await expect(useCase.execute(TEST_USER_ID)).rejects.toBeInstanceOf(NotFoundError);
  });
});
