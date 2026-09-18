import { randomUUID } from "node:crypto";

import type QuestCompletionRepository from "../../application/repository/QuestCompletionRepository.js";
import type { QuestCompletionSnapshot } from "../../application/repository/QuestCompletionRepository.js";
import DatabasePool from "../database/DatabasePool.js";
import InfraError from "../exception/InfraError.js";

export default class PostgresQuestCompletionRepository implements QuestCompletionRepository {
  async persist(snapshot: QuestCompletionSnapshot): Promise<void> {
    const pool = DatabasePool.getInstance().getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { quest, character, characterSkills, streak, xpTransactions, evidence } =
        snapshot;

      await client.query(
        `
        UPDATE quests
        SET status = $1, completed_at = $2, updated_at = $3
        WHERE id = $4
        `,
        [
          quest.getStatus(),
          quest.getCompletedAt(),
          quest.getUpdatedAt(),
          quest.getId().toString(),
        ],
      );

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

      for (const characterSkill of characterSkills) {
        await client.query(
          `
          UPDATE character_skills
          SET
            xp = $1,
            mastery_level = $2,
            mastery_overridden = $3,
            last_xp_at = $4,
            updated_at = $5
          WHERE id = $6
          `,
          [
            characterSkill.getXp(),
            characterSkill.getMasteryLevel(),
            characterSkill.isMasteryOverridden(),
            characterSkill.getLastXpAt(),
            characterSkill.getUpdatedAt(),
            characterSkill.getId().toString(),
          ],
        );
      }

      await client.query(
        `
        UPDATE streaks
        SET
          current_count = $1,
          best_count = $2,
          last_activity_date = $3,
          bonuses_claimed = $4,
          updated_at = $5
        WHERE id = $6
        `,
        [
          streak.getCurrentCount(),
          streak.getBestCount(),
          streak.getLastActivityDay(),
          JSON.stringify(streak.getBonusesClaimed()),
          streak.getUpdatedAt(),
          streak.getId().toString(),
        ],
      );

      for (const transaction of xpTransactions) {
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
            transaction.getId().toString(),
            transaction.getCharacterId().toString(),
            transaction.getAmount().amount,
            transaction.getSourceType(),
            transaction.getSourceId()?.toString() ?? null,
            transaction.getSkillId()?.toString() ?? null,
            transaction.getDescription(),
            transaction.getCreatedAt(),
          ],
        );
      }

      if (evidence) {
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
          ) VALUES ($1, 'QUEST', $2, $3, $4, $5, NOW())
          `,
          [
            randomUUID(),
            quest.getId().toString(),
            evidence.type,
            evidence.value,
            evidence.description,
          ],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to persist quest completion",
      );
    } finally {
      client.release();
    }
  }
}
