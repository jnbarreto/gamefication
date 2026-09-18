import { randomUUID } from "node:crypto";

import type QuestRepository from "../../application/repository/QuestRepository.js";
import type { ListQuestsFilter } from "../../application/repository/QuestRepository.js";
import Quest from "../../domain/quest/Quest.js";
import DatabasePool from "../database/DatabasePool.js";
import InfraError from "../exception/InfraError.js";

type QuestRow = {
  id: string;
  character_id: string;
  title: string;
  description: string | null;
  type: string;
  difficulty: string;
  base_xp: number;
  status: string;
  due_date: Date | null;
  completed_at: Date | null;
  notes: string | null;
  calendar_day: string | null;
  calendar_week_start: string | null;
  created_at: Date;
  updated_at: Date;
  skill_id: string | null;
  xp_amount: number | null;
};

type GroupedQuestRow = QuestRow & {
  skill_id: null;
  xp_amount: null;
};

export default class PostgresQuestRepository implements QuestRepository {
  async save(quest: Quest): Promise<void> {
    const pool = DatabasePool.getInstance().getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
        INSERT INTO quests (
          id,
          character_id,
          title,
          description,
          type,
          difficulty,
          base_xp,
          status,
          due_date,
          completed_at,
          notes,
          calendar_day,
          calendar_week_start,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `,
        [
          quest.getId().toString(),
          quest.getCharacterId().toString(),
          quest.getTitle(),
          quest.getDescription(),
          quest.getType(),
          quest.getDifficulty(),
          quest.getBaseXp(),
          quest.getStatus(),
          quest.getDueDate(),
          quest.getCompletedAt(),
          quest.getNotes(),
          quest.getCalendarDay(),
          quest.getCalendarWeekStart(),
          quest.getCreatedAt(),
          quest.getUpdatedAt(),
        ],
      );

      for (const allocation of quest.getSkillAllocations()) {
        await client.query(
          `
          INSERT INTO quest_skill_allocations (
            id,
            quest_id,
            skill_id,
            xp_amount
          ) VALUES ($1, $2, $3, $4)
          `,
          [
            randomUUID(),
            quest.getId().toString(),
            allocation.getSkillId().toString(),
            allocation.getXp(),
          ],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to save quest",
      );
    } finally {
      client.release();
    }
  }

  async update(quest: Quest): Promise<void> {
    const pool = DatabasePool.getInstance().getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
        UPDATE quests
        SET
          title = $1,
          description = $2,
          type = $3,
          difficulty = $4,
          base_xp = $5,
          status = $6,
          updated_at = $7
        WHERE id = $8
        `,
        [
          quest.getTitle(),
          quest.getDescription(),
          quest.getType(),
          quest.getDifficulty(),
          quest.getBaseXp(),
          quest.getStatus(),
          quest.getUpdatedAt(),
          quest.getId().toString(),
        ],
      );

      await client.query(
        `DELETE FROM quest_skill_allocations WHERE quest_id = $1`,
        [quest.getId().toString()]
      );

      for (const allocation of quest.getSkillAllocations()) {
        await client.query(
          `
          INSERT INTO quest_skill_allocations (
            id,
            quest_id,
            skill_id,
            xp_amount
          ) VALUES ($1, $2, $3, $4)
          `,
          [
            randomUUID(),
            quest.getId().toString(),
            allocation.getSkillId().toString(),
            allocation.getXp(),
          ],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to update quest",
      );
    } finally {
      client.release();
    }
  }

  async findById(questId: string): Promise<Quest | null> {
    const quests = await this.queryQuests("q.id = $1", [questId]);

    return quests[0] ?? null;
  }

  async findByCharacterId(
    characterId: string,
    filter: ListQuestsFilter = {},
  ): Promise<Quest[]> {
    const conditions = ["q.character_id = $1"];
    const params: unknown[] = [characterId];

    if (filter.status) {
      params.push(filter.status);
      conditions.push(`q.status = $${params.length}`);
    }

    if (filter.type) {
      params.push(filter.type);
      conditions.push(`q.type = $${params.length}`);
    }

    if (filter.createdAfter) {
      params.push(filter.createdAfter);
      conditions.push(`q.created_at >= $${params.length}`);
    }

    return this.queryQuests(conditions.join(" AND "), params);
  }

  async findDailyQuestsForCalendarDay(
    characterId: string,
    calendarDay: string,
    _timezone: string,
  ): Promise<Quest[]> {
    return this.queryQuests(
      `
      q.character_id = $1
      AND q.type = 'DAILY'
      AND q.status != 'CANCELLED'
      AND q.calendar_day = $2::date
      `,
      [characterId, calendarDay],
    );
  }

