import type AchievementRepository from "../../application/repository/AchievementRepository.js";
import type { AchievementListEntry } from "../../application/repository/AchievementRepository.js";
import Achievement from "../../domain/achievement/Achievement.js";
import AchievementUnlock from "../../domain/achievement/AchievementUnlock.js";
import DatabasePool from "../database/DatabasePool.js";
import InfraError from "../exception/InfraError.js";

type AchievementRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  reward_xp: number;
  condition_type: string;
  unlock_id: string | null;
  unlock_character_id: string | null;
  unlocked_at: Date | null;
  evidence_id: string | null;
};

export default class PostgresAchievementRepository implements AchievementRepository {
  async findAllWithUnlocks(characterId: string): Promise<AchievementListEntry[]> {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<AchievementRow>(
          `
          SELECT
            a.id,
            a.slug,
            a.name,
            a.description,
            a.category,
            a.reward_xp,
            a.condition_type,
            au.id AS unlock_id,
            au.character_id AS unlock_character_id,
            au.unlocked_at,
            au.evidence_id
          FROM achievements a
          LEFT JOIN achievement_unlocks au
            ON au.achievement_id = a.id
            AND au.character_id = $1
          ORDER BY a.category ASC, a.name ASC
          `,
          [characterId],
        );

      return result.rows.map((row) => this.toListEntry(row, characterId));
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load achievements",
      );
    }
  }

  async findBySlug(slug: string): Promise<Achievement | null> {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<AchievementRow>(
          `
          SELECT
            a.id,
            a.slug,
            a.name,
            a.description,
            a.category,
            a.reward_xp,
            a.condition_type,
            NULL::uuid AS unlock_id,
            NULL::timestamptz AS unlocked_at,
            NULL::uuid AS evidence_id
          FROM achievements a
          WHERE a.slug = $1
          `,
          [slug],
        );

      const row = result.rows[0];

      if (!row) {
        return null;
      }

      return this.toAchievement(row);
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load achievement",
      );
    }
  }

  async findUnlockByCharacterAndAchievementId(
    characterId: string,
    achievementId: string,
  ): Promise<AchievementUnlock | null> {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<{
          id: string;
          character_id: string;
          achievement_id: string;
          unlocked_at: Date;
          evidence_id: string | null;
        }>(
          `
          SELECT id, character_id, achievement_id, unlocked_at, evidence_id
          FROM achievement_unlocks
          WHERE character_id = $1 AND achievement_id = $2
          `,
          [characterId, achievementId],
        );

      const row = result.rows[0];

      if (!row) {
        return null;
      }

      return AchievementUnlock.rebuild({
        id: row.id,
        characterId: row.character_id,
        achievementId: row.achievement_id,
        unlockedAt: row.unlocked_at,
        evidenceId: row.evidence_id,
      });
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load achievement unlock",
      );
    }
  }

  private toListEntry(row: AchievementRow, characterId: string): AchievementListEntry {
    return {
      achievement: this.toAchievement(row),
      unlock: row.unlock_id
        ? AchievementUnlock.rebuild({
            id: row.unlock_id,
            characterId: row.unlock_character_id ?? characterId,
            achievementId: row.id,
            unlockedAt: row.unlocked_at!,
            evidenceId: row.evidence_id,
          })
        : null,
    };
  }

  private toAchievement(row: AchievementRow): Achievement {
    return Achievement.rebuild({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      category: row.category,
      rewardXp: row.reward_xp,
      conditionType: row.condition_type,
    });
  }
}
