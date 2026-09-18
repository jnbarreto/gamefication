import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";

export default class GetCharacter {
  constructor(private readonly characterRepository: CharacterRepository) {}

  async execute(userId: string) {
    const character = await this.characterRepository.findByUserId(userId);

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    return character;
  }
}
