import { loadEnv } from "../../config/loadEnv.js";
import DatabasePool from "../../database/DatabasePool.js";
import MigrationRunner from "./MigrationRunner.js";

async function run(): Promise<void> {
  loadEnv();
  DatabasePool.getInstance();

  await MigrationRunner.run();

  console.log("[migrations] all pending migrations applied");
  await DatabasePool.getInstance().close();
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown migration error";
  console.error(`[migrations] failed: ${message}`);
  process.exit(1);
});
