import NotFoundError from "../../exception/NotFoundError.js";
import type SkillRepository from "../../repository/SkillRepository.js";
import ValidationError from "../../../shared/exception/ValidationError.js";
import { assertValidParentMove } from "./skillHierarchy.js";

export type UpdateSkillInput = {
  skillId: string;
  name?: string;
  description?: string | null;
  parentSkillId?: string | null;
};

export default class UpdateSkill {
  constructor(private readonly skillRepository: SkillRepository) {}

  async execute(input: UpdateSkillInput) {
    const entry = await this.skillRepository.findById(input.skillId);

    if (!entry) {
      throw new NotFoundError("Skill not found");
    }

    const { skill, category } = entry;
    const categoryId = category.getId().toString();

    if (
      input.name === undefined &&
      input.description === undefined &&
      input.parentSkillId === undefined
    ) {
      throw new ValidationError("At least one field must be provided");
    }

    if (input.name !== undefined || input.description !== undefined) {
      skill.updateDetails(input.name, input.description);
    }

    if (input.parentSkillId !== undefined) {
      const parentSkillId = input.parentSkillId;

      await assertValidParentMove(
        this.skillRepository,
        skill.getId().toString(),
        parentSkillId,
        categoryId,
      );

      skill.changeParent(parentSkillId);
    }

    await this.skillRepository.update(skill);

    return skill;
  }
}
