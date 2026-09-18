import DatabaseConnectionError from "../exception/DatabaseConnectionError.js";

type EnvConfig = {
  port: number;
  databaseUrl: string;
  timezone: string;
};

export function loadEnv(): EnvConfig {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new DatabaseConnectionError("DATABASE_URL environment variable is required");
  }

  const port = Number(process.env.PORT ?? 3000);
  if (Number.isNaN(port) || port <= 0) {
    throw new DatabaseConnectionError("PORT must be a positive number");
  }

  return {
    port,
    databaseUrl,
    timezone: process.env.TIMEZONE ?? "America/Sao_Paulo",
  };
}
