import { QuestDifficulty } from "../../domain/enum/QuestDifficulty.js";
import { QuestType } from "../../domain/enum/QuestType.js";
import Character from "../../domain/character/Character.js";
import Quest from "../../domain/quest/Quest.js";
import Streak from "../../domain/streak/Streak.js";
import Skill from "../../domain/skill/Skill.js";
import SkillCategory from "../../domain/skill/SkillCategory.js";
import CharacterSkill from "../../domain/skill/CharacterSkill.js";
import XpTransaction from "../../domain/xp/XpTransaction.js";
import { buildMonthHeatmap } from "../shared/buildActivityHeatmap.js";
import { presentDashboard } from "./DashboardPresenter.js";

describe("DashboardPresenter", () => {
  it("maps all dashboard sections", () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const quest = Quest.create({
      characterId: character.getId().toString(),
      title: "Daily task",
      type: QuestType.DAILY,
      difficulty: QuestDifficulty.SMALL,
      skillAllocations: [{ skillId: "550e8400-e29b-41d4-a716-446655440001", xp: 10 }],
    });
    const category = SkillCategory.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440010",
      name: "Backend",
      displayOrder: 1,
    });
    const skill = Skill.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440001",
      categoryId: category.getId().toString(),
      name: "Node.js",
      slug: "node-js",
      displayOrder: 1,
      description: null,
      parentSkillId: null,
      isCustom: false,
    });
    const progress = CharacterSkill.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440020",
      characterId: character.getId().toString(),
      skillId: skill.getId().toString(),
      xp: 25,
      masteryLevel: "SUPERFICIAL",
      masteryOverridden: false,
      lastXpAt: new Date("2026-08-01T12:00:00.000Z"),
      createdAt: new Date("2026-08-01T12:00:00.000Z"),
      updatedAt: new Date("2026-08-01T12:00:00.000Z"),
    });
    const transaction = XpTransaction.createFromStreakBonus({
      characterId: character.getId().toString(),
      amount: 10,
      description: "Streak bonus: 3 days",
    });
    const streak = Streak.create({ characterId: character.getId().toString() });
    const referenceDate = new Date("2026-09-14T15:00:00.000Z");

    const response = presentDashboard({
      character,
      calendarDay: "2026-09-14",
      todayQuests: [quest],
      missionsByQuestId: new Map([[quest.getId().toString(), []]]),
      topSkills: [{ category, skill, progress }],
      recentTransactions: [transaction],
      streak,
      activityHeatmap: buildMonthHeatmap(
        [{ calendarDay: "2026-09-14", totalXp: 10 }],
        "2026-09-14",
      ),
      staleSkills: [{ category, skill, progress }],
      referenceDate,
    });

    expect(response.character.name).toBe("Leone");
    expect(response.calendarDay).toBe("2026-09-14");
    expect(response.todayQuests).toHaveLength(1);
    expect(response.topSkills[0]?.categoryName).toBe("Backend");
    expect(response.recentTransactions).toHaveLength(1);
    expect(response.streak.currentCount).toBe(0);
    expect(response.streak.activityHeatmap?.days).toBe(30);
    expect(response.staleSkills).toHaveLength(1);
  });
});
