import { TEST_USER_ID } from "../../../test/testAuth.js";
import { QuestDifficulty } from "../../../domain/enum/QuestDifficulty.js";
import { QuestStatus } from "../../../domain/enum/QuestStatus.js";
import { QuestType } from "../../../domain/enum/QuestType.js";
import Character from "../../../domain/character/Character.js";
import Quest from "../../../domain/quest/Quest.js";
import QuestMission from "../../../domain/quest/QuestMission.js";
import ApplicationError from "../../exception/ApplicationError.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type { ListQuestsFilter } from "../../repository/QuestRepository.js";
import type QuestRepository from "../../repository/QuestRepository.js";
import type QuestMissionRepository from "../../repository/QuestMissionRepository.js";
import ReopenQuest from "./ReopenQuest.js";

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

class InMemoryQuestMissionRepository implements QuestMissionRepository {
  constructor(private missions: QuestMission[]) {}

  async saveAll(missions: QuestMission[]) {
    this.missions.push(...missions);
  }

  async findByQuestId(questId: string) {
    return this.missions.filter((mission) => mission.getQuestId().toString() === questId);
  }

  async findByQuestIds(questIds: string[]) {
    const grouped = new Map<string, QuestMission[]>();

    for (const questId of questIds) {
      grouped.set(questId, await this.findByQuestId(questId));
    }

    return grouped;
  }

  async findById(missionId: string) {
    return this.missions.find((mission) => mission.getId().toString() === missionId) ?? null;
  }

  async update(mission: QuestMission) {
    const index = this.missions.findIndex(
      (item) => item.getId().toString() === mission.getId().toString(),
    );

    if (index >= 0) {
      this.missions[index] = mission;
    }
  }

  async deleteById(missionId: string) {
    this.missions = this.missions.filter(
      (mission) => mission.getId().toString() !== missionId,
    );
  }
}

const nodeSkillId = "550e8400-e29b-41d4-a716-446655440001";

describe("ReopenQuest", () => {
  it("reopens a cancelled quest", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const quest = Quest.create({
      characterId: character.getId().toString(),
      title: "Reopen me",
      type: QuestType.WORK,
      difficulty: QuestDifficulty.SMALL,
      skillAllocations: [{ skillId: nodeSkillId, xp: 10 }],
    });
    quest.cancel();

    const useCase = new ReopenQuest(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([quest]),
      new InMemoryQuestMissionRepository([]),
    );

    const result = await useCase.execute(TEST_USER_ID, quest.getId().toString());

    expect(result.getStatus()).toBe(QuestStatus.TODO);
    expect(result.getCompletedAt()).toBeNull();
  });

  it("reopens a completed quest and resets missions", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const quest = Quest.create({
      characterId: character.getId().toString(),
      title: "Done",
      type: QuestType.WORK,
      difficulty: QuestDifficulty.SMALL,
      skillAllocations: [{ skillId: nodeSkillId, xp: 10 }],
    });
    quest.start();
    quest.complete();
    const mission = QuestMission.create({
      questId: quest.getId().toString(),
      title: "Step 1",
      displayOrder: 0,
    });
    mission.setCompleted(true);
    const missionRepository = new InMemoryQuestMissionRepository([mission]);

    const useCase = new ReopenQuest(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([quest]),
      missionRepository,
    );

    const result = await useCase.execute(TEST_USER_ID, quest.getId().toString());

    expect(result.getStatus()).toBe(QuestStatus.TODO);
    expect(result.getCompletedAt()).toBeNull();

    const missions = await missionRepository.findByQuestId(quest.getId().toString());
    expect(missions[0]?.isMissionCompleted()).toBe(false);
  });

  it("rejects reopening an in-progress quest", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const quest = Quest.create({
      characterId: character.getId().toString(),
      title: "Active",
      type: QuestType.WORK,
      difficulty: QuestDifficulty.SMALL,
      skillAllocations: [{ skillId: nodeSkillId, xp: 10 }],
    });
    quest.start();

    const useCase = new ReopenQuest(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([quest]),
      new InMemoryQuestMissionRepository([]),
    );

    await expect(useCase.execute(TEST_USER_ID, quest.getId().toString())).rejects.toBeInstanceOf(
      ApplicationError,
    );
  });

  it("throws when quest is not found", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const useCase = new ReopenQuest(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([]),
      new InMemoryQuestMissionRepository([]),
    );

    await expect(
      useCase.execute(TEST_USER_ID, "00000000-0000-4000-8000-000000000999"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
