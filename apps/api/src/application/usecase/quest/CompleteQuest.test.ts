import { TEST_USER_ID } from '../../../test/testAuth.js';
import { EvidenceType } from "../../../domain/enum/EvidenceType.js";
import { QuestDifficulty } from "../../../domain/enum/QuestDifficulty.js";
import { QuestStatus } from "../../../domain/enum/QuestStatus.js";
import { QuestType } from "../../../domain/enum/QuestType.js";
import { XpSourceType } from "../../../domain/enum/XpSourceType.js";
import Character from "../../../domain/character/Character.js";
import CharacterSkill from "../../../domain/skill/CharacterSkill.js";
import Quest from "../../../domain/quest/Quest.js";
import Streak from "../../../domain/streak/Streak.js";
import ApplicationError from "../../exception/ApplicationError.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type CharacterSkillRepository from "../../repository/CharacterSkillRepository.js";
import type QuestCompletionRepository from "../../repository/QuestCompletionRepository.js";
import type { QuestCompletionSnapshot } from "../../repository/QuestCompletionRepository.js";
import type { ListQuestsFilter } from "../../repository/QuestRepository.js";
import type QuestRepository from "../../repository/QuestRepository.js";
import type StreakRepository from "../../repository/StreakRepository.js";
import { previousCalendarDay } from "../../../domain/streak/StreakMilestones.js";
import { getCalendarDay } from "../../shared/getCalendarDay.js";
import CompleteQuest from "./CompleteQuest.js";
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

class InMemoryCharacterSkillRepository implements CharacterSkillRepository {
  constructor(private skills: CharacterSkill[]) {}

  async findByCharacterAndSkillIds(_characterId: string, skillIds: string[]) {
    return this.skills.filter((skill) =>
      skillIds.includes(skill.getSkillId().toString()),
    );
  }
}

class InMemoryStreakRepository implements StreakRepository {
  constructor(private streak: Streak | null) {}

  async findByCharacterId() {
    return this.streak;
  }
}

class InMemoryQuestCompletionRepository implements QuestCompletionRepository {
  snapshots: QuestCompletionSnapshot[] = [];

  async persist(snapshot: QuestCompletionSnapshot) {
    this.snapshots.push(snapshot);
  }
}

const nodeSkillId = "550e8400-e29b-41d4-a716-446655440001";
const timezone = "UTC";

function buildInProgressQuest(characterId: string): Quest {
  const quest = Quest.create({
    characterId,
    title: "Complete me",
    type: QuestType.WORK,
    difficulty: QuestDifficulty.MEDIUM,
    skillAllocations: [{ skillId: nodeSkillId, xp: 25 }],
  });

  quest.start();

  return quest;
}

