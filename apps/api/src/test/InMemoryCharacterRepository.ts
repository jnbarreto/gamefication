import type CharacterRepository from "../application/repository/CharacterRepository.js";
import type Character from "../domain/character/Character.js";

export class InMemoryCharacterRepository implements CharacterRepository {
  constructor(private character: Character | null) {}

  async findByUserId(_userId: string): Promise<Character | null> {
    return this.character;
  }

  async save(): Promise<void> {}
}
