import { TEST_USER_ID } from '../../../test/testAuth.js';
import { QuestDifficulty } from "../../../domain/enum/QuestDifficulty.js";
import { QuestType } from "../../../domain/enum/QuestType.js";
import Character from "../../../domain/character/Character.js";
import Quest from "../../../domain/quest/Quest.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type { ListQuestsFilter } from "../../repository/QuestRepository.js";
import type QuestRepository from "../../repository/QuestRepository.js";
import type QuestMissionRepository from "../../repository/QuestMissionRepository.js";
import { getCalendarDay } from "../../shared/getCalendarDay.js";
import { getCalendarWeekStart } from "../../shared/getCalendarWeekStart.js";
import CreateQuest from "./CreateQuest.js";
import { InMemoryQuestMissionRepository } from "./testing/InMemoryQuestMissionRepository.js";

class InMemoryCharacterRepository implements CharacterRepository {
  constructor(private character: Character | null) {}

  async findByUserId(_userId: string) {
    return this.character;
  }

  async save() {}
}

class InMemoryQuestRepository implements QuestRepository {
  constructor(private savedQuests: Quest[] = []) {}

  async save(quest: Quest): Promise<void> {
    this.savedQuests.push(quest);
  }

  async update(_quest: Quest): Promise<void> {}

  async findById(_questId: string): Promise<Quest | null> {
    return null;
  }

  async countDailyQuestsForCalendarDay(): Promise<number> {
    return this.savedQuests.filter((quest) => quest.getType() === QuestType.DAILY)
      .length;
  }

  async rolloverDailyQuests() {}

  async rolloverWeeklyQuests() {}

  async findByCharacterId(
    _characterId: string,
    _filter?: ListQuestsFilter,
  ): Promise<Quest[]> {
    return [];
  }

  async findDailyQuestsForCalendarDay(): Promise<Quest[]> {
    return [];
  }

  getSavedQuests(): Quest[] {
    return this.savedQuests;
  }
}

const nodeSkillId = "550e8400-e29b-41d4-a716-446655440001";

describe("CreateQuest", () => {
  it("creates and persists a quest", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const questRepository = new InMemoryQuestRepository();
    const useCase = new CreateQuest(
      new InMemoryCharacterRepository(character),
      questRepository,
      new InMemoryQuestMissionRepository(),
      "UTC",
    );

    const result = await useCase.execute(TEST_USER_ID, {
      title: "Implement endpoint",
      type: QuestType.WORK,
      difficulty: QuestDifficulty.MEDIUM,
      skillAllocations: [{ skillId: nodeSkillId, xp: 25 }],
    });

    expect(result.quest.getTitle()).toBe("Implement endpoint");
    expect(result.warnings).toEqual([]);
    expect(questRepository.getSavedQuests()).toHaveLength(1);
  });

  it("assigns the current calendar day to new daily quests", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const questRepository = new InMemoryQuestRepository();
    const useCase = new CreateQuest(
      new InMemoryCharacterRepository(character),
      questRepository,
      new InMemoryQuestMissionRepository(),
      "UTC",
    );

    const result = await useCase.execute(TEST_USER_ID, {
      title: "Morning routine",
      type: QuestType.DAILY,
      difficulty: QuestDifficulty.SMALL,
      skillAllocations: [{ skillId: nodeSkillId, xp: 10 }],
    });

    expect(result.quest.getCalendarDay()).toBe(getCalendarDay(new Date(), "UTC"));
  });

  it("assigns the current calendar week start to new weekly quests", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const questRepository = new InMemoryQuestRepository();
    const useCase = new CreateQuest(
      new InMemoryCharacterRepository(character),
      questRepository,
      new InMemoryQuestMissionRepository(),
      "UTC",
    );

    const result = await useCase.execute(TEST_USER_ID, {
      title: "Weekly planning",
      type: QuestType.WEEKLY,
      difficulty: QuestDifficulty.MEDIUM,
      skillAllocations: [{ skillId: nodeSkillId, xp: 25 }],
    });

    expect(result.quest.getCalendarWeekStart()).toBe(getCalendarWeekStart(new Date(), "UTC"));
  });

  it("returns a soft-limit warning on the 4th daily quest", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const questRepository = new InMemoryQuestRepository();

    for (let index = 0; index < 3; index += 1) {
      questRepository.getSavedQuests().push(
        Quest.create({
          characterId: character.getId().toString(),
          title: `Daily ${index + 1}`,
          type: QuestType.DAILY,
          difficulty: QuestDifficulty.SMALL,
          skillAllocations: [{ skillId: nodeSkillId, xp: 10 }],
        }),
      );
    }

    const useCase = new CreateQuest(
      new InMemoryCharacterRepository(character),
      questRepository,
      new InMemoryQuestMissionRepository(),
      "UTC",
    );

    const result = await useCase.execute(TEST_USER_ID, {
      title: "Daily 4",
      type: QuestType.DAILY,
      difficulty: QuestDifficulty.SMALL,
      skillAllocations: [{ skillId: nodeSkillId, xp: 10 }],
    });

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("3 daily quests");
    expect(questRepository.getSavedQuests()).toHaveLength(4);
  });

  it("throws when no character exists", async () => {
    const useCase = new CreateQuest(
      new InMemoryCharacterRepository(null),
      new InMemoryQuestRepository(),
      new InMemoryQuestMissionRepository(),
      "UTC",
    );

    await expect(
      useCase.execute(TEST_USER_ID, {
        title: "Implement endpoint",
        type: QuestType.WORK,
        difficulty: QuestDifficulty.MEDIUM,
        skillAllocations: [{ skillId: nodeSkillId, xp: 25 }],
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
