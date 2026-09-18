import type QuestMissionRepository from "../../application/repository/QuestMissionRepository.js";
import QuestMission from "../../domain/quest/QuestMission.js";
import DatabasePool from "../database/DatabasePool.js";
import InfraError from "../exception/InfraError.js";

type QuestMissionRow = {
  id: string;
  quest_id: string;
  title: string;
  display_order: number;
  is_completed: boolean;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export default class PostgresQuestMissionRepository implements QuestMissionRepository {
  async saveAll(missions: QuestMission[]): Promise<void> {
    if (missions.length === 0) {
      return;
    }

    const pool = DatabasePool.getInstance().getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (const mission of missions) {
        await client.query(
          `
          INSERT INTO quest_missions (
            id,
            quest_id,
            title,
            display_order,
            is_completed,
            completed_at,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
          [
            mission.getId().toString(),
            mission.getQuestId().toString(),
            mission.getTitle(),
            mission.getDisplayOrder(),
            mission.isMissionCompleted(),
            mission.getCompletedAt(),
            mission.getCreatedAt(),
            mission.getUpdatedAt(),
          ],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to save quest missions",
      );
    } finally {
      client.release();
    }
  }

  async findByQuestId(questId: string): Promise<QuestMission[]> {
    const missionsByQuestId = await this.findByQuestIds([questId]);

    return missionsByQuestId.get(questId) ?? [];
  }

  async findByQuestIds(questIds: string[]): Promise<Map<string, QuestMission[]>> {
    const grouped = new Map<string, QuestMission[]>();

    if (questIds.length === 0) {
      return grouped;
    }

    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<QuestMissionRow>(
          `
          SELECT
            id,
            quest_id,
            title,
            display_order,
            is_completed,
            completed_at,
            created_at,
            updated_at
          FROM quest_missions
          WHERE quest_id = ANY($1::uuid[])
          ORDER BY display_order ASC, title ASC
          `,
          [questIds],
        );

      for (const row of result.rows) {
        const missions = grouped.get(row.quest_id) ?? [];
        missions.push(this.toMission(row));
        grouped.set(row.quest_id, missions);
      }

      return grouped;
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load quest missions",
      );
    }
  }

  async findById(missionId: string): Promise<QuestMission | null> {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<QuestMissionRow>(
          `
          SELECT
            id,
            quest_id,
            title,
            display_order,
            is_completed,
            completed_at,
            created_at,
            updated_at
          FROM quest_missions
          WHERE id = $1
          LIMIT 1
          `,
          [missionId],
        );

      const row = result.rows[0];

      if (!row) {
        return null;
      }

      return this.toMission(row);
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load quest mission",
      );
    }
  }

  async update(mission: QuestMission): Promise<void> {
    try {
      await DatabasePool.getInstance()
        .getPool()
        .query(
          `
          UPDATE quest_missions
          SET
            title = $2,
            display_order = $3,
            is_completed = $4,
            completed_at = $5,
            updated_at = $6
          WHERE id = $1
          `,
          [
            mission.getId().toString(),
            mission.getTitle(),
            mission.getDisplayOrder(),
            mission.isMissionCompleted(),
            mission.getCompletedAt(),
            mission.getUpdatedAt(),
          ],
        );
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to update quest mission",
      );
    }
  }

  async deleteById(missionId: string): Promise<void> {
    try {
      await DatabasePool.getInstance()
        .getPool()
        .query(`DELETE FROM quest_missions WHERE id = $1`, [missionId]);
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to delete quest mission",
      );
    }
  }

  private toMission(row: QuestMissionRow): QuestMission {
    return QuestMission.rebuild({
      id: row.id,
      questId: row.quest_id,
      title: row.title,
      displayOrder: row.display_order,
      isCompleted: row.is_completed,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
