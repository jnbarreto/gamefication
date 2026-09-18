import pg from "pg";

import DatabaseConnectionError from "../exception/DatabaseConnectionError.js";

type PingResult = { ok: true } | { ok: false; error: string };

export default class DatabasePool {
  private static instance: DatabasePool | null = null;

  private readonly pool: pg.Pool;

  private constructor(connectionString: string) {
    this.pool = new pg.Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  static getInstance(connectionString?: string): DatabasePool {
    if (!DatabasePool.instance) {
      const url = connectionString ?? process.env.DATABASE_URL;
      if (!url) {
        throw new DatabaseConnectionError(
          "DATABASE_URL environment variable is required",
        );
      }
      DatabasePool.instance = new DatabasePool(url);
    }

    return DatabasePool.instance;
  }

  getPool(): pg.Pool {
    return this.pool;
  }

  async ping(): Promise<PingResult> {
    try {
      await this.pool.query("SELECT 1");
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown database error";
      return { ok: false, error: message };
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
    DatabasePool.instance = null;
  }
}
