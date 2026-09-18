import type XpTransactionRepository from "../../application/repository/XpTransactionRepository.js";
import type {
  DailyXpSummary,
  ListXpTransactionsFilter,
} from "../../application/repository/XpTransactionRepository.js";
import XpTransaction from "../../domain/xp/XpTransaction.js";
import DatabasePool from "../database/DatabasePool.js";
import InfraError from "../exception/InfraError.js";

type XpTransactionRow = {
  id: string;
  character_id: string;
  amount: number;
  source_type: string;
  source_id: string | null;
  skill_id: string | null;
  description: string;
  created_at: Date;
};

export default class PostgresXpTransactionRepository implements XpTransactionRepository {
  async findByCharacterId(
    characterId: string,
    filter: ListXpTransactionsFilter = {},
  ): Promise<XpTransaction[]> {
    const conditions = ["character_id = $1"];
    const params: unknown[] = [characterId];

    if (filter.createdAfter) {
      params.push(filter.createdAfter);
      conditions.push(`created_at >= $${params.length}`);
    }

    if (filter.skillId) {
      params.push(filter.skillId);
      conditions.push(`skill_id = $${params.length}`);
    }

    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<XpTransactionRow>(
          `
          SELECT
            id,
            character_id,
            amount,
            source_type,
            source_id,
            skill_id,
            description,
            created_at
          FROM xp_transactions
          WHERE ${conditions.join(" AND ")}
          ORDER BY created_at DESC
          `,
          params,
        );

      return result.rows.map((row) =>
        XpTransaction.rebuild({
          id: row.id,
          characterId: row.character_id,
          amount: row.amount,
          sourceType: row.source_type,
          sourceId: row.source_id,
          skillId: row.skill_id,
          description: row.description,
          createdAt: row.created_at,
        }),
      );
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load XP transactions",
      );
    }
  }

  async summarizeDailyXp(
    characterId: string,
    fromCalendarDay: string,
    timezone: string,
  ): Promise<DailyXpSummary[]> {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<{ calendar_day: string; total_xp: number }>(
          `
          SELECT
            to_char((created_at AT TIME ZONE $3)::date, 'YYYY-MM-DD') AS calendar_day,
            SUM(amount)::int AS total_xp
          FROM xp_transactions
          WHERE character_id = $1
            AND (created_at AT TIME ZONE $3)::date >= $2::date
          GROUP BY (created_at AT TIME ZONE $3)::date
          ORDER BY calendar_day ASC
          `,
          [characterId, fromCalendarDay, timezone],
        );

      return result.rows.map((row) => ({
        calendarDay: row.calendar_day,
        totalXp: row.total_xp,
      }));
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to summarize daily XP",
      );
    }
  }
}
