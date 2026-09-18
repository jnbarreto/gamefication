import { TEST_USER_ID } from "../../../test/testAuth.js";
import { QuestDifficulty } from "../../../domain/enum/QuestDifficulty.js";
import { QuestStatus } from "../../../domain/enum/QuestStatus.js";
import { QuestType } from "../../../domain/enum/QuestType.js";
import Character from "../../../domain/character/Character.js";
import Quest from "../../../domain/quest/Quest.js";
import QuestMission from "../../../domain/quest/QuestMission.js";
import ApplicationError from "../../exception/ApplicationError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type { ListQuestsFilter } from "../../repository/QuestRepository.js";
import type QuestRepository from "../../repository/QuestRepository.js";
import type QuestMissionRepository from "../../repository/QuestMissionRepository.js";
import UpdateQuest from "./UpdateQuest.js";

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

  async update(quest: Quest) {
    const index = this.quests.findIndex(
      (item) => item.getId().toString() === quest.getId().toString(),
    );

    if (index >= 0) {
      this.quests[index] = quest;
    }
  }

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
  private missions: QuestMission[] = [];

  constructor(missions: QuestMission[] = []) {
    this.missions = missions;
  }

  async saveAll(missions: QuestMission[]) {
    this.missions.push(...missions);
  }

  async findByQuestId(questId: string) {
    return this.missions
      .filter((mission) => mission.getQuestId().toString() === questId)
      .sort((left, right) => left.getDisplayOrder() - right.getDisplayOrder());
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

function createQuest(characterId: string) {
  return Quest.create({
    characterId,
    title: "Original title",
    type: QuestType.WORK,
    difficulty: QuestDifficulty.SMALL,
    skillAllocations: [{ skillId: nodeSkillId, xp: 10 }],
  });
}

describe("UpdateQuest", () => {
  it("updates quest title and missions", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const quest = createQuest(character.getId().toString());
    const mission = QuestMission.create({
      questId: quest.getId().toString(),
      title: "Old mission",
      displayOrder: 0,
    });
    const missionRepository = new InMemoryQuestMissionRepository([mission]);
    const useCase = new UpdateQuest(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([quest]),
      missionRepository,
    );

    const result = await useCase.execute(TEST_USER_ID, quest.getId().toString(), {
      title: "Updated title",
      missions: [
        { id: mission.getId().toString(), title: "Renamed mission" },
        { title: "New mission" },
      ],
    });

    expect(result.getTitle()).toBe("Updated title");
    expect(result.getStatus()).toBe(QuestStatus.TODO);

    const missions = await missionRepository.findByQuestId(quest.getId().toString());
    expect(missions).toHaveLength(2);
    expect(missions[0]?.getTitle()).toBe("Renamed mission");
    expect(missions[1]?.getTitle()).toBe("New mission");
  });

  it("rejects editing completed quests", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const quest = createQuest(character.getId().toString());
    quest.start();
    quest.complete();

    const useCase = new UpdateQuest(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([quest]),
      new InMemoryQuestMissionRepository(),
    );

    await expect(
      useCase.execute(TEST_USER_ID, quest.getId().toString(), {
        title: "Updated title",
      }),
    ).rejects.toBeInstanceOf(ApplicationError);
  });
});
