import type { Express } from "express";

import {
  presentSkillCategoryMutation,
  presentSkillMutation,
  presentSkillTree,
  presentStaleSkills,
} from "../../../application/presenter/SkillPresenter.js";
import CreateSkill from "../../../application/usecase/skill/CreateSkill.js";
import CreateSkillCategory from "../../../application/usecase/skill/CreateSkillCategory.js";
import DeleteSkill from "../../../application/usecase/skill/DeleteSkill.js";
import DeleteSkillCategory from "../../../application/usecase/skill/DeleteSkillCategory.js";
import ListSkills from "../../../application/usecase/skill/ListSkills.js";
import ListStaleSkills from "../../../application/usecase/skill/ListStaleSkills.js";
import UpdateSkill from "../../../application/usecase/skill/UpdateSkill.js";
import PostgresCharacterRepository from "../../../infrastructure/repository/PostgresCharacterRepository.js";
import PostgresSkillRepository from "../../../infrastructure/repository/PostgresSkillRepository.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  parseCreateSkillBody,
  parseCreateSkillCategoryBody,
  parseSkillIdParam,
  parseUpdateSkillBody,
} from "../validation/parseSkillBody.js";

const characterRepository = new PostgresCharacterRepository();
const skillRepository = new PostgresSkillRepository();
const listSkills = new ListSkills(characterRepository, skillRepository);
const listStaleSkills = new ListStaleSkills(characterRepository, skillRepository);
const createSkill = new CreateSkill(characterRepository, skillRepository);
const createSkillCategory = new CreateSkillCategory(skillRepository);
const updateSkill = new UpdateSkill(skillRepository);
const deleteSkill = new DeleteSkill(skillRepository);
const deleteSkillCategory = new DeleteSkillCategory(skillRepository);

export function registerSkillRoutes(app: Express): void {
  app.get(
    "/api/v1/skills",
    asyncHandler(async (req, res) => {
      const result = await listSkills.execute(requireAuth(req).userId);

      res.json(presentSkillTree(result.entries, result.referenceDate, result.categories));
    }),
  );

  app.get(
    "/api/v1/skills/stale",
    asyncHandler(async (req, res) => {
      const result = await listStaleSkills.execute(requireAuth(req).userId);

      res.json(presentStaleSkills(result.entries, result.referenceDate));
    }),
  );

  app.post(
    "/api/v1/skill-categories",
    asyncHandler(async (req, res) => {
      const input = parseCreateSkillCategoryBody(req.body);
      const result = await createSkillCategory.execute(input);

      res.status(201).json(presentSkillCategoryMutation(result.category));
    }),
  );

  app.delete(
    "/api/v1/skill-categories/:id",
    asyncHandler(async (req, res) => {
      const categoryId = parseSkillIdParam(req.params.id);
      await deleteSkillCategory.execute(categoryId);

      res.status(204).send();
    }),
  );

  app.post(
    "/api/v1/skills",
    asyncHandler(async (req, res) => {
      const input = parseCreateSkillBody(req.body);
      const result = await createSkill.execute(requireAuth(req).userId, input);

      res.status(201).json(presentSkillMutation(result.skill, result.progress));
    }),
  );

  app.patch(
    "/api/v1/skills/:id",
    asyncHandler(async (req, res) => {
      const skillId = parseSkillIdParam(req.params.id);
      const input = parseUpdateSkillBody(req.body);
      const skill = await updateSkill.execute({ skillId, ...input });
      const tree = await listSkills.execute(requireAuth(req).userId);
      const progress =
        tree.entries.find((entry) => entry.skill.getId().toString() === skillId)?.progress ??
        null;

      if (!progress) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Skill not found" } });
        return;
      }

      res.json(presentSkillMutation(skill, progress, tree.referenceDate));
    }),
  );

  app.delete(
    "/api/v1/skills/:id",
    asyncHandler(async (req, res) => {
      const skillId = parseSkillIdParam(req.params.id);
      await deleteSkill.execute(requireAuth(req).userId, skillId);

      res.status(204).send();
    }),
  );
}
