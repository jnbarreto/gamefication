import type CharacterProgressRepository from "../../application/repository/CharacterProgressRepository.js";
import DatabasePool from "../database/DatabasePool.js";
import InfraError from "../exception/InfraError.js";

export default class PostgresCharacterProgressRepository implements CharacterProgressRepository {
  async resetForCharacter(characterId: string): Promise<void> {
    const pool = DatabasePool.getInstance().getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
        UPDATE characters
        SET total_xp = 0, updated_at = NOW()
        WHERE id = $1
        `,
        [characterId],
      );

      await client.query(
        `
        UPDATE character_skills
        SET
          xp = 0,
          mastery_level = 'UNKNOWN',
          mastery_overridden = FALSE,
          last_xp_at = NULL,
          updated_at = NOW()
        WHERE character_id = $1
        `,
        [characterId],
      );

      await client.query(`DELETE FROM xp_transactions WHERE character_id = $1`, [characterId]);

      await client.query(
        `
        UPDATE streaks
        SET
          current_count = 0,
          best_count = 0,
          last_activity_date = NULL,
          bonuses_claimed = '[]'::jsonb,
          updated_at = NOW()
        WHERE character_id = $1
        `,
        [characterId],
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to reset character progress",
      );
    } finally {
      client.release();
    }
  }
}
