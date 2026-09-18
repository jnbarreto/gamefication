import type { Express } from "express";

import {
  presentCompleteQuestResult,
  presentCreateQuestResult,
  presentQuest,
  presentQuestList,
  presentQuestMission,
  presentTodayQuests,
} from "../../../application/presenter/QuestPresenter.js";
import CancelQuest from "../../../application/usecase/quest/CancelQuest.js";
import CompleteQuest from "../../../application/usecase/quest/CompleteQuest.js";
import CreateQuest from "../../../application/usecase/quest/CreateQuest.js";
import ListQuests from "../../../application/usecase/quest/ListQuests.js";
import ListTodayQuests from "../../../application/usecase/quest/ListTodayQuests.js";
import ReopenQuest from "../../../application/usecase/quest/ReopenQuest.js";
import StartQuest from "../../../application/usecase/quest/StartQuest.js";
import UpdateQuest from "../../../application/usecase/quest/UpdateQuest.js";
import UpdateQuestMission from "../../../application/usecase/quest/UpdateQuestMission.js";
import PostgresCharacterRepository from "../../../infrastructure/repository/PostgresCharacterRepository.js";
import PostgresCharacterSkillRepository from "../../../infrastructure/repository/PostgresCharacterSkillRepository.js";
import PostgresQuestCompletionRepository from "../../../infrastructure/repository/PostgresQuestCompletionRepository.js";
import PostgresQuestMissionRepository from "../../../infrastructure/repository/PostgresQuestMissionRepository.js";
import PostgresQuestRepository from "../../../infrastructure/repository/PostgresQuestRepository.js";
import PostgresStreakRepository from "../../../infrastructure/repository/PostgresStreakRepository.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { parseCompleteQuestBody } from "../validation/parseCompleteQuestBody.js";
import { parseCreateQuestBody } from "../validation/parseCreateQuestBody.js";
import { parseListQuestsQuery } from "../validation/parseListQuestsQuery.js";
import { parseQuestIdParam } from "../validation/parseQuestIdParam.js";
import { parseUpdateQuestBody } from "../validation/parseUpdateQuestBody.js";
import { parseUpdateQuestMissionBody } from "../validation/parseUpdateQuestMissionBody.js";

const timezone = process.env.TIMEZONE ?? "America/Sao_Paulo";
const characterRepository = new PostgresCharacterRepository();
const questRepository = new PostgresQuestRepository();
const missionRepository = new PostgresQuestMissionRepository();
const characterSkillRepository = new PostgresCharacterSkillRepository();
const streakRepository = new PostgresStreakRepository();
const questCompletionRepository = new PostgresQuestCompletionRepository();
const createQuest = new CreateQuest(
  characterRepository,
  questRepository,
  missionRepository,
  timezone,
);
const listQuests = new ListQuests(
  characterRepository,
  questRepository,
  missionRepository,
  timezone,
);
const listTodayQuests = new ListTodayQuests(
  characterRepository,
  questRepository,
  missionRepository,
  timezone,
);
const completeQuest = new CompleteQuest(
  characterRepository,
  questRepository,
  characterSkillRepository,
  streakRepository,
  questCompletionRepository,
  missionRepository,
  timezone,
);
const startQuest = new StartQuest(characterRepository, questRepository);
const cancelQuest = new CancelQuest(characterRepository, questRepository);
const reopenQuest = new ReopenQuest(
  characterRepository,
  questRepository,
  missionRepository,
);
const updateQuest = new UpdateQuest(
  characterRepository,
  questRepository,
  missionRepository,
);
const updateQuestMission = new UpdateQuestMission(
  characterRepository,
  questRepository,
  missionRepository,
);

export function registerQuestRoutes(app: Express): void {
  app.get(
    "/api/v1/quests/today",
    asyncHandler(async (req, res) => {
      const result = await listTodayQuests.execute(requireAuth(req).userId);

      res.json(presentTodayQuests(result));
    }),
  );

  app.get(
    "/api/v1/quests",
    asyncHandler(async (req, res) => {
      const filter = parseListQuestsQuery(req.query as Record<string, unknown>);
      const result = await listQuests.execute(requireAuth(req).userId, filter);

      res.json(presentQuestList(result.quests, result.missionsByQuestId));
    }),
  );

  app.post(
    "/api/v1/quests",
    asyncHandler(async (req, res) => {
      const input = parseCreateQuestBody(req.body);
      const result = await createQuest.execute(requireAuth(req).userId, input);
      const missions = await missionRepository.findByQuestId(result.quest.getId().toString());

      res.status(201).json(presentCreateQuestResult(result, missions));
    }),
  );

  app.patch(
    "/api/v1/quests/:id",
    asyncHandler(async (req, res) => {
      const questId = parseQuestIdParam(req.params.id);
      const input = parseUpdateQuestBody(req.body);
      const quest = await updateQuest.execute(requireAuth(req).userId, questId, input);
      const missions = await missionRepository.findByQuestId(questId);

      res.json({ quest: presentQuest(quest, missions) });
    }),
  );

  app.post(
    "/api/v1/quests/:id/start",
    asyncHandler(async (req, res) => {
      const questId = parseQuestIdParam(req.params.id);
      const quest = await startQuest.execute(requireAuth(req).userId, questId);
      const missions = await missionRepository.findByQuestId(questId);

      res.json({ quest: presentQuest(quest, missions) });
    }),
  );

  app.post(
    "/api/v1/quests/:id/cancel",
    asyncHandler(async (req, res) => {
      const questId = parseQuestIdParam(req.params.id);
      const quest = await cancelQuest.execute(requireAuth(req).userId, questId);
      const missions = await missionRepository.findByQuestId(questId);

      res.json({ quest: presentQuest(quest, missions) });
    }),
  );

  app.post(
    "/api/v1/quests/:id/reopen",
    asyncHandler(async (req, res) => {
      const questId = parseQuestIdParam(req.params.id);
      const quest = await reopenQuest.execute(requireAuth(req).userId, questId);
      const missions = await missionRepository.findByQuestId(questId);

      res.json({ quest: presentQuest(quest, missions) });
    }),
  );

  app.post(
    "/api/v1/quests/:id/complete",
    asyncHandler(async (req, res) => {
      const questId = parseQuestIdParam(req.params.id);
      const input = parseCompleteQuestBody(req.body);
      const result = await completeQuest.execute(requireAuth(req).userId, questId, input);
      const missions = await missionRepository.findByQuestId(questId);

      res.json(presentCompleteQuestResult(result, missions));
    }),
  );

  app.patch(
    "/api/v1/quests/:questId/missions/:missionId",
    asyncHandler(async (req, res) => {
      const questId = parseQuestIdParam(req.params.questId);
      const missionId = parseQuestIdParam(req.params.missionId);
      const input = parseUpdateQuestMissionBody(req.body);
      const mission = await updateQuestMission.execute(
        requireAuth(req).userId,
        questId,
        missionId,
        input,
      );

      res.json({ mission: presentQuestMission(mission) });
    }),
  );
}
