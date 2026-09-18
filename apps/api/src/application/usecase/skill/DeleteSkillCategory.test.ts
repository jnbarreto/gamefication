import SkillCategory from "../../../domain/skill/SkillCategory.js";
import NotFoundError from "../../exception/NotFoundError.js";
import ValidationError from "../../../shared/exception/ValidationError.js";
import type SkillRepository from "../../repository/SkillRepository.js";
import DeleteSkillCategory from "./DeleteSkillCategory.js";

class InMemorySkillRepository implements Pick<
  SkillRepository,
  "findCategoryById" | "deleteCategoryWithSkills"
> {
  constructor(private category: SkillCategory | null) {}

  findCategoryById(categoryId: string) {
    if (!this.category || this.category.getId().toString() !== categoryId) {
      return Promise.resolve(null);
    }

    return Promise.resolve(this.category);
  }

  deleteCategoryWithSkills() {
    return Promise.resolve();
  }
}

describe("DeleteSkillCategory", () => {
  it("deletes an empty custom category", async () => {
    const category = SkillCategory.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440010",
      name: "Frontend",
      displayOrder: 1,
      isCustom: true,
    });
    const useCase = new DeleteSkillCategory(new InMemorySkillRepository(category));

    await expect(useCase.execute(category.getId().toString())).resolves.toBeUndefined();
  });

  it("rejects seeded categories", async () => {
    const category = SkillCategory.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440010",
      name: "Backend",
      displayOrder: 0,
      isCustom: false,
    });
    const useCase = new DeleteSkillCategory(new InMemorySkillRepository(category));

    await expect(useCase.execute(category.getId().toString())).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("deletes custom categories with skills in cascade", async () => {
    const category = SkillCategory.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440010",
      name: "Frontend",
      displayOrder: 1,
      isCustom: true,
    });
    const useCase = new DeleteSkillCategory(new InMemorySkillRepository(category));

    await expect(useCase.execute(category.getId().toString())).resolves.toBeUndefined();
  });

  it("throws when category is missing", async () => {
    const useCase = new DeleteSkillCategory(new InMemorySkillRepository(null));

    await expect(
      useCase.execute("550e8400-e29b-41d4-a716-446655440099"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
