import { TEST_USER_ID } from "../../../test/testAuth.js";
import { QuestDifficulty } from "../../../domain/enum/QuestDifficulty.js";
import { QuestStatus } from "../../../domain/enum/QuestStatus.js";
import { QuestType } from "../../../domain/enum/QuestType.js";
import Character from "../../../domain/character/Character.js";
import Quest from "../../../domain/quest/Quest.js";
import ApplicationError from "../../exception/ApplicationError.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type { ListQuestsFilter } from "../../repository/QuestRepository.js";
import type QuestRepository from "../../repository/QuestRepository.js";
import UpdateQuestTimer from "./UpdateQuestTimer.js";

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

describe("UpdateQuestTimer", () => {
  it("starts and pauses a timer for an in-progress quest", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const quest = Quest.create({
      characterId: character.getId().toString(),
      title: "Timer Quest",
      type: QuestType.WORK,
      difficulty: QuestDifficulty.SMALL,
      skillAllocations: [{ skillId: nodeSkillId, xp: 10 }],
    });
    quest.start();

    const useCase = new UpdateQuestTimer(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([quest]),
    );

    const started = await useCase.execute(TEST_USER_ID, quest.getId().toString(), {
      action: "START",
    });
    expect(started.isTimerRunning()).toBe(true);
    expect(started.getTimerStartedAt()).not.toBeNull();

    const paused = await useCase.execute(TEST_USER_ID, quest.getId().toString(), {
      action: "PAUSE",
    });
    expect(paused.isTimerRunning()).toBe(false);
    expect(paused.getTimerStartedAt()).toBeNull();
  });

  it("syncs timer seconds", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const quest = Quest.create({
      characterId: character.getId().toString(),
      title: "Timer Quest",
      type: QuestType.WORK,
      difficulty: QuestDifficulty.SMALL,
      skillAllocations: [{ skillId: nodeSkillId, xp: 10 }],
    });
    quest.start();

    const useCase = new UpdateQuestTimer(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([quest]),
    );

    const synced = await useCase.execute(TEST_USER_ID, quest.getId().toString(), {
      action: "SYNC",
      timerSeconds: 120,
    });
    expect(synced.getTimerSeconds()).toBe(120);
  });

  it("rejects updating timer when quest is still TODO", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const quest = Quest.create({
      characterId: character.getId().toString(),
      title: "Timer Quest",
      type: QuestType.WORK,
      difficulty: QuestDifficulty.SMALL,
      skillAllocations: [{ skillId: nodeSkillId, xp: 10 }],
    });

    const useCase = new UpdateQuestTimer(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([quest]),
    );

    await expect(
      useCase.execute(TEST_USER_ID, quest.getId().toString(), { action: "START" }),
    ).rejects.toThrow(ApplicationError);
  });
});
