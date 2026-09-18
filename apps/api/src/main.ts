import { loadEnv } from "./infrastructure/config/loadEnv.js";
import DatabasePool from "./infrastructure/database/DatabasePool.js";
import MigrationRunner from "./infrastructure/database/migration/MigrationRunner.js";
import { createServer } from "./interfaces/http/server.js";

async function bootstrap(): Promise<void> {
  const env = loadEnv();
  DatabasePool.getInstance(env.databaseUrl);

  await MigrationRunner.run();

  const app = createServer();

  const server = app.listen(env.port, () => {
    console.log(`[gamefication-api] listening on http://localhost:${env.port}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[gamefication-api] ${signal} received, shutting down`);
    server.close();
    await DatabasePool.getInstance().close();
    process.exit(0);
  };

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown startup error";
  console.error(`[gamefication-api] failed to start: ${message}`);
  process.exit(1);
});
