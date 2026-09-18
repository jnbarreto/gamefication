import type Quest from "../../domain/quest/Quest.js";
import type QuestMission from "../../domain/quest/QuestMission.js";
import type Character from "../../domain/character/Character.js";
import type Streak from "../../domain/streak/Streak.js";
import type XpTransaction from "../../domain/xp/XpTransaction.js";
import type { QuestCompletionEvidence } from "../repository/QuestCompletionRepository.js";
import { presentCharacter } from "./CharacterPresenter.js";
import {
  presentXpTransaction,
  type XpTransactionResponse,
} from "./XpTransactionPresenter.js";

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

export type CreateQuestResponse = {
  quest: QuestResponse;
  warnings: string[];
};

export type QuestListResponse = {
  quests: QuestResponse[];
};

export type TodayQuestsResponse = {
  calendarDay: string;
  quests: QuestResponse[];
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

export type { XpTransactionResponse };

export type EvidenceResponse = {
  type: string;
  value: string;
  description: string | null;
};

export type CompleteQuestResponse = {
  quest: QuestResponse;
  character: ReturnType<typeof presentCharacter>;
  streak: StreakResponse;
  xpTransactions: XpTransactionResponse[];
  evidence: EvidenceResponse | null;
};

export function presentQuestMission(mission: QuestMission): QuestMissionResponse {
  return {
    id: mission.getId().toString(),
    questId: mission.getQuestId().toString(),
    title: mission.getTitle(),
    displayOrder: mission.getDisplayOrder(),
    isCompleted: mission.isMissionCompleted(),
    completedAt: mission.getCompletedAt()?.toISOString() ?? null,
  };
}

export function presentQuest(
  quest: Quest,
  missions: QuestMission[] = [],
): QuestResponse {
  return {
    id: quest.getId().toString(),
    characterId: quest.getCharacterId().toString(),
    title: quest.getTitle(),
    description: quest.getDescription(),
    type: quest.getType(),
    difficulty: quest.getDifficulty(),
    baseXp: quest.getBaseXp(),
    status: quest.getStatus(),
    skillAllocations: quest.getSkillAllocations().map((allocation) => ({
      skillId: allocation.getSkillId().toString(),
      xp: allocation.getXp(),
    })),
    missions: missions.map((mission) => presentQuestMission(mission)),
    dueDate: quest.getDueDate()?.toISOString() ?? null,
    completedAt: quest.getCompletedAt()?.toISOString() ?? null,
    notes: quest.getNotes(),
    createdAt: quest.getCreatedAt().toISOString(),
    updatedAt: quest.getUpdatedAt().toISOString(),
  };
}

export function presentQuestsWithMissions(
  quests: Quest[],
  missionsByQuestId: Map<string, QuestMission[]>,
): QuestResponse[] {
  return quests.map((quest) =>
    presentQuest(quest, missionsByQuestId.get(quest.getId().toString()) ?? []),
  );
}

export function presentCreateQuestResult(
  result: {
    quest: Quest;
    warnings: string[];
  },
  missions: QuestMission[] = [],
): CreateQuestResponse {
  return {
    quest: presentQuest(result.quest, missions),
    warnings: result.warnings,
  };
}

export function presentQuestList(
  quests: Quest[],
  missionsByQuestId: Map<string, QuestMission[]> = new Map(),
): QuestListResponse {
  return {
    quests: presentQuestsWithMissions(quests, missionsByQuestId),
  };
}

export function presentTodayQuests(result: {
  calendarDay: string;
  quests: Quest[];
  missionsByQuestId?: Map<string, QuestMission[]>;
}): TodayQuestsResponse {
  return {
    calendarDay: result.calendarDay,
    quests: presentQuestsWithMissions(
      result.quests,
      result.missionsByQuestId ?? new Map(),
    ),
  };
}

export function presentStreak(streak: Streak): StreakResponse {
  return {
    currentCount: streak.getCurrentCount(),
    bestCount: streak.getBestCount(),
    lastActivityDay: streak.getLastActivityDay(),
  };
}

function presentEvidence(evidence: QuestCompletionEvidence): EvidenceResponse {
  return {
    type: evidence.type,
    value: evidence.value,
    description: evidence.description,
  };
}

export function presentCompleteQuestResult(
  result: {
    quest: Quest;
    character: Character;
    streak: Streak;
    xpTransactions: XpTransaction[];
    evidence: QuestCompletionEvidence | null;
  },
  missions: QuestMission[] = [],
): CompleteQuestResponse {
  return {
    quest: presentQuest(result.quest, missions),
    character: presentCharacter(result.character),
    streak: presentStreak(result.streak),
    xpTransactions: result.xpTransactions.map((transaction) =>
      presentXpTransaction(transaction),
    ),
    evidence: result.evidence ? presentEvidence(result.evidence) : null,
  };
}