describe("CompleteQuest", () => {
  it("completes a quest and distributes XP, transactions, and streak activity", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const quest = buildInProgressQuest(character.getId().toString());
    const characterSkill = CharacterSkill.create({
      characterId: character.getId().toString(),
      skillId: nodeSkillId,
    });
    const streak = Streak.create({ characterId: character.getId().toString() });
    const completionRepository = new InMemoryQuestCompletionRepository();
    const useCase = new CompleteQuest(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([quest]),
      new InMemoryCharacterSkillRepository([characterSkill]),
      new InMemoryStreakRepository(streak),
      completionRepository,
      new InMemoryQuestMissionRepository(),
      timezone,
    );

    const result = await useCase.execute(TEST_USER_ID, quest.getId().toString());

    expect(result.quest.getStatus()).toBe(QuestStatus.COMPLETED);
    expect(result.character.getTotalXp()).toBe(25);
    expect(result.streak.getCurrentCount()).toBe(1);
    expect(result.xpTransactions).toHaveLength(1);
    expect(result.xpTransactions[0]?.getSourceType()).toBe(XpSourceType.QUEST);
    expect(characterSkill.getXp()).toBe(25);
    expect(completionRepository.snapshots).toHaveLength(1);
  });

  it("persists optional evidence in the completion snapshot", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const quest = buildInProgressQuest(character.getId().toString());
    const characterSkill = CharacterSkill.create({
      characterId: character.getId().toString(),
      skillId: nodeSkillId,
    });
    const streak = Streak.create({ characterId: character.getId().toString() });
    const completionRepository = new InMemoryQuestCompletionRepository();
    const useCase = new CompleteQuest(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([quest]),
      new InMemoryCharacterSkillRepository([characterSkill]),
      new InMemoryStreakRepository(streak),
      completionRepository,
      new InMemoryQuestMissionRepository(),
      timezone,
    );

    const result = await useCase.execute(TEST_USER_ID, quest.getId().toString(), {
      evidence: {
        type: EvidenceType.URL,
        value: "https://github.com/org/repo/pull/1",
        description: "PR merged",
      },
    });

    expect(result.evidence?.value).toBe("https://github.com/org/repo/pull/1");
    expect(completionRepository.snapshots[0]?.evidence?.type).toBe(EvidenceType.URL);
  });

  it("awards streak milestone bonus XP on the 3-day milestone", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const quest = buildInProgressQuest(character.getId().toString());
    const characterSkill = CharacterSkill.create({
      characterId: character.getId().toString(),
      skillId: nodeSkillId,
    });
    const today = getCalendarDay(new Date(), timezone);
    const streak = Streak.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440099",
      characterId: character.getId().toString(),
      currentCount: 2,
      bestCount: 2,
      lastActivityDay: previousCalendarDay(today),
      bonusesClaimed: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const useCase = new CompleteQuest(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([quest]),
      new InMemoryCharacterSkillRepository([characterSkill]),
      new InMemoryStreakRepository(streak),
      new InMemoryQuestCompletionRepository(),
      new InMemoryQuestMissionRepository(),
      timezone,
    );

    const result = await useCase.execute(TEST_USER_ID, quest.getId().toString());

    expect(result.streak.getCurrentCount()).toBe(3);
    expect(result.character.getTotalXp()).toBe(35);
    expect(result.xpTransactions).toHaveLength(2);
    expect(result.xpTransactions[1]?.getSourceType()).toBe(XpSourceType.STREAK_BONUS);
  });

  it("rejects completion when quest is not in progress", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const quest = Quest.create({
      characterId: character.getId().toString(),
      title: "Still todo",
      type: QuestType.WORK,
      difficulty: QuestDifficulty.MEDIUM,
      skillAllocations: [{ skillId: nodeSkillId, xp: 25 }],
    });
    const useCase = new CompleteQuest(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([quest]),
      new InMemoryCharacterSkillRepository([]),
      new InMemoryStreakRepository(
        Streak.create({ characterId: character.getId().toString() }),
      ),
      new InMemoryQuestCompletionRepository(),
      new InMemoryQuestMissionRepository(),
      timezone,
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
    const useCase = new CompleteQuest(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([]),
      new InMemoryCharacterSkillRepository([]),
      new InMemoryStreakRepository(
        Streak.create({ characterId: character.getId().toString() }),
      ),
      new InMemoryQuestCompletionRepository(),
      new InMemoryQuestMissionRepository(),
      timezone,
    );

    await expect(
      useCase.execute(TEST_USER_ID, "550e8400-e29b-41d4-a716-446655440000"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws when character skill progress is missing", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const quest = buildInProgressQuest(character.getId().toString());
    const useCase = new CompleteQuest(
      new InMemoryCharacterRepository(character),
      new InMemoryQuestRepository([quest]),
      new InMemoryCharacterSkillRepository([]),
      new InMemoryStreakRepository(
        Streak.create({ characterId: character.getId().toString() }),
      ),
      new InMemoryQuestCompletionRepository(),
      new InMemoryQuestMissionRepository(),
      timezone,
    );

    await expect(useCase.execute(TEST_USER_ID, quest.getId().toString())).rejects.toBeInstanceOf(
      ApplicationError,
    );
  });
});
