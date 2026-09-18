import type CharacterSkill from "../../domain/skill/CharacterSkill.js";
import type Skill from "../../domain/skill/Skill.js";
import type SkillCategory from "../../domain/skill/SkillCategory.js";

export type SkillTreeEntry = {
  category: SkillCategory;
  skill: Skill;
  progress: CharacterSkill;
};

export type SkillCatalogEntry = {
  category: SkillCategory;
  skill: Skill;
};

export default interface SkillRepository {
  findSkillTree(characterId: string): Promise<SkillTreeEntry[]>;
  findAllCategories(): Promise<SkillCategory[]>;
  findById(skillId: string): Promise<SkillCatalogEntry | null>;
  slugExists(slug: string): Promise<boolean>;
  countChildren(skillId: string): Promise<number>;
  countQuestAllocations(skillId: string): Promise<number>;
  maxDepthFromRoot(skillId: string): Promise<number>;
  maxDepthBelow(skillId: string): Promise<number>;
  wouldCreateCycle(skillId: string, newParentSkillId: string): Promise<boolean>;
  nextDisplayOrder(categoryId: string, parentSkillId: string | null): Promise<number>;
  saveCategory(category: SkillCategory): Promise<void>;
  findCategoryById(categoryId: string): Promise<SkillCategory | null>;
  countSkillsInCategory(categoryId: string): Promise<number>;
  deleteCategory(categoryId: string): Promise<void>;
  deleteCategoryWithSkills(categoryId: string): Promise<void>;
  categoryNameExists(name: string): Promise<boolean>;
  nextCategoryDisplayOrder(): Promise<number>;
  saveWithCharacterProgress(
    skill: Skill,
    characterId: string,
    progress: CharacterSkill,
  ): Promise<void>;
  update(skill: Skill): Promise<void>;
  delete(skillId: string): Promise<void>;
}
