import type { SkillCategoryResponse } from "@/lib/api/types";

export type SkillParentOption = {
  key: string;
  categoryId: string;
  categoryName: string;
  parentSkillId: string | null;
  label: string;
  depth: number;
  isRoot: boolean;
};

export function buildSkillParentOptions(
  categories: SkillCategoryResponse[],
): SkillParentOption[] {
  const options: SkillParentOption[] = [];

  for (const category of categories) {
    options.push({
      key: `${category.id}:root`,
      categoryId: category.id,
      categoryName: category.name,
      parentSkillId: null,
      label: category.name,
      depth: 0,
      isRoot: true,
    });

    const childrenByParent = new Map<string | null, typeof category.skills>();

    for (const skill of category.skills) {
      const siblings = childrenByParent.get(skill.parentSkillId) ?? [];
      siblings.push(skill);
      childrenByParent.set(skill.parentSkillId, siblings);
    }

    function walk(parentId: string | null, depth: number) {
      const siblings = childrenByParent.get(parentId) ?? [];
      siblings.sort((left, right) => left.name.localeCompare(right.name));

      for (const skill of siblings) {
        options.push({
          key: `${category.id}:${skill.id}`,
          categoryId: category.id,
          categoryName: category.name,
          parentSkillId: skill.id,
          label: skill.name,
          depth,
          isRoot: false,
        });

        walk(skill.id, depth + 1);
      }
    }

    walk(null, 1);
  }

  return options;
}

export function findDefaultParentKey(
  options: SkillParentOption[],
  selectedSkillId: string | null,
): string | null {
  if (selectedSkillId) {
    const asParent = options.find((option) => option.parentSkillId === selectedSkillId);

    if (asParent) {
      return asParent.key;
    }
  }

  return options[0]?.key ?? null;
}
