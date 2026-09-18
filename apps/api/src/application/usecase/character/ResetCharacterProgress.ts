import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type CharacterProgressRepository from "../../repository/CharacterProgressRepository.js";

export default class ResetCharacterProgress {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly characterProgressRepository: CharacterProgressRepository,
  ) {}

  async execute(userId: string) {
    const character = await this.characterRepository.findByUserId(userId);

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    await this.characterProgressRepository.resetForCharacter(character.getId().toString());

    const resetCharacter = await this.characterRepository.findByUserId(userId);

    if (!resetCharacter) {
      throw new NotFoundError("Character not found");
    }

    return resetCharacter;
  }
}
