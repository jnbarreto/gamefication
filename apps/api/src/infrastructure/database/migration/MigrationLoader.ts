import { createHash } from "node:crypto";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import MigrationError from "../../exception/MigrationError.js";

export type MigrationDefinition = {
  version: string;
  name: string;
  sql: string;
  checksum: string;
};

const FILENAME_PATTERN = /^(\d{12})__(.+)\.ts$/;

export default class MigrationLoader {
  static async load(): Promise<MigrationDefinition[]> {
    const migrationsDir = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "migrations",
    );
    const files = await readdir(migrationsDir);
    const migrations: MigrationDefinition[] = [];

    for (const file of files) {
      const match = file.match(FILENAME_PATTERN);
      if (!match) {
        continue;
      }

      const [, version, name] = match;
      const module = await import(pathToFileURL(path.join(migrationsDir, file)).href);
      const sql = module.default;

      if (typeof sql !== "string" || sql.trim().length === 0) {
        throw new MigrationError(
          `Migration ${file} must default-export a non-empty SQL string`,
        );
      }

      migrations.push({
        version,
        name,
        sql,
        checksum: createHash("sha256").update(sql).digest("hex"),
      });
    }

    migrations.sort((left, right) => left.version.localeCompare(right.version));

    const versions = new Set<string>();
    for (const migration of migrations) {
      if (versions.has(migration.version)) {
        throw new MigrationError(`Duplicate migration version: ${migration.version}`);
      }
      versions.add(migration.version);
    }

    return migrations;
  }
}
