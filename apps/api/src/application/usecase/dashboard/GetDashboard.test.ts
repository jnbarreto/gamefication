import { TEST_USER_ID } from '../../../test/testAuth.js';
import { QuestDifficulty } from "../../../domain/enum/QuestDifficulty.js";
import { QuestType } from "../../../domain/enum/QuestType.js";
import Character from "../../../domain/character/Character.js";
import Quest from "../../../domain/quest/Quest.js";
import Streak from "../../../domain/streak/Streak.js";
import Skill from "../../../domain/skill/Skill.js";
import SkillCategory from "../../../domain/skill/SkillCategory.js";
import CharacterSkill from "../../../domain/skill/CharacterSkill.js";
import XpTransaction from "../../../domain/xp/XpTransaction.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type SkillRepository from "../../repository/SkillRepository.js";
import type StreakRepository from "../../repository/StreakRepository.js";
import GetCharacter from "../character/GetCharacter.js";
import GetDashboard, {
  DASHBOARD_RECENT_TRANSACTIONS_LIMIT,
  DASHBOARD_TOP_SKILLS_LIMIT,
} from "./GetDashboard.js";
import ListStaleSkills from "../skill/ListStaleSkills.js";
import ListTodayQuests from "../quest/ListTodayQuests.js";
import { InMemoryQuestMissionRepository } from "../quest/testing/InMemoryQuestMissionRepository.js";
import ListXpTransactions from "../xp/ListXpTransactions.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type QuestRepository from "../../repository/QuestRepository.js";
import type XpTransactionRepository from "../../repository/XpTransactionRepository.js";

class InMemoryCharacterRepository implements CharacterRepository {
  constructor(private character: Character | null) {}

  async findByUserId(_userId: string) {
    return this.character;
  }

  async save() {}
}

class InMemoryQuestRepository implements QuestRepository {
  constructor(private dailyQuests: Quest[]) {}

  async save() {}

  async update() {}

  async findById() {
    return null;
  }

  async findByCharacterId() {
    return [];
  }

  async findDailyQuestsForCalendarDay() {
    return this.dailyQuests;
  }

  async countDailyQuestsForCalendarDay() {
    return 0;
  }

  async rolloverDailyQuests() {}

  async rolloverWeeklyQuests() {}
}

class InMemoryXpTransactionRepository implements XpTransactionRepository {
  constructor(private transactions: XpTransaction[]) {}

  async findByCharacterId() {
    return this.transactions;
  }

  async summarizeDailyXp() {
    return [];
  }
}

class InMemorySkillRepository implements SkillRepository {
  constructor(private entries: Awaited<ReturnType<SkillRepository["findSkillTree"]>>) {}

  async findSkillTree(_characterId: string) {
    return this.entries;
  }
}

class InMemoryStreakRepository implements StreakRepository {
  constructor(private streak: Streak | null) {}

  async findByCharacterId() {
    return this.streak;
  }
}

const nodeSkillId = "550e8400-e29b-41d4-a716-446655440001";
const postgresSkillId = "550e8400-e29b-41d4-a716-446655440002";

