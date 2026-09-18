import type Character from "../../domain/character/Character.js";

export default interface CharacterRepository {
  findByUserId(userId: string): Promise<Character | null>;
  save(character: Character): Promise<void>;
}
