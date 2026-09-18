import type AuthTokenRepository from "../../application/repository/AuthTokenRepository.js";
import type { AuthTokenRecord } from "../../application/repository/AuthTokenRepository.js";
import type { AuthTokenType } from "../../domain/auth/AuthTokenType.js";
import DatabasePool from "../database/DatabasePool.js";
import InfraError from "../exception/InfraError.js";

type AuthTokenRow = {
  id: string;
  user_id: string;
  token_hash: string;
  type: AuthTokenType;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
};

export default class PostgresAuthTokenRepository implements AuthTokenRepository {
  async create(record: AuthTokenRecord): Promise<void> {
    try {
      await DatabasePool.getInstance()
        .getPool()
        .query(
          `
          INSERT INTO auth_tokens (
            id,
            user_id,
            token_hash,
            type,
            expires_at,
            used_at,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            record.id,
            record.userId,
            record.tokenHash,
            record.type,
            record.expiresAt,
            record.usedAt,
            record.createdAt,
          ],
        );
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to create auth token",
      );
    }
  }

  async findValidByHash(
    tokenHash: string,
    type: AuthTokenType,
  ): Promise<AuthTokenRecord | null> {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<AuthTokenRow>(
          `
          SELECT
            id,
            user_id,
            token_hash,
            type,
            expires_at,
            used_at,
            created_at
          FROM auth_tokens
          WHERE token_hash = $1
            AND type = $2
            AND used_at IS NULL
            AND expires_at > NOW()
          LIMIT 1
          `,
          [tokenHash, type],
        );

      const row = result.rows[0];

      return row ? this.toRecord(row) : null;
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load auth token",
      );
    }
  }

  async invalidateActiveForUser(userId: string, type: AuthTokenType): Promise<void> {
    try {
      await DatabasePool.getInstance()
        .getPool()
        .query(
          `
          UPDATE auth_tokens
          SET used_at = NOW()
          WHERE user_id = $1
            AND type = $2
            AND used_at IS NULL
          `,
          [userId, type],
        );
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to invalidate auth tokens",
      );
    }
  }

  async markUsed(id: string, usedAt: Date): Promise<void> {
    try {
      await DatabasePool.getInstance()
        .getPool()
        .query(`UPDATE auth_tokens SET used_at = $1 WHERE id = $2`, [usedAt, id]);
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to mark auth token used",
      );
    }
  }

  private toRecord(row: AuthTokenRow): AuthTokenRecord {
    return {
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      type: row.type,
      expiresAt: row.expires_at,
      usedAt: row.used_at,
      createdAt: row.created_at,
    };
  }
}
