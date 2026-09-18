import Skill from "../../../domain/skill/Skill.js";
import SkillCategory from "../../../domain/skill/SkillCategory.js";
import NotFoundError from "../../exception/NotFoundError.js";
import ValidationError from "../../../shared/exception/ValidationError.js";
import type { SkillCatalogEntry } from "../../repository/SkillRepository.js";
import type SkillRepository from "../../repository/SkillRepository.js";
import DeleteSkill from "./DeleteSkill.js";

class InMemorySkillRepository implements Pick<
  SkillRepository,
  "findById" | "countChildren" | "delete"
> {
  constructor(
    private entry: SkillCatalogEntry | null,
    private children = 0,
    private questAllocations = 0,
  ) {}

  findById(skillId: string) {
    if (!this.entry || this.entry.skill.getId().toString() !== skillId) {
      return Promise.resolve(null);
    }

    return Promise.resolve(this.entry);
  }

  countChildren() {
    return Promise.resolve(this.children);
  }

  countQuestAllocations() {
    return Promise.resolve(this.questAllocations);
  }

  delete() {
    return Promise.resolve();
  }
}

describe("DeleteSkill", () => {
  const category = SkillCategory.rebuild({
    id: "550e8400-e29b-41d4-a716-446655440010",
    name: "Frontend",
    displayOrder: 1,
    isCustom: true,
  });

  it("deletes custom skills even when referenced by quests", async () => {
    const skill = Skill.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440020",
      categoryId: category.getId().toString(),
      name: "React",
      slug: "react",
      displayOrder: 0,
      description: null,
      parentSkillId: null,
      isCustom: true,
    });
    const useCase = new DeleteSkill(
      new InMemorySkillRepository({ category, skill }, 0, 2),
    );

    await expect(
      useCase.execute("550e8400-e29b-41d4-a716-446655440099", skill.getId().toString()),
    ).resolves.toBeUndefined();
  });

  it("rejects seeded skills", async () => {
    const skill = Skill.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440020",
      categoryId: category.getId().toString(),
      name: "Node.js",
      slug: "node-js",
      displayOrder: 0,
      description: null,
      parentSkillId: null,
      isCustom: false,
    });
    const useCase = new DeleteSkill(new InMemorySkillRepository({ category, skill }));

    await expect(
      useCase.execute("550e8400-e29b-41d4-a716-446655440099", skill.getId().toString()),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws when skill is missing", async () => {
    const useCase = new DeleteSkill(new InMemorySkillRepository(null));

    await expect(
      useCase.execute("550e8400-e29b-41d4-a716-446655440099", "550e8400-e29b-41d4-a716-446655440099"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
