import type { EvidenceType } from "../../domain/enum/EvidenceType.js";
import type Achievement from "../../domain/achievement/Achievement.js";
import type AchievementUnlock from "../../domain/achievement/AchievementUnlock.js";
import type Character from "../../domain/character/Character.js";
import type XpTransaction from "../../domain/xp/XpTransaction.js";

export type AchievementUnlockEvidence = {
  type: EvidenceType;
  value: string;
  description: string | null;
};

export type AchievementUnlockSnapshot = {
  achievement: Achievement;
  unlock: AchievementUnlock;
  character: Character;
  xpTransaction: XpTransaction | null;
  evidence: AchievementUnlockEvidence | null;
};

export default interface AchievementUnlockRepository {
  persist(snapshot: AchievementUnlockSnapshot): Promise<void>;
}