describe("GetDashboard", () => {
  it("aggregates dashboard sections for the authenticated user's character", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const dailyQuest = Quest.create({
      characterId: character.getId().toString(),
      title: "Daily task",
      type: QuestType.DAILY,
      difficulty: QuestDifficulty.SMALL,
      skillAllocations: [{ skillId: nodeSkillId, xp: 10 }],
    });
    const backendCategory = SkillCategory.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440010",
      name: "Backend",
      displayOrder: 1,
    });
    const devopsCategory = SkillCategory.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440011",
      name: "DevOps",
      displayOrder: 2,
    });
    const nodeSkill = Skill.rebuild({
      id: nodeSkillId,
      categoryId: backendCategory.getId().toString(),
      name: "Node.js",
      slug: "node-js",
      displayOrder: 1,
    });
    const postgresSkill = Skill.rebuild({
      id: postgresSkillId,
      categoryId: devopsCategory.getId().toString(),
      name: "PostgreSQL",
      slug: "postgresql",
      displayOrder: 1,
    });
    const nodeProgress = CharacterSkill.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440020",
      characterId: character.getId().toString(),
      skillId: nodeSkillId,
      xp: 50,
      masteryLevel: "SOLO",
      masteryOverridden: false,
      lastXpAt: new Date("2026-09-14T12:00:00.000Z"),
      createdAt: new Date("2026-09-01T12:00:00.000Z"),
      updatedAt: new Date("2026-09-14T12:00:00.000Z"),
    });
    const postgresProgress = CharacterSkill.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440021",
      characterId: character.getId().toString(),
      skillId: postgresSkillId,
      xp: 10,
      masteryLevel: "SUPERFICIAL",
      masteryOverridden: false,
      lastXpAt: new Date("2026-08-01T12:00:00.000Z"),
      createdAt: new Date("2026-08-01T12:00:00.000Z"),
      updatedAt: new Date("2026-08-01T12:00:00.000Z"),
    });
    const transactions = Array.from({ length: 12 }, (_, index) =>
      XpTransaction.createFromStreakBonus({
        characterId: character.getId().toString(),
        amount: 10,
        description: `Bonus ${index + 1}`,
      }),
    );
    const streak = Streak.create({ characterId: character.getId().toString() });
    const characterRepository = new InMemoryCharacterRepository(character);
    const useCase = new GetDashboard(
      new GetCharacter(characterRepository),
      new ListTodayQuests(
        characterRepository,
        new InMemoryQuestRepository([dailyQuest]),
        new InMemoryQuestMissionRepository(),
        "UTC",
      ),
      new ListXpTransactions(
        characterRepository,
        new InMemoryXpTransactionRepository(transactions),
      ),
      new ListStaleSkills(
        characterRepository,
        new InMemorySkillRepository([
          { category: backendCategory, skill: nodeSkill, progress: nodeProgress },
          {
            category: devopsCategory,
            skill: postgresSkill,
            progress: postgresProgress,
          },
        ]),
      ),
      new InMemoryStreakRepository(streak),
      new InMemorySkillRepository([
        { category: backendCategory, skill: nodeSkill, progress: nodeProgress },
        { category: devopsCategory, skill: postgresSkill, progress: postgresProgress },
      ]),
      new InMemoryXpTransactionRepository(transactions),
      "UTC",
    );

    const result = await useCase.execute(TEST_USER_ID, new Date("2026-09-14T15:00:00.000Z"));

    expect(result.character.getName()).toBe("Leone");
    expect(result.calendarDay).toBe("2026-09-14");
    expect(result.todayQuests).toHaveLength(1);
    expect(result.topSkills).toHaveLength(2);
    expect(result.topSkills[0]?.progress.getXp()).toBe(50);
    expect(result.recentTransactions).toHaveLength(DASHBOARD_RECENT_TRANSACTIONS_LIMIT);
    expect(result.streak.getCurrentCount()).toBe(0);
    expect(result.activityHeatmap.days).toBe(30);
    expect(result.activityHeatmap.cells.length).toBeGreaterThan(0);
    expect(result.staleSkills).toHaveLength(1);
    expect(result.topSkills.length).toBeLessThanOrEqual(DASHBOARD_TOP_SKILLS_LIMIT);
  });

  it("throws when streak is missing", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const characterRepository = new InMemoryCharacterRepository(character);
    const useCase = new GetDashboard(
      new GetCharacter(characterRepository),
      new ListTodayQuests(
        characterRepository,
        new InMemoryQuestRepository([]),
        new InMemoryQuestMissionRepository(),
        "UTC",
      ),
      new ListXpTransactions(
        characterRepository,
        new InMemoryXpTransactionRepository([]),
      ),
      new ListStaleSkills(characterRepository, new InMemorySkillRepository([])),
      new InMemoryStreakRepository(null),
      new InMemorySkillRepository([]),
      new InMemoryXpTransactionRepository([]),
      "UTC",
    );

    await expect(useCase.execute(TEST_USER_ID)).rejects.toBeInstanceOf(NotFoundError);
  });
});
