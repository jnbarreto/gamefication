import { randomUUID } from "node:crypto";

import type AchievementUnlockRepository from "../../application/repository/AchievementUnlockRepository.js";
import type { AchievementUnlockSnapshot } from "../../application/repository/AchievementUnlockRepository.js";
import DatabasePool from "../database/DatabasePool.js";
import InfraError from "../exception/InfraError.js";

export default class PostgresAchievementUnlockRepository implements AchievementUnlockRepository {
  async persist(snapshot: AchievementUnlockSnapshot): Promise<void> {
    const pool = DatabasePool.getInstance().getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { unlock, character, xpTransaction, evidence } = snapshot;
      let evidenceId: string | null = null;

      if (evidence) {
        evidenceId = randomUUID();
        await client.query(
          `
          INSERT INTO evidences (
            id,
            entity_type,
            entity_id,
            type,
            value,
            description,
            created_at
          ) VALUES ($1, 'ACHIEVEMENT', $2, $3, $4, $5, NOW())
          `,
          [
            evidenceId,
            unlock.getId().toString(),
            evidence.type,
            evidence.value,
            evidence.description,
          ],
        );
      }

      await client.query(
        `
        INSERT INTO achievement_unlocks (
          id,
          character_id,
          achievement_id,
          unlocked_at,
          evidence_id
        ) VALUES ($1, $2, $3, $4, $5)
        `,
        [
          unlock.getId().toString(),
          unlock.getCharacterId().toString(),
          unlock.getAchievementId().toString(),
          unlock.getUnlockedAt(),
          evidenceId,
        ],
      );

      if (xpTransaction) {
        await client.query(
          `
          UPDATE characters
          SET total_xp = $1, updated_at = $2
          WHERE id = $3
          `,
          [
            character.getTotalXp(),
            character.getUpdatedAt(),
            character.getId().toString(),
          ],
        );

        await client.query(
          `
          INSERT INTO xp_transactions (
            id,
            character_id,
            amount,
            source_type,
            source_id,
            skill_id,
            description,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
          [
            xpTransaction.getId().toString(),
            xpTransaction.getCharacterId().toString(),
            xpTransaction.getAmount().amount,
            xpTransaction.getSourceType(),
            xpTransaction.getSourceId()?.toString() ?? null,
            xpTransaction.getSkillId()?.toString() ?? null,
            xpTransaction.getDescription(),
            xpTransaction.getCreatedAt(),
          ],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to persist achievement unlock",
      );
    } finally {
      client.release();
    }
  }
}
