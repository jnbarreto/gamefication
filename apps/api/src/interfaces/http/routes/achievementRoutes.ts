import type { Express } from "express";

import {
  presentAchievementList,
  presentUnlockAchievementResult,
} from "../../../application/presenter/AchievementPresenter.js";
import ListAchievements from "../../../application/usecase/achievement/ListAchievements.js";
import UnlockAchievement from "../../../application/usecase/achievement/UnlockAchievement.js";
import PostgresAchievementRepository from "../../../infrastructure/repository/PostgresAchievementRepository.js";
import PostgresAchievementUnlockRepository from "../../../infrastructure/repository/PostgresAchievementUnlockRepository.js";
import PostgresCharacterRepository from "../../../infrastructure/repository/PostgresCharacterRepository.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { parseAchievementSlugParam } from "../validation/parseUnlockAchievementBody.js";
import { parseUnlockAchievementBody } from "../validation/parseUnlockAchievementBody.js";

const characterRepository = new PostgresCharacterRepository();
const achievementRepository = new PostgresAchievementRepository();
const achievementUnlockRepository = new PostgresAchievementUnlockRepository();
const listAchievements = new ListAchievements(
  characterRepository,
  achievementRepository,
);
const unlockAchievement = new UnlockAchievement(
  characterRepository,
  achievementRepository,
  achievementUnlockRepository,
);

export function registerAchievementRoutes(app: Express): void {
  app.get(
    "/api/v1/achievements",
    asyncHandler(async (req, res) => {
      const entries = await listAchievements.execute(requireAuth(req).userId);

      res.json(presentAchievementList(entries));
    }),
  );

  app.post(
    "/api/v1/achievements/:slug/unlock",
    asyncHandler(async (req, res) => {
      const slug = parseAchievementSlugParam(req.params.slug);
      const input = parseUnlockAchievementBody(req.body);
      const result = await unlockAchievement.execute(requireAuth(req).userId, slug, input);

      res.status(201).json(presentUnlockAchievementResult(result));
    }),
  );
}
