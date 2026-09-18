import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type SkillRepository from "../../repository/SkillRepository.js";

export default class ListStaleSkills {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly skillRepository: SkillRepository,
  ) {}

  async execute(userId: string, referenceDate: Date = new Date()) {
    const character = await this.characterRepository.findByUserId(userId);

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    const entries = await this.skillRepository.findSkillTree(character.getId().toString());
    const staleEntries = entries.filter((entry) =>
      entry.progress.isStale(referenceDate),
    );

    return {
      entries: staleEntries,
      referenceDate,
    };
  }
}
