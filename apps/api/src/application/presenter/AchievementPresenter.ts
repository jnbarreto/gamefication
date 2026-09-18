import type Achievement from "../../domain/achievement/Achievement.js";
import type AchievementUnlock from "../../domain/achievement/AchievementUnlock.js";
import type { AchievementListEntry } from "../repository/AchievementRepository.js";
import type Character from "../../domain/character/Character.js";
import type XpTransaction from "../../domain/xp/XpTransaction.js";
import type { AchievementUnlockEvidence } from "../repository/AchievementUnlockRepository.js";
import { presentCharacter } from "./CharacterPresenter.js";
import { presentXpTransaction } from "./XpTransactionPresenter.js";

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

export type EvidenceResponse = {
  type: string;
  value: string;
  description: string | null;
};

export type UnlockAchievementResponse = {
  achievement: AchievementResponse;
  character: ReturnType<typeof presentCharacter>;
  xpTransaction: ReturnType<typeof presentXpTransaction> | null;
  evidence: EvidenceResponse | null;
};

function presentEvidence(evidence: AchievementUnlockEvidence): EvidenceResponse {
  return {
    type: evidence.type,
    value: evidence.value,
    description: evidence.description,
  };
}

export function presentAchievement(
  achievement: Achievement,
  unlock: AchievementUnlock | null,
): AchievementResponse {
  return {
    id: achievement.getId().toString(),
    slug: achievement.getSlug(),
    name: achievement.getName(),
    description: achievement.getDescription(),
    category: achievement.getCategory(),
    rewardXp: achievement.getRewardXp(),
    unlocked: unlock !== null,
    unlockedAt: unlock?.getUnlockedAt().toISOString() ?? null,
  };
}

export function presentAchievementList(
  entries: AchievementListEntry[],
): AchievementListResponse {
  return {
    achievements: entries.map(({ achievement, unlock }) =>
      presentAchievement(achievement, unlock),
    ),
  };
}

export function presentUnlockAchievementResult(result: {
  achievement: Achievement;
  unlock: AchievementUnlock;
  character: Character;
  xpTransaction: XpTransaction | null;
  evidence: AchievementUnlockEvidence | null;
}): UnlockAchievementResponse {
  return {
    achievement: presentAchievement(result.achievement, result.unlock),
    character: presentCharacter(result.character),
    xpTransaction: result.xpTransaction
      ? presentXpTransaction(result.xpTransaction)
      : null,
    evidence: result.evidence ? presentEvidence(result.evidence) : null,
  };
}
