import { TEST_USER_ID } from '../../../test/testAuth.js';
import { QuestDifficulty } from "../../../domain/enum/QuestDifficulty.js";
import { QuestStatus } from "../../../domain/enum/QuestStatus.js";
import { QuestType } from "../../../domain/enum/QuestType.js";
import Character from "../../../domain/character/Character.js";
import Quest from "../../../domain/quest/Quest.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type QuestRepository from "../../repository/QuestRepository.js";
import ListTodayQuests from "./ListTodayQuests.js";
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

  async findByCharacterId() {
    return [];
  }

  async rolloverDailyQuests(characterId: string, calendarDay: string) {
    for (const quest of this.quests) {
      if (
        quest.getCharacterId().toString() !== characterId ||
        quest.getType() !== QuestType.DAILY ||
        quest.getStatus() === QuestStatus.CANCELLED
      ) {
        continue;
      }

      const currentDay = quest.getCalendarDay();

      if (!currentDay || currentDay < calendarDay) {
        quest.resetForNewCalendarDay(calendarDay);
      }
    }
  }

  async findDailyQuestsForCalendarDay(characterId: string, calendarDay: string) {
    return this.quests.filter(
      (quest) =>
        quest.getCharacterId().toString() === characterId &&
        quest.getType() === QuestType.DAILY &&
        quest.getStatus() !== QuestStatus.CANCELLED &&
        quest.getCalendarDay() === calendarDay,
    );
  }

  async countDailyQuestsForCalendarDay() {
    return 0;
  }

  async rolloverWeeklyQuests(characterId: string, calendarWeekStart: string) {
    for (const quest of this.quests) {
      if (
        quest.getCharacterId().toString() !== characterId ||
        quest.getType() !== QuestType.WEEKLY ||
        quest.getStatus() === QuestStatus.CANCELLED
      ) {
        continue;
      }

      const currentWeekStart = quest.getCalendarWeekStart();

      if (!currentWeekStart || currentWeekStart < calendarWeekStart) {
        quest.resetForNewCalendarWeek(calendarWeekStart);
      }
    }
  }
}

const nodeSkillId = "550e8400-e29b-41d4-a716-446655440001";

describe("ListTodayQuests", () => {
  it("returns daily quests for the current calendar day", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const referenceDate = new Date("2026-09-14T15:00:00.000Z");
    const quests = [
      Quest.create({
        characterId: character.getId().toString(),
        title: "Today daily",
        type: QuestType.DAILY,
        difficulty: QuestDifficulty.SMALL,
        skillAllocations: [{ skillId: nodeSkillId, xp: 10 }],
        calendarDay: "2026-09-14",
      }),
      Quest.create({
        characterId: character.getId().toString(),
        title: "Work quest",
        type: QuestType.WORK,
        difficulty: QuestDifficulty.MEDIUM,
        skillAllocations: [{ skillId: nodeSkillId, xp: 25 }],
      }),
    ];
    const useCase = new ListTodayQuests(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository(quests),
      new InMemoryQuestMissionRepository(),
      "UTC",
    );

    const result = await useCase.execute(TEST_USER_ID, referenceDate);

    expect(result.calendarDay).toBe("2026-09-14");
    expect(result.quests).toHaveLength(1);
    expect(result.quests[0]?.getTitle()).toBe("Today daily");
  });

  it("rolls over completed daily quests from a previous day", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const referenceDate = new Date("2026-09-14T15:00:00.000Z");
    const dailyQuest = Quest.create({
      characterId: character.getId().toString(),
      title: "Yesterday daily",
      type: QuestType.DAILY,
      difficulty: QuestDifficulty.SMALL,
      skillAllocations: [{ skillId: nodeSkillId, xp: 10 }],
      calendarDay: "2026-09-13",
    });
    dailyQuest.start();
    dailyQuest.complete(new Date("2026-09-13T18:00:00.000Z"));

    const useCase = new ListTodayQuests(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([dailyQuest]),
      new InMemoryQuestMissionRepository(),
      "UTC",
    );

    const result = await useCase.execute(TEST_USER_ID, referenceDate);

    expect(result.quests).toHaveLength(1);
    expect(result.quests[0]?.getStatus()).toBe(QuestStatus.TODO);
    expect(result.quests[0]?.getCompletedAt()).toBeNull();
    expect(result.quests[0]?.getCalendarDay()).toBe("2026-09-14");
  });

  it("rolls over completed weekly quests on Monday", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const referenceDate = new Date("2026-09-14T15:00:00.000Z");
    const weeklyQuest = Quest.create({
      characterId: character.getId().toString(),
      title: "Last week weekly",
      type: QuestType.WEEKLY,
      difficulty: QuestDifficulty.MEDIUM,
      skillAllocations: [{ skillId: nodeSkillId, xp: 25 }],
      calendarWeekStart: "2026-09-08",
    });
    weeklyQuest.start();
    weeklyQuest.complete(new Date("2026-09-12T18:00:00.000Z"));

    const useCase = new ListTodayQuests(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([weeklyQuest]),
      new InMemoryQuestMissionRepository(),
      "UTC",
    );

    await useCase.execute(TEST_USER_ID, referenceDate);

    expect(weeklyQuest.getStatus()).toBe(QuestStatus.TODO);
    expect(weeklyQuest.getCompletedAt()).toBeNull();
    expect(weeklyQuest.getCalendarWeekStart()).toBe("2026-09-14");
  });

  it("throws when no character exists", async () => {
    const useCase = new ListTodayQuests(
      new InMemoryCharacterRepository(null),
      new InMemoryQuestRepository([]),
      new InMemoryQuestMissionRepository(),
      "UTC",
    );

    await expect(useCase.execute(TEST_USER_ID)).rejects.toBeInstanceOf(NotFoundError);
  });
});
