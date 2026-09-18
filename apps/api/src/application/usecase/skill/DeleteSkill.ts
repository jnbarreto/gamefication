import NotFoundError from "../../exception/NotFoundError.js";
import type SkillRepository from "../../repository/SkillRepository.js";
import ValidationError from "../../../shared/exception/ValidationError.js";

export default class DeleteSkill {
  constructor(private readonly skillRepository: SkillRepository) {}

  async execute(_userId: string, skillId: string): Promise<void> {
    const entry = await this.skillRepository.findById(skillId);

    if (!entry) {
      throw new NotFoundError("Skill not found");
    }

    const { skill } = entry;

    if (!skill.isCustomSkill()) {
      throw new ValidationError("Only custom skills can be deleted");
    }

    if ((await this.skillRepository.countChildren(skillId)) > 0) {
      throw new ValidationError("Remove or move child skills before deleting");
    }

    await this.skillRepository.delete(skillId);
  }
}
