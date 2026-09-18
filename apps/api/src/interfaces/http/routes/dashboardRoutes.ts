import type { Express } from "express";

import { presentDashboard } from "../../../application/presenter/DashboardPresenter.js";
import GetCharacter from "../../../application/usecase/character/GetCharacter.js";
import GetDashboard from "../../../application/usecase/dashboard/GetDashboard.js";
import ListStaleSkills from "../../../application/usecase/skill/ListStaleSkills.js";
import ListTodayQuests from "../../../application/usecase/quest/ListTodayQuests.js";
import ListXpTransactions from "../../../application/usecase/xp/ListXpTransactions.js";
import PostgresCharacterRepository from "../../../infrastructure/repository/PostgresCharacterRepository.js";
import PostgresQuestMissionRepository from "../../../infrastructure/repository/PostgresQuestMissionRepository.js";
import PostgresQuestRepository from "../../../infrastructure/repository/PostgresQuestRepository.js";
import PostgresSkillRepository from "../../../infrastructure/repository/PostgresSkillRepository.js";
import PostgresStreakRepository from "../../../infrastructure/repository/PostgresStreakRepository.js";
import PostgresXpTransactionRepository from "../../../infrastructure/repository/PostgresXpTransactionRepository.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";

const timezone = process.env.TIMEZONE ?? "America/Sao_Paulo";
const characterRepository = new PostgresCharacterRepository();
const questRepository = new PostgresQuestRepository();
const missionRepository = new PostgresQuestMissionRepository();
const skillRepository = new PostgresSkillRepository();
const streakRepository = new PostgresStreakRepository();
const xpTransactionRepository = new PostgresXpTransactionRepository();
const getDashboard = new GetDashboard(
  new GetCharacter(characterRepository),
  new ListTodayQuests(characterRepository, questRepository, missionRepository, timezone),
  new ListXpTransactions(characterRepository, xpTransactionRepository),
  new ListStaleSkills(characterRepository, skillRepository),
  streakRepository,
  skillRepository,
  xpTransactionRepository,
  timezone,
);

export function registerDashboardRoutes(app: Express): void {
  app.get(
    "/api/v1/dashboard",
    asyncHandler(async (req, res) => {
      const result = await getDashboard.execute(requireAuth(req).userId);

      res.json(presentDashboard(result));
    }),
  );
}
