import type { SkillCategoryResponse } from "@/lib/api/types";

export function sortSkillCategories(
  categories: SkillCategoryResponse[],
): SkillCategoryResponse[] {
  return [...categories].sort((left, right) => {
    if (left.isCustom !== right.isCustom) {
      return left.isCustom ? -1 : 1;
    }

    if (left.displayOrder !== right.displayOrder) {
      return left.displayOrder - right.displayOrder;
    }

    return left.name.localeCompare(right.name);
  });
}
