import NotFoundError from "../../exception/NotFoundError.js";
import type SkillRepository from "../../repository/SkillRepository.js";
import ValidationError from "../../../shared/exception/ValidationError.js";

export default class DeleteSkillCategory {
  constructor(private readonly skillRepository: SkillRepository) {}

  async execute(categoryId: string): Promise<void> {
    const category = await this.skillRepository.findCategoryById(categoryId);

    if (!category) {
      throw new NotFoundError("Skill category not found");
    }

    if (!category.isCustomCategory()) {
      throw new ValidationError("Only custom categories can be deleted");
    }

    await this.skillRepository.deleteCategoryWithSkills(categoryId);
  }
}
