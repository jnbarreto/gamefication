import type { EvidenceType } from "../../domain/enum/EvidenceType.js";
import type Character from "../../domain/character/Character.js";
import type Quest from "../../domain/quest/Quest.js";
import type CharacterSkill from "../../domain/skill/CharacterSkill.js";
import type Streak from "../../domain/streak/Streak.js";
import type XpTransaction from "../../domain/xp/XpTransaction.js";

export type QuestCompletionEvidence = {
  type: EvidenceType;
  value: string;
  description: string | null;
};

export type QuestCompletionSnapshot = {
  quest: Quest;
  character: Character;
  characterSkills: CharacterSkill[];
  streak: Streak;
  xpTransactions: XpTransaction[];
  evidence: QuestCompletionEvidence | null;
};

export default interface QuestCompletionRepository {
  persist(snapshot: QuestCompletionSnapshot): Promise<void>;
}
