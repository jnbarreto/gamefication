import type Achievement from "../../domain/achievement/Achievement.js";
import type AchievementUnlock from "../../domain/achievement/AchievementUnlock.js";

export type AchievementListEntry = {
  achievement: Achievement;
  unlock: AchievementUnlock | null;
};

export default interface AchievementRepository {
  findAllWithUnlocks(characterId: string): Promise<AchievementListEntry[]>;
  findBySlug(slug: string): Promise<Achievement | null>;
  findUnlockByCharacterAndAchievementId(
    characterId: string,
    achievementId: string,
  ): Promise<AchievementUnlock | null>;
}
