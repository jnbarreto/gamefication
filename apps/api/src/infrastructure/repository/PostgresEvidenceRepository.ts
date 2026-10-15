import type EvidenceRepository from "../../application/repository/EvidenceRepository.js";
import type { EvidenceRecord } from "../../application/repository/EvidenceRepository.js";
import DatabasePool from "../database/DatabasePool.js";
import InfraError from "../exception/InfraError.js";

type EvidenceRow = {
  id: string;
  entity_type: string;
  entity_id: string;
  type: string;
  value: string;
  description: string | null;
  created_at: Date;
};

export default class PostgresEvidenceRepository implements EvidenceRepository {
  async findByEntities(
    entityType: string,
    entityIds: string[],
  ): Promise<Map<string, EvidenceRecord>> {
    const map = new Map<string, EvidenceRecord>();

    if (entityIds.length === 0) {
      return map;
    }

    try {
      const pool = DatabasePool.getInstance().getPool();
      const result = await pool.query<EvidenceRow>(
        `
        SELECT DISTINCT ON (entity_id)
          id,
          entity_type,
          entity_id,
          type,
          value,
          description,
          created_at
        FROM evidences
        WHERE entity_type = $1 AND entity_id = ANY($2)
        ORDER BY entity_id, created_at DESC
        `,
        [entityType, entityIds],
      );

      for (const row of result.rows) {
        map.set(row.entity_id, {
          id: row.id,
          entityType: row.entity_type,
          entityId: row.entity_id,
          type: row.type,
          value: row.value,
          description: row.description,
          createdAt: row.created_at,
        });
      }

      return map;
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load evidences",
      );
    }
  }

  async findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<EvidenceRecord | null> {
    const map = await this.findByEntities(entityType, [entityId]);
    return map.get(entityId) ?? null;
  }
}
