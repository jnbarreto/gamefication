import NotFoundError from "../../exception/NotFoundError.js";
import type SkillRepository from "../../repository/SkillRepository.js";
import type StreakRepository from "../../repository/StreakRepository.js";
import type XpTransactionRepository from "../../repository/XpTransactionRepository.js";
import {
  buildMonthHeatmap,
  monthStart,
  type ActivityHeatmap,
} from "../../shared/buildActivityHeatmap.js";
import type GetCharacter from "../character/GetCharacter.js";
import type ListStaleSkills from "../skill/ListStaleSkills.js";
import type ListTodayQuests from "../quest/ListTodayQuests.js";
import type ListXpTransactions from "../xp/ListXpTransactions.js";

export const DASHBOARD_TOP_SKILLS_LIMIT = 5;
export const DASHBOARD_RECENT_TRANSACTIONS_LIMIT = 10;

export default class GetDashboard {
  constructor(
    private readonly getCharacter: GetCharacter,
    private readonly listTodayQuests: ListTodayQuests,
    private readonly listXpTransactions: ListXpTransactions,
    private readonly listStaleSkills: ListStaleSkills,
    private readonly streakRepository: StreakRepository,
    private readonly skillRepository: SkillRepository,
    private readonly xpTransactionRepository: XpTransactionRepository,
    private readonly timezone: string,
  ) {}

  async execute(userId: string, referenceDate: Date = new Date()) {
    const character = await this.getCharacter.execute(userId);
    const todayQuests = await this.listTodayQuests.execute(userId, referenceDate);
    const streak = await this.streakRepository.findByCharacterId(
      character.getId().toString(),
    );

    if (!streak) {
      throw new NotFoundError("Streak not found");
    }

    const skillTree = await this.skillRepository.findSkillTree(character.getId().toString());
    const topSkills = [...skillTree]
      .sort((left, right) => right.progress.getXp() - left.progress.getXp())
      .slice(0, DASHBOARD_TOP_SKILLS_LIMIT);
    const recentTransactions = (await this.listXpTransactions.execute(userId)).slice(
      0,
      DASHBOARD_RECENT_TRANSACTIONS_LIMIT,
    );
    const staleSkills = await this.listStaleSkills.execute(userId, referenceDate);
    const heatmapStartDay = monthStart(todayQuests.calendarDay);
    const dailyXp = await this.xpTransactionRepository.summarizeDailyXp(
      character.getId().toString(),
      heatmapStartDay,
      this.timezone,
    );
    const activityHeatmap: ActivityHeatmap = buildMonthHeatmap(
      dailyXp,
      todayQuests.calendarDay,
    );

    return {
      character,
      calendarDay: todayQuests.calendarDay,
      todayQuests: todayQuests.quests,
      missionsByQuestId: todayQuests.missionsByQuestId,
      topSkills,
      recentTransactions,
      streak,
      activityHeatmap,
      staleSkills: staleSkills.entries,
      referenceDate,
    };
  }
}
