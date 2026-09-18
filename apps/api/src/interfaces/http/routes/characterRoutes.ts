import type { Express } from "express";

import { presentCharacter } from "../../../application/presenter/CharacterPresenter.js";
import GetCharacter from "../../../application/usecase/character/GetCharacter.js";
import ResetCharacterProgress from "../../../application/usecase/character/ResetCharacterProgress.js";
import UpdateCharacterProfile from "../../../application/usecase/character/UpdateCharacterProfile.js";
import PostgresCharacterProgressRepository from "../../../infrastructure/repository/PostgresCharacterProgressRepository.js";
import PostgresCharacterRepository from "../../../infrastructure/repository/PostgresCharacterRepository.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { parseUpdateCharacterBody } from "../validation/parseUpdateCharacterBody.js";

const characterRepository = new PostgresCharacterRepository();
const characterProgressRepository = new PostgresCharacterProgressRepository();
const getCharacter = new GetCharacter(characterRepository);
const updateCharacterProfile = new UpdateCharacterProfile(characterRepository);
const resetCharacterProgress = new ResetCharacterProgress(
  characterRepository,
  characterProgressRepository,
);

export function registerCharacterRoutes(app: Express): void {
  app.get(
    "/api/v1/character",
    asyncHandler(async (req, res) => {
      const character = await getCharacter.execute(requireAuth(req).userId);

      res.json(presentCharacter(character));
    }),
  );

  app.patch(
    "/api/v1/character",
    asyncHandler(async (req, res) => {
      const input = parseUpdateCharacterBody(req.body);
      const character = await updateCharacterProfile.execute(requireAuth(req).userId, input);

      res.json(presentCharacter(character));
    }),
  );

  app.post(
    "/api/v1/character/reset-progress",
    asyncHandler(async (req, res) => {
      const character = await resetCharacterProgress.execute(requireAuth(req).userId);

      res.json(presentCharacter(character));
    }),
  );
}
