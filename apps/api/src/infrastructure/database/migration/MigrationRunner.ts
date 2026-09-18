import type pg from "pg";

import DatabasePool from "../DatabasePool.js";
import MigrationError from "../../exception/MigrationError.js";
import MigrationLoader, { type MigrationDefinition } from "./MigrationLoader.js";

const LEDGER_TABLE = "schema_migrations";
const ADVISORY_LOCK_ID = 839_271;

type AppliedMigration = {
  version: string;
  checksum: string;
};

export default class MigrationRunner {
  static async run(pool?: pg.Pool): Promise<void> {
    const db = pool ?? DatabasePool.getInstance().getPool();
    const client = await db.connect();

    try {
      await client.query("SELECT pg_advisory_lock($1)", [ADVISORY_LOCK_ID]);
      await this.ensureLedger(client);

      const migrations = await MigrationLoader.load();
      const applied = await this.getAppliedMigrations(client);

      for (const migration of migrations) {
        await this.applyMigration(client, migration, applied);
      }
    } finally {
      await client.query("SELECT pg_advisory_unlock($1)", [ADVISORY_LOCK_ID]);
      client.release();
    }
  }

  private static async ensureLedger(client: pg.PoolClient): Promise<void> {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${LEDGER_TABLE} (
        version VARCHAR(12) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        checksum VARCHAR(64) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  private static async getAppliedMigrations(
    client: pg.PoolClient,
  ): Promise<Map<string, AppliedMigration>> {
    const result = await client.query<{ version: string; checksum: string }>(
      `SELECT version, checksum FROM ${LEDGER_TABLE}`,
    );

    return new Map(
      result.rows.map((row) => [
        row.version,
        { version: row.version, checksum: row.checksum },
      ]),
    );
  }

  private static async applyMigration(
    client: pg.PoolClient,
    migration: MigrationDefinition,
    applied: Map<string, AppliedMigration>,
  ): Promise<void> {
    const existing = applied.get(migration.version);

    if (existing) {
      if (existing.checksum !== migration.checksum) {
        throw new MigrationError(
          `Checksum mismatch for migration ${migration.version}__${migration.name}`,
        );
      }
      return;
    }

    await client.query("BEGIN");

    try {
      await client.query(migration.sql);
      await client.query(
        `INSERT INTO ${LEDGER_TABLE} (version, name, checksum) VALUES ($1, $2, $3)`,
        [migration.version, migration.name, migration.checksum],
      );
      await client.query("COMMIT");
      console.log(`[migrations] applied ${migration.version}__${migration.name}`);
    } catch (error) {
      await client.query("ROLLBACK");
      const message =
        error instanceof Error ? error.message : "Unknown migration error";
      throw new MigrationError(
        `Failed to apply migration ${migration.version}__${migration.name}: ${message}`,
      );
    }
  }
}
