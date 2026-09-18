import { TEST_USER_ID } from '../../../test/testAuth.js';
import Character from "../../../domain/character/Character.js";
import CharacterSkill from "../../../domain/skill/CharacterSkill.js";
import Skill from "../../../domain/skill/Skill.js";
import SkillCategory from "../../../domain/skill/SkillCategory.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type SkillRepository from "../../repository/SkillRepository.js";
import ListSkills from "./ListSkills.js";

class InMemoryCharacterRepository implements CharacterRepository {
  constructor(private character: Character | null) {}

  async findByUserId(_userId: string) {
    return this.character;
  }

  async save() {}
}

class InMemorySkillRepository implements SkillRepository {
  constructor(
    private entries: Awaited<ReturnType<SkillRepository["findSkillTree"]>>,
    private lastCharacterId?: string,
  ) {}

  async findSkillTree(characterId: string) {
    this.lastCharacterId = characterId;
    return this.entries;
  }

  getLastCharacterId() {
    return this.lastCharacterId;
  }

  async findAllCategories() {
    const categories = new Map<string, SkillCategory>();

    for (const entry of this.entries) {
      categories.set(entry.category.getId().toString(), entry.category);
    }

    return [...categories.values()];
  }
}

describe("ListSkills", () => {
  it("returns the skill tree for the authenticated user's character", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const category = SkillCategory.create({ name: "Backend", displayOrder: 0 });
    const skill = Skill.create({
      categoryId: category.getId().toString(),
      name: "Node.js",
      slug: "node-js",
      displayOrder: 0,
    });
    const progress = CharacterSkill.create({
      characterId: character.getId().toString(),
      skillId: skill.getId().toString(),
    });
    const skillRepository = new InMemorySkillRepository([{ category, skill, progress }]);
    const useCase = new ListSkills(
      new InMemoryCharacterRepository(character),
      skillRepository,
    );

    const result = await useCase.execute(TEST_USER_ID);

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]?.skill.getName()).toBe("Node.js");
    expect(result.categories).toHaveLength(1);
    expect(skillRepository.getLastCharacterId()).toBe(character.getId().toString());
  });

  it("throws when no character exists", async () => {
    const useCase = new ListSkills(
      new InMemoryCharacterRepository(null),
      new InMemorySkillRepository([]),
    );

    await expect(useCase.execute(TEST_USER_ID)).rejects.toBeInstanceOf(NotFoundError);
  });
});
