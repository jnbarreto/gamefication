import cors from "cors";
import express from "express";

import DatabasePool from "../../infrastructure/database/DatabasePool.js";
import { asyncHandler } from "./middleware/asyncHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authenticate } from "./middleware/authenticate.js";
import { registerAchievementRoutes } from "./routes/achievementRoutes.js";
import { registerAuthRoutes } from "./routes/authRoutes.js";
import { registerCharacterRoutes } from "./routes/characterRoutes.js";
import { registerDashboardRoutes } from "./routes/dashboardRoutes.js";
import { registerDebugRoutes } from "./routes/debugRoutes.js";
import { registerQuestRoutes } from "./routes/questRoutes.js";
import { registerSkillRoutes } from "./routes/skillRoutes.js";
import { registerUserRoutes } from "./routes/userRoutes.js";
import { registerXpRoutes } from "./routes/xpRoutes.js";

const SERVICE_NAME = "gamefication-api";
const SERVICE_VERSION = "0.1.0";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(authenticate);

  app.get(
    "/api/v1/health",
    asyncHandler(async (_req, res) => {
      const database = await DatabasePool.getInstance().ping();

      if (!database.ok) {
        res.status(503).json({
          status: "degraded",
          service: SERVICE_NAME,
          version: SERVICE_VERSION,
          database: "disconnected",
          error: database.error,
        });
        return;
      }

      res.json({
        status: "ok",
        service: SERVICE_NAME,
        version: SERVICE_VERSION,
        database: "connected",
      });
    }),
  );

  registerAuthRoutes(app);
  registerUserRoutes(app);
  registerDebugRoutes(app);
  registerDashboardRoutes(app);
  registerCharacterRoutes(app);
  registerSkillRoutes(app);
  registerQuestRoutes(app);
  registerXpRoutes(app);
  registerAchievementRoutes(app);

  app.use(errorHandler);

  return app;
}
