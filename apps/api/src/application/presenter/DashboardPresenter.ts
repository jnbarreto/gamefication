import type Character from "../../domain/character/Character.js";
import type Quest from "../../domain/quest/Quest.js";
import type QuestMission from "../../domain/quest/QuestMission.js";
import type Streak from "../../domain/streak/Streak.js";
import type XpTransaction from "../../domain/xp/XpTransaction.js";
import type { ActivityHeatmap } from "../shared/buildActivityHeatmap.js";
import type { SkillTreeEntry } from "../repository/SkillRepository.js";
import { presentCharacter } from "./CharacterPresenter.js";
import {
  presentStreak,
  presentTodayQuests,
  type StreakResponse,
} from "./QuestPresenter.js";
import {
  presentSkillProgress,
  presentStaleSkills,
  type SkillProgressResponse,
  type StaleSkillResponse,
} from "./SkillPresenter.js";
import {
  presentXpTransaction,
  type XpTransactionResponse,
} from "./XpTransactionPresenter.js";

export type TopSkillResponse = SkillProgressResponse & {
  categoryId: string;
  categoryName: string;
};

export type DashboardResponse = {
  character: ReturnType<typeof presentCharacter>;
  calendarDay: string;
  todayQuests: ReturnType<typeof presentTodayQuests>["quests"];
  topSkills: TopSkillResponse[];
  recentTransactions: XpTransactionResponse[];
  streak: StreakResponse;
  staleSkills: StaleSkillResponse[];
};

export function presentTopSkills(
  entries: SkillTreeEntry[],
  referenceDate: Date = new Date(),
): TopSkillResponse[] {
  return entries.map((entry) => ({
    ...presentSkillProgress(entry, referenceDate),
    categoryId: entry.category.getId().toString(),
    categoryName: entry.category.getName(),
  }));
}

export function presentDashboard(result: {
  character: Character;
  calendarDay: string;
  todayQuests: Quest[];
  missionsByQuestId: Map<string, QuestMission[]>;
  topSkills: SkillTreeEntry[];
  recentTransactions: XpTransaction[];
  streak: Streak;
  activityHeatmap: ActivityHeatmap;
  staleSkills: SkillTreeEntry[];
  referenceDate: Date;
}): DashboardResponse {
  return {
    character: presentCharacter(result.character),
    calendarDay: result.calendarDay,
    todayQuests: presentTodayQuests({
      calendarDay: result.calendarDay,
      quests: result.todayQuests,
      missionsByQuestId: result.missionsByQuestId,
    }).quests,
    topSkills: presentTopSkills(result.topSkills, result.referenceDate),
    recentTransactions: result.recentTransactions.map((transaction) =>
      presentXpTransaction(transaction),
    ),
    streak: {
      ...presentStreak(result.streak),
      activityHeatmap: {
        days: result.activityHeatmap.days,
        cells: result.activityHeatmap.cells.map((cell) => ({
          day: cell.day,
          xp: cell.xp,
          level: cell.level,
          isFuture: cell.isFuture,
          isPadding: cell.isPadding,
        })),
      },
    },
    staleSkills: presentStaleSkills(result.staleSkills, result.referenceDate).skills,
  };
}
