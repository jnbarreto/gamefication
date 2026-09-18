import { TEST_USER_ID } from '../../../test/testAuth.js';
import Character from "../../../domain/character/Character.js";
import CharacterSkill from "../../../domain/skill/CharacterSkill.js";
import Skill from "../../../domain/skill/Skill.js";
import SkillCategory from "../../../domain/skill/SkillCategory.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type SkillRepository from "../../repository/SkillRepository.js";
import ListStaleSkills from "./ListStaleSkills.js";

class InMemoryCharacterRepository implements CharacterRepository {
  constructor(private character: Character) {}

  async findByUserId(_userId: string) {
    return this.character;
  }

  async save() {}
}

class InMemorySkillRepository implements SkillRepository {
  constructor(private entries: Awaited<ReturnType<SkillRepository["findSkillTree"]>>) {}

  async findSkillTree(_characterId: string) {
    return this.entries;
  }
}

describe("ListStaleSkills", () => {
  it("filters stale skills using domain rules", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const category = SkillCategory.create({ name: "Backend", displayOrder: 0 });
    const staleSkill = Skill.create({
      categoryId: category.getId().toString(),
      name: "Node.js",
      slug: "node-js",
      displayOrder: 0,
    });
    const freshSkill = Skill.create({
      categoryId: category.getId().toString(),
      name: "TypeScript",
      slug: "typescript",
      displayOrder: 1,
    });
    const referenceDate = new Date("2026-09-14T00:00:00.000Z");

    const useCase = new ListStaleSkills(
      new InMemoryCharacterRepository(character),
      new InMemorySkillRepository([
        {
          category,
          skill: staleSkill,
          progress: CharacterSkill.rebuild({
            id: "550e8400-e29b-41d4-a716-446655440050",
            characterId: character.getId().toString(),
            skillId: staleSkill.getId().toString(),
            xp: 0,
            masteryLevel: "UNKNOWN",
            masteryOverridden: false,
            lastXpAt: null,
            createdAt: new Date("2026-09-01T00:00:00.000Z"),
            updatedAt: new Date("2026-09-01T00:00:00.000Z"),
          }),
        },
        {
          category,
          skill: freshSkill,
          progress: CharacterSkill.rebuild({
            id: "550e8400-e29b-41d4-a716-446655440051",
            characterId: character.getId().toString(),
            skillId: freshSkill.getId().toString(),
            xp: 25,
            masteryLevel: "SUPERFICIAL",
            masteryOverridden: false,
            lastXpAt: new Date("2026-09-13T00:00:00.000Z"),
            createdAt: new Date("2026-09-01T00:00:00.000Z"),
            updatedAt: new Date("2026-09-13T00:00:00.000Z"),
          }),
        },
      ]),
    );

    const result = await useCase.execute(TEST_USER_ID, referenceDate);

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]?.skill.getSlug()).toBe("node-js");
  });
});
