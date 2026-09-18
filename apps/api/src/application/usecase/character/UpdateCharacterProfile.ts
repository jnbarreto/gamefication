import type { UpdateCharacterProfileProps } from "../../../domain/character/Character.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";

export default class UpdateCharacterProfile {
  constructor(private readonly characterRepository: CharacterRepository) {}

  async execute(userId: string, input: UpdateCharacterProfileProps) {
    const character = await this.characterRepository.findByUserId(userId);

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    character.updateProfile(input);
    await this.characterRepository.save(character);

    return character;
  }
}
