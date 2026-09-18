import { TEST_USER_ID } from '../../../test/testAuth.js';
import Character from "../../../domain/character/Character.js";
import CharacterSkill from "../../../domain/skill/CharacterSkill.js";
import Skill from "../../../domain/skill/Skill.js";
import SkillCategory from "../../../domain/skill/SkillCategory.js";
import type {
  SkillCatalogEntry,
  SkillTreeEntry,
} from "../../repository/SkillRepository.js";
import CreateSkill from "./CreateSkill.js";

class InMemoryCharacterRepository {
  constructor(private readonly character: Character | null) {}

  findByUserId(TEST_USER_ID) {
    return Promise.resolve(this.character);
  }
}

class InMemorySkillRepository {
  private entries: SkillCatalogEntry[] = [];
  private progressBySkillId = new Map<string, CharacterSkill>();

  constructor(entries: SkillCatalogEntry[]) {
    this.entries = entries;
  }

  findSkillTree(_characterId: string): Promise<SkillTreeEntry[]> {
    return Promise.resolve(
      this.entries.map((entry) => ({
        ...entry,
        progress:
          this.progressBySkillId.get(entry.skill.getId().toString()) ??
          CharacterSkill.create({
            characterId: "550e8400-e29b-41d4-a716-446655440000",
            skillId: entry.skill.getId().toString(),
          }),
      })),
    );
  }

  findById(skillId: string) {
    return Promise.resolve(
      this.entries.find((entry) => entry.skill.getId().toString() === skillId) ?? null,
    );
  }

  slugExists(slug: string) {
    return Promise.resolve(
      this.entries.some((entry) => entry.skill.getSlug() === slug),
    );
  }

  countChildren() {
    return Promise.resolve(0);
  }

  countQuestAllocations() {
    return Promise.resolve(0);
  }

  maxDepthFromRoot(skillId: string) {
    const entry = this.entries.find((item) => item.skill.getId().toString() === skillId);
    let depth = 1;
    let current = entry?.skill;

    while (current?.getParentSkillId()) {
      depth += 1;
      current = this.entries.find(
        (item) => item.skill.getId().toString() === current?.getParentSkillId()?.toString(),
      )?.skill;
    }

    return Promise.resolve(depth);
  }

  maxDepthBelow() {
    return Promise.resolve(1);
  }

  wouldCreateCycle(skillId: string, newParentSkillId: string) {
    return Promise.resolve(skillId === newParentSkillId);
  }

  nextDisplayOrder() {
    return Promise.resolve(0);
  }

  saveWithCharacterProgress(skill: Skill, characterId: string, progress: CharacterSkill) {
    const category = this.entries[0]?.category;
    if (!category) {
      throw new Error("missing category");
    }

    this.entries.push({ category, skill });
    this.progressBySkillId.set(skill.getId().toString(), progress);
    return Promise.resolve();
  }

  update() {
    return Promise.resolve();
  }

  delete() {
    return Promise.resolve();
  }
}

describe("CreateSkill", () => {
  const category = SkillCategory.rebuild({
    id: "550e8400-e29b-41d4-a716-446655440010",
    name: "Backend",
    displayOrder: 0,
  });
  const parentSkill = Skill.rebuild({
    id: "550e8400-e29b-41d4-a716-446655440011",
    categoryId: category.getId().toString(),
    name: "Node.js",
    slug: "node-js",
    displayOrder: 0,
    description: null,
    parentSkillId: null,
    isCustom: false,
  });
  const character = Character.rebuild({
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Leone",
    characterClass: "Engineer",
    specialization: "Backend",
    subclass: null,
    careerGoal: null,
    currentRank: null,
    totalXp: 0,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  });

  it("creates a custom skill under a parent", async () => {
    const skillRepository = new InMemorySkillRepository([
      { category, skill: parentSkill },
    ]);
    const useCase = new CreateSkill(
      new InMemoryCharacterRepository(character),
      skillRepository,
    );

    const result = await useCase.execute(TEST_USER_ID, {
      name: "Fastify",
      description: "HTTP framework",
      parentSkillId: parentSkill.getId().toString(),
    });

    expect(result.skill.getName()).toBe("Fastify");
    expect(result.skill.isCustomSkill()).toBe(true);
    expect(result.skill.getParentSkillId()?.toString()).toBe(parentSkill.getId().toString());
    expect(result.progress.getXp()).toBe(0);
  });
});
