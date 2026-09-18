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
import StartQuest from "./StartQuest.js";

class InMemoryCharacterRepository implements CharacterRepository {
  constructor(private character: Character | null) {}

  async findByUserId(_userId: string) {
    return this.character;
  }

  async save() {}
}

class InMemoryQuestRepository implements QuestRepository {
  constructor(private quests: Quest[]) {}

  async save(quest: Quest) {
    this.quests.push(quest);
  }

  async update(_quest: Quest) {}

  async findById(questId: string) {
    return this.quests.find((quest) => quest.getId().toString() === questId) ?? null;
  }

  async findByCharacterId(_characterId: string, _filter?: ListQuestsFilter) {
    return this.quests;
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

describe("StartQuest", () => {
  it("transitions a quest from TODO to IN_PROGRESS", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const quest = Quest.create({
      characterId: character.getId().toString(),
      title: "Start me",
      type: QuestType.WORK,
      difficulty: QuestDifficulty.SMALL,
      skillAllocations: [{ skillId: nodeSkillId, xp: 10 }],
    });
    const useCase = new StartQuest(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([quest]),
    );

    const result = await useCase.execute(TEST_USER_ID, quest.getId().toString());

    expect(result.getStatus()).toBe(QuestStatus.IN_PROGRESS);
  });

  it("throws when quest is not found", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const useCase = new StartQuest(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([]),
    );

    await expect(
      useCase.execute(TEST_USER_ID, "00000000-0000-4000-8000-000000000999"),
    ).rejects.toThrow(NotFoundError);
  });
});