  async countDailyQuestsForCalendarDay(
    characterId: string,
    _calendarDay: string,
    _timezone: string,
  ): Promise<number> {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<{ count: string }>(
          `
          SELECT COUNT(*)::text AS count
          FROM quests
          WHERE character_id = $1
            AND type = 'DAILY'
            AND status != 'CANCELLED'
          `,
          [characterId],
        );

      return Number(result.rows[0]?.count ?? 0);
    } catch (error) {
      throw new InfraError(
        error instanceof Error
          ? error.message
          : "Failed to count daily quests for calendar day",
      );
    }
  }

  async rolloverDailyQuests(characterId: string, calendarDay: string): Promise<void> {
    const pool = DatabasePool.getInstance().getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
        UPDATE quests
        SET
          status = 'TODO',
          completed_at = NULL,
          calendar_day = $2::date,
          updated_at = NOW()
        WHERE character_id = $1
          AND type = 'DAILY'
          AND status != 'CANCELLED'
          AND (calendar_day IS NULL OR calendar_day < $2::date)
        `,
        [characterId, calendarDay],
      );

      await client.query(
        `
        UPDATE quest_missions qm
        SET
          is_completed = FALSE,
          completed_at = NULL,
          updated_at = NOW()
        FROM quests q
        WHERE qm.quest_id = q.id
          AND q.character_id = $1
          AND q.type = 'DAILY'
          AND q.status != 'CANCELLED'
          AND q.calendar_day = $2::date
        `,
        [characterId, calendarDay],
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to rollover daily quests",
      );
    } finally {
      client.release();
    }
  }

  async rolloverWeeklyQuests(
    characterId: string,
    calendarWeekStart: string,
  ): Promise<void> {
    const pool = DatabasePool.getInstance().getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
        UPDATE quests
        SET
          status = 'TODO',
          completed_at = NULL,
          calendar_week_start = $2::date,
          updated_at = NOW()
        WHERE character_id = $1
          AND type = 'WEEKLY'
          AND status != 'CANCELLED'
          AND (calendar_week_start IS NULL OR calendar_week_start < $2::date)
        `,
        [characterId, calendarWeekStart],
      );

      await client.query(
        `
        UPDATE quest_missions qm
        SET
          is_completed = FALSE,
          completed_at = NULL,
          updated_at = NOW()
        FROM quests q
        WHERE qm.quest_id = q.id
          AND q.character_id = $1
          AND q.type = 'WEEKLY'
          AND q.status != 'CANCELLED'
          AND q.calendar_week_start = $2::date
        `,
        [characterId, calendarWeekStart],
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to rollover weekly quests",
      );
    } finally {
      client.release();
    }
  }

  private async queryQuests(whereClause: string, params: unknown[]): Promise<Quest[]> {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<QuestRow>(
          `
          SELECT
            q.id,
            q.character_id,
            q.title,
            q.description,
            q.type,
            q.difficulty,
            q.base_xp,
            q.status,
            q.due_date,
            q.completed_at,
            q.notes,
            q.calendar_day,
            q.calendar_week_start,
            q.created_at,
            q.updated_at,
            qsa.skill_id,
            qsa.xp_amount
          FROM quests q
          LEFT JOIN quest_skill_allocations qsa ON qsa.quest_id = q.id
          WHERE ${whereClause}
          ORDER BY q.created_at DESC, qsa.skill_id ASC
          `,
          params,
        );

      return this.groupRows(result.rows);
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load quests",
      );
    }
  }

  private groupRows(rows: QuestRow[]): Quest[] {
    const grouped = new Map<
      string,
      {
        quest: GroupedQuestRow;
        allocations: Array<{ skillId: string; xp: number }>;
      }
    >();

    for (const row of rows) {
      let entry = grouped.get(row.id);

      if (!entry) {
        entry = {
          quest: {
            ...row,
            skill_id: null,
            xp_amount: null,
          },
          allocations: [],
        };
        grouped.set(row.id, entry);
      }

      if (row.skill_id && row.xp_amount !== null) {
        entry.allocations.push({
          skillId: row.skill_id,
          xp: row.xp_amount,
        });
      }
    }

    return [...grouped.values()].map(({ quest, allocations }) =>
      Quest.rebuild({
        id: quest.id,
        characterId: quest.character_id,
        title: quest.title,
        description: quest.description,
        type: quest.type,
        difficulty: quest.difficulty,
        baseXp: quest.base_xp,
        status: quest.status,
        skillAllocations: allocations,
        dueDate: quest.due_date,
        completedAt: quest.completed_at,
        notes: quest.notes,
        calendarDay: quest.calendar_day,
        calendarWeekStart: quest.calendar_week_start,
        createdAt: quest.created_at,
        updatedAt: quest.updated_at,
      }),
    );
  }
}
