import CharacterSkill from "../../../domain/skill/CharacterSkill.js";
import Skill from "../../../domain/skill/Skill.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type SkillRepository from "../../repository/SkillRepository.js";
import {
  assertValidParentPlacement,
  generateUniqueSkillSlug,
  resolveCategoryIdForParent,
} from "./skillHierarchy.js";

export type CreateSkillInput = {
  name: string;
  description?: string | null;
  categoryId?: string;
  parentSkillId?: string | null;
};

export type CreateSkillResult = {
  skill: Skill;
  progress: CharacterSkill;
};

export default class CreateSkill {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly skillRepository: SkillRepository,
  ) {}

  async execute(userId: string, input: CreateSkillInput): Promise<CreateSkillResult> {
    const character = await this.characterRepository.findByUserId(userId);

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    const parentSkillId = input.parentSkillId ?? null;
    const categoryId = await resolveCategoryIdForParent(
      this.skillRepository,
      input.categoryId,
      parentSkillId,
    );

    await assertValidParentPlacement(this.skillRepository, parentSkillId, categoryId);

    const slug = await generateUniqueSkillSlug(input.name, (candidate) =>
      this.skillRepository.slugExists(candidate),
    );

    const displayOrder = await this.skillRepository.nextDisplayOrder(
      categoryId,
      parentSkillId,
    );

    const skill = Skill.create({
      categoryId,
      name: input.name,
      slug,
      displayOrder,
      description: input.description,
      parentSkillId,
      isCustom: true,
    });

    const progress = CharacterSkill.create({
      characterId: character.getId().toString(),
      skillId: skill.getId().toString(),
    });

    await this.skillRepository.saveWithCharacterProgress(
      skill,
      character.getId().toString(),
      progress,
    );

    return { skill, progress };
  }
}
