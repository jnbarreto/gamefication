import type UserRepository from "../../application/repository/UserRepository.js";
import User from "../../domain/user/User.js";
import type { UserRole } from "../../domain/user/UserRole.js";
import Uuid from "../../domain/shared/Uuid.js";
import DatabasePool from "../database/DatabasePool.js";
import InfraError from "../exception/InfraError.js";

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  role: UserRole;
  character_id: string;
  created_at: Date;
  updated_at: Date;
};

export default class PostgresUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<UserRow>(
          `
          SELECT
            u.id,
            u.email,
            u.password_hash,
            u.display_name,
            u.role,
            c.id AS character_id,
            u.created_at,
            u.updated_at
          FROM users u
          INNER JOIN characters c ON c.user_id = u.id
          WHERE LOWER(u.email) = LOWER($1)
          LIMIT 1
          `,
          [email.trim()],
        );

      const row = result.rows[0];

      return row ? this.toDomain(row) : null;
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load user by email",
      );
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<UserRow>(
          `
          SELECT
            u.id,
            u.email,
            u.password_hash,
            u.display_name,
            u.role,
            c.id AS character_id,
            u.created_at,
            u.updated_at
          FROM users u
          INNER JOIN characters c ON c.user_id = u.id
          WHERE u.id = $1
          LIMIT 1
          `,
          [id],
        );

      const row = result.rows[0];

      return row ? this.toDomain(row) : null;
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load user by id",
      );
    }
  }

  async listAll(): Promise<User[]> {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<UserRow>(
          `
          SELECT
            u.id,
            u.email,
            u.password_hash,
            u.display_name,
            u.role,
            c.id AS character_id,
            u.created_at,
            u.updated_at
          FROM users u
          INNER JOIN characters c ON c.user_id = u.id
          ORDER BY u.created_at ASC
          `,
        );

      return result.rows.map((row) => this.toDomain(row));
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to list users",
      );
    }
  }

  async emailExists(email: string): Promise<boolean> {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<{ exists: boolean }>(
          `SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)) AS exists`,
          [email.trim()],
        );

      return result.rows[0]?.exists ?? false;
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to check email",
      );
    }
  }

  async save(user: User): Promise<void> {
    try {
      await DatabasePool.getInstance()
        .getPool()
        .query(
          `
          UPDATE users
          SET
            email = $1,
            password_hash = $2,
            display_name = $3,
            role = $4,
            updated_at = $5
          WHERE id = $6
          `,
          [
            user.getEmail(),
            user.getPasswordHash(),
            user.getDisplayName(),
            user.getRole(),
            user.getUpdatedAt(),
            user.getId().toString(),
          ],
        );
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to save user",
      );
    }
  }

  async createWithCharacter(user: User): Promise<void> {
    const pool = DatabasePool.getInstance().getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
        INSERT INTO users (
          id,
          email,
          password_hash,
          display_name,
          role,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          user.getId().toString(),
          user.getEmail(),
          user.getPasswordHash(),
          user.getDisplayName(),
          user.getRole(),
          user.getCreatedAt(),
          user.getUpdatedAt(),
        ],
      );

      const characterId = user.getCharacterId().toString();
      const streakId = Uuid.create().toString();

      await client.query(
        `
        INSERT INTO characters (
          id,
          user_id,
          name,
          character_class,
          specialization,
          subclass,
          career_goal,
          current_rank,
          total_xp
        ) VALUES ($1, $2, $3, $4, $5, NULL, NULL, NULL, 0)
        `,
        [
          characterId,
          user.getId().toString(),
          user.getDisplayName(),
          "Adventurer",
          "Generalist",
        ],
      );

      await client.query(
        `
        INSERT INTO streaks (
          id,
          character_id,
          current_count,
          best_count,
          last_activity_date,
          bonuses_claimed
        ) VALUES ($1, $2, 0, 0, NULL, '[]'::jsonb)
        `,
        [streakId, characterId],
      );

      await client.query(
        `
        INSERT INTO character_skills (
          id,
          character_id,
          skill_id,
          xp,
          mastery_level,
          mastery_overridden
        )
        SELECT
          gen_random_uuid(),
          $1,
          s.id,
          0,
          'UNKNOWN',
          FALSE
        FROM skills s
        `,
        [characterId],
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to create user with character",
      );
    } finally {
      client.release();
    }
  }

  private toDomain(row: UserRow): User {
    return User.rebuild({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      displayName: row.display_name,
      role: row.role,
      characterId: row.character_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
