export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

export type HealthResponse = {
  status: string;
  service: string;
  version: string;
  database?: string;
  error?: string;
};

export type CharacterResponse = {
  id: string;
  name: string;
  characterClass: string;
  specialization: string;
  subclass: string | null;
  careerGoal: string | null;
  currentRank: string | null;
  totalXp: number;
  level: number;
  xpToNextLevel: number;
  progressToNextLevel: number;
  createdAt: string;
  updatedAt: string;
};

export type QuestSkillAllocationResponse = {
  skillId: string;
  xp: number;
};

export type QuestMissionResponse = {
  id: string;
  questId: string;
  title: string;
  displayOrder: number;
  isCompleted: boolean;
  completedAt: string | null;
};

export type QuestResponse = {
  id: string;
  characterId: string;
  title: string;
  description: string | null;
  type: string;
  difficulty: string;
  baseXp: number;
  status: string;
  skillAllocations: QuestSkillAllocationResponse[];
  missions: QuestMissionResponse[];
  dueDate: string | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ActivityHeatmapCellResponse = {
  day: string;
  xp: number;
  level: 0 | 1 | 2 | 3 | 4;
  isFuture: boolean;
  isPadding?: boolean;
};

export type ActivityHeatmapResponse = {
  days: number;
  cells: ActivityHeatmapCellResponse[];
};

export type StreakResponse = {
  currentCount: number;
  bestCount: number;
  lastActivityDay: string | null;
  activityHeatmap?: ActivityHeatmapResponse;
};

export type SkillProgressResponse = {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  parentSkillId: string | null;
  description: string | null;
  isCustom: boolean;
  xp: number;
  masteryLevel: string;
  masteryOverridden: boolean;
  lastXpAt: string | null;
  isStale: boolean;
};

export type TopSkillResponse = SkillProgressResponse & {
  categoryId: string;
  categoryName: string;
};

export type StaleSkillResponse = TopSkillResponse;

export type StaleSkillsResponse = {
  skills: StaleSkillResponse[];
};

export type XpTransactionResponse = {
  id: string;
  amount: number;
  sourceType: string;
  sourceId: string | null;
  skillId: string | null;
  description: string;
  createdAt: string;
};

export type XpTransactionListResponse = {
  transactions: XpTransactionResponse[];
};

export type DashboardResponse = {
  character: CharacterResponse;
  calendarDay: string;
  todayQuests: QuestResponse[];
  topSkills: TopSkillResponse[];
  recentTransactions: XpTransactionResponse[];
  streak: StreakResponse;
  staleSkills: StaleSkillResponse[];
};

export type SkillCategoryResponse = {
  id: string;
  name: string;
  displayOrder: number;
  isCustom: boolean;
  skills: SkillProgressResponse[];
};

export type SkillTreeResponse = {
  categories: SkillCategoryResponse[];
};

export type SkillMutationResponse = {
  skill: SkillProgressResponse;
};

export type CreateSkillRequest = {
  name: string;
  description?: string;
  categoryId?: string;
  parentSkillId?: string | null;
};

export type UpdateSkillRequest = {
  name?: string;
  description?: string | null;
  parentSkillId?: string | null;
};

export type QuestListResponse = {
  quests: QuestResponse[];
};

export type CreateQuestResponse = {
  quest: QuestResponse;
  warnings: string[];
};

export type StartQuestResponse = {
  quest: QuestResponse;
};

export type CompleteQuestResponse = {
  quest: QuestResponse;
  character: CharacterResponse;
  streak: StreakResponse;
  xpTransactions: XpTransactionResponse[];
  evidence: {
    type: string;
    value: string;
    description: string | null;
  } | null;
};

export type AchievementResponse = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  rewardXp: number;
  unlocked: boolean;
  unlockedAt: string | null;
};

export type AchievementListResponse = {
  achievements: AchievementResponse[];
};

export type UnlockAchievementResponse = {
  achievement: AchievementResponse;
  character: CharacterResponse;
  xpTransaction: XpTransactionResponse | null;
  evidence: {
    type: string;
    value: string;
    description: string | null;
  } | null;
};
