import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type SkillRepository from "../../repository/SkillRepository.js";

export default class ListSkills {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly skillRepository: SkillRepository,
  ) {}

  async execute(userId: string, referenceDate: Date = new Date()) {
    const character = await this.characterRepository.findByUserId(userId);

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    const characterId = character.getId().toString();
    const [entries, categories] = await Promise.all([
      this.skillRepository.findSkillTree(characterId),
      this.skillRepository.findAllCategories(),
    ]);

    return {
      entries,
      categories,
      referenceDate,
    };
  }
}
