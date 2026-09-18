import SkillCategory from "../../../domain/skill/SkillCategory.js";
import InvalidValueError from "../../../domain/exception/InvalidValueError.js";
import type SkillRepository from "../../repository/SkillRepository.js";

export type CreateSkillCategoryInput = {
  name: string;
};

export type CreateSkillCategoryResult = {
  category: SkillCategory;
};

export default class CreateSkillCategory {
  constructor(private readonly skillRepository: SkillRepository) {}

  async execute(input: CreateSkillCategoryInput): Promise<CreateSkillCategoryResult> {
    const name = input.name.trim();

    if (!name) {
      throw new InvalidValueError("name is required");
    }

    if (await this.skillRepository.categoryNameExists(name)) {
      throw new InvalidValueError("category name already exists");
    }

    const displayOrder = await this.skillRepository.nextCategoryDisplayOrder();
    const category = SkillCategory.create({
      name,
      displayOrder,
      isCustom: true,
    });

    await this.skillRepository.saveCategory(category);

    return { category };
  }
}
