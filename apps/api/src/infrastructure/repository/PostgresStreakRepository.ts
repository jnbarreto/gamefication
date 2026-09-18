import type StreakRepository from "../../application/repository/StreakRepository.js";
import Streak from "../../domain/streak/Streak.js";
import DatabasePool from "../database/DatabasePool.js";
import InfraError from "../exception/InfraError.js";

type StreakRow = {
  id: string;
  character_id: string;
  current_count: number;
  best_count: number;
  last_activity_date: string | null;
  bonuses_claimed: number[];
  created_at: Date;
  updated_at: Date;
};

export default class PostgresStreakRepository implements StreakRepository {
  async findByCharacterId(characterId: string): Promise<Streak | null> {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<StreakRow>(
          `
          SELECT
            id,
            character_id,
            current_count,
            best_count,
            last_activity_date::text AS last_activity_date,
            bonuses_claimed,
            created_at,
            updated_at
          FROM streaks
          WHERE character_id = $1
          `,
          [characterId],
        );

      const row = result.rows[0];

      if (!row) {
        return null;
      }

      return Streak.rebuild({
        id: row.id,
        characterId: row.character_id,
        currentCount: row.current_count,
        bestCount: row.best_count,
        lastActivityDay: row.last_activity_date,
        bonusesClaimed: row.bonuses_claimed,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load streak",
      );
    }
  }
}
