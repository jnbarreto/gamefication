import type { SkillTreeEntry } from "../repository/SkillRepository.js";
import type Skill from "../../domain/skill/Skill.js";
import type CharacterSkill from "../../domain/skill/CharacterSkill.js";
import type SkillCategory from "../../domain/skill/SkillCategory.js";

export type SkillProgressResponse = {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  parentSkillId: string | null;
  description: string | null;
  isCustom: boolean;
  xp: number;
  masteryLevel: string;
  masteryOverridden: boolean;
  lastXpAt: string | null;
  isStale: boolean;
};

export type SkillCategoryResponse = {
  id: string;
  name: string;
  displayOrder: number;
  isCustom: boolean;
  skills: SkillProgressResponse[];
};

export type SkillCategoryMutationResponse = {
  category: {
    id: string;
    name: string;
    displayOrder: number;
    isCustom: boolean;
  };
};

export type SkillTreeResponse = {
  categories: SkillCategoryResponse[];
};

export type StaleSkillResponse = SkillProgressResponse & {
  categoryId: string;
  categoryName: string;
};

export type StaleSkillsResponse = {
  skills: StaleSkillResponse[];
};

export type SkillMutationResponse = {
  skill: SkillProgressResponse;
};

function presentSkillFields(
  skill: Skill,
  progress: CharacterSkill,
  referenceDate: Date,
): SkillProgressResponse {
  return {
    id: skill.getId().toString(),
    name: skill.getName(),
    slug: skill.getSlug(),
    displayOrder: skill.getDisplayOrder(),
    parentSkillId: skill.getParentSkillId()?.toString() ?? null,
    description: skill.getDescription(),
    isCustom: skill.isCustomSkill(),
    xp: progress.getXp(),
    masteryLevel: progress.getMasteryLevel(),
    masteryOverridden: progress.isMasteryOverridden(),
    lastXpAt: progress.getLastXpAt()?.toISOString() ?? null,
    isStale: progress.isStale(referenceDate),
  };
}

export function presentSkillProgress(
  entry: SkillTreeEntry,
  referenceDate: Date = new Date(),
): SkillProgressResponse {
  return presentSkillFields(entry.skill, entry.progress, referenceDate);
}

export function presentSkillTree(
  entries: SkillTreeEntry[],
  referenceDate: Date = new Date(),
  allCategories: SkillCategory[] = [],
): SkillTreeResponse {
  const skillsByCategoryId = new Map<string, SkillProgressResponse[]>();

  for (const entry of entries) {
    const categoryId = entry.category.getId().toString();
    const skills = skillsByCategoryId.get(categoryId) ?? [];
    skills.push(presentSkillProgress(entry, referenceDate));
    skillsByCategoryId.set(categoryId, skills);
  }

  const categories = (allCategories.length > 0
    ? allCategories
    : entries.map((entry) => entry.category)
  )
    .reduce<SkillCategory[]>((unique, category) => {
      if (!unique.some((item) => item.getId().equals(category.getId()))) {
        unique.push(category);
      }

      return unique;
    }, [])
    .sort((left, right) => {
      if (left.isCustomCategory() !== right.isCustomCategory()) {
        return left.isCustomCategory() ? -1 : 1;
      }

      if (left.getDisplayOrder() !== right.getDisplayOrder()) {
        return left.getDisplayOrder() - right.getDisplayOrder();
      }

      return left.getName().localeCompare(right.getName());
    })
    .map((category) => ({
      id: category.getId().toString(),
      name: category.getName(),
      displayOrder: category.getDisplayOrder(),
      isCustom: category.isCustomCategory(),
      skills: skillsByCategoryId.get(category.getId().toString()) ?? [],
    }));

  return { categories };
}

export function presentSkillCategoryMutation(
  category: SkillCategory,
): SkillCategoryMutationResponse {
  return {
    category: {
      id: category.getId().toString(),
      name: category.getName(),
      displayOrder: category.getDisplayOrder(),
      isCustom: category.isCustomCategory(),
    },
  };
}

export function presentStaleSkills(
  entries: SkillTreeEntry[],
  referenceDate: Date = new Date(),
): StaleSkillsResponse {
  return {
    skills: entries
      .filter((entry) => entry.progress.isStale(referenceDate))
      .map((entry) => ({
        ...presentSkillProgress(entry, referenceDate),
        categoryId: entry.category.getId().toString(),
        categoryName: entry.category.getName(),
      })),
  };
}

export function presentSkillMutation(
  skill: Skill,
  progress: CharacterSkill,
  referenceDate: Date = new Date(),
): SkillMutationResponse {
  return {
    skill: presentSkillFields(skill, progress, referenceDate),
  };
}
