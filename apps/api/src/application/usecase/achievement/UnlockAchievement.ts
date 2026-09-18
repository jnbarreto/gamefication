import ApplicationError from "../../exception/ApplicationError.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type Character from "../../../domain/character/Character.js";
import type Achievement from "../../../domain/achievement/Achievement.js";
import type AchievementUnlock from "../../../domain/achievement/AchievementUnlock.js";
import AchievementUnlockEntity from "../../../domain/achievement/AchievementUnlock.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type AchievementRepository from "../../repository/AchievementRepository.js";
import type AchievementUnlockRepository from "../../repository/AchievementUnlockRepository.js";
import type { AchievementUnlockEvidence } from "../../repository/AchievementUnlockRepository.js";
import XpAmount from "../../../domain/shared/XpAmount.js";
import XpTransaction from "../../../domain/xp/XpTransaction.js";

export type UnlockAchievementInput = {
  evidence?: AchievementUnlockEvidence;
};

export type UnlockAchievementResult = {
  achievement: Achievement;
  unlock: AchievementUnlock;
  character: Character;
  xpTransaction: XpTransaction | null;
  evidence: AchievementUnlockEvidence | null;
};

export default class UnlockAchievement {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly achievementRepository: AchievementRepository,
    private readonly achievementUnlockRepository: AchievementUnlockRepository,
  ) {}

  async execute(
    userId: string,
    slug: string,
    input: UnlockAchievementInput = {},
  ): Promise<UnlockAchievementResult> {
    const character = await this.characterRepository.findByUserId(userId);

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    const achievement = await this.achievementRepository.findBySlug(slug);

    if (!achievement) {
      throw new NotFoundError("Achievement not found");
    }

    const existingUnlock =
      await this.achievementRepository.findUnlockByCharacterAndAchievementId(
        character.getId().toString(),
        achievement.getId().toString(),
      );

    if (existingUnlock) {
      throw new ApplicationError("Achievement already unlocked");
    }

    const unlock = AchievementUnlockEntity.create({
      characterId: character.getId().toString(),
      achievementId: achievement.getId().toString(),
    });

    let xpTransaction: XpTransaction | null = null;

    if (achievement.getRewardXp() > 0) {
      character.addXp(XpAmount.from(achievement.getRewardXp()));
      xpTransaction = XpTransaction.createFromAchievement({
        characterId: character.getId().toString(),
        achievementUnlockId: unlock.getId().toString(),
        amount: achievement.getRewardXp(),
        description: `Achievement unlocked: ${achievement.getName()}`,
      });
    }

    await this.achievementUnlockRepository.persist({
      achievement,
      unlock,
      character,
      xpTransaction,
      evidence: input.evidence ?? null,
    });

    return {
      achievement,
      unlock,
      character,
      xpTransaction,
      evidence: input.evidence ?? null,
    };
  }
}
