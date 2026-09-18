import SkillCategory from "../../../domain/skill/SkillCategory.js";
import type SkillRepository from "../../repository/SkillRepository.js";
import CreateSkillCategory from "./CreateSkillCategory.js";

class InMemorySkillRepository implements Pick<
  SkillRepository,
  "categoryNameExists" | "nextCategoryDisplayOrder" | "saveCategory"
> {
  private categories: SkillCategory[] = [];

  constructor(categories: SkillCategory[] = []) {
    this.categories = categories;
  }

  categoryNameExists(name: string) {
    return Promise.resolve(
      this.categories.some(
        (category) => category.getName().toLowerCase() === name.trim().toLowerCase(),
      ),
    );
  }

  nextCategoryDisplayOrder() {
    const maxOrder = this.categories.reduce(
      (max, category) => Math.max(max, category.getDisplayOrder()),
      -1,
    );

    return Promise.resolve(maxOrder + 1);
  }

  saveCategory(category: SkillCategory) {
    this.categories.push(category);
    return Promise.resolve();
  }
}

describe("CreateSkillCategory", () => {
  it("creates a custom category with the next display order", async () => {
    const existing = SkillCategory.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440010",
      name: "Backend",
      displayOrder: 0,
    });
    const repository = new InMemorySkillRepository([existing]);
    const useCase = new CreateSkillCategory(repository);

    const result = await useCase.execute({ name: "Frontend" });

    expect(result.category.getName()).toBe("Frontend");
    expect(result.category.getDisplayOrder()).toBe(1);
    expect(result.category.isCustomCategory()).toBe(true);
  });

  it("rejects duplicate category names", async () => {
    const existing = SkillCategory.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440010",
      name: "Backend",
      displayOrder: 0,
    });
    const repository = new InMemorySkillRepository([existing]);
    const useCase = new CreateSkillCategory(repository);

    await expect(useCase.execute({ name: "backend" })).rejects.toThrow(
      "category name already exists",
    );
  });
});
