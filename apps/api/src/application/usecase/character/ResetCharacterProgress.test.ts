import { TEST_USER_ID } from '../../../test/testAuth.js';
import Character from "../../../domain/character/Character.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type CharacterProgressRepository from "../../repository/CharacterProgressRepository.js";
import ResetCharacterProgress from "./ResetCharacterProgress.js";

class InMemoryCharacterRepository implements CharacterRepository {
  constructor(private character: Character | null) {}

  async findByUserId(_userId: string) {
    return this.character;
  }

  async save() {}
}

class InMemoryCharacterProgressRepository implements CharacterProgressRepository {
  resetCharacterId: string | null = null;

  async resetForCharacter(characterId: string) {
    this.resetCharacterId = characterId;
  }
}

describe("ResetCharacterProgress", () => {
  it("resets progress for the authenticated user's character", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const progressRepository = new InMemoryCharacterProgressRepository();
    const useCase = new ResetCharacterProgress(
      new InMemoryCharacterRepository(character),
      progressRepository,
    );

    const result = await useCase.execute(TEST_USER_ID);

    expect(progressRepository.resetCharacterId).toBe(character.getId().toString());
    expect(result.getId().toString()).toBe(character.getId().toString());
  });

  it("throws when no character exists", async () => {
    const useCase = new ResetCharacterProgress(
      new InMemoryCharacterRepository(null),
      new InMemoryCharacterProgressRepository(),
    );

    await expect(useCase.execute(TEST_USER_ID)).rejects.toBeInstanceOf(NotFoundError);
  });
});
