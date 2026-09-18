import { TEST_USER_ID } from '../../../test/testAuth.js';
import Character from "../../../domain/character/Character.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import GetCharacter from "./GetCharacter.js";

class InMemoryCharacterRepository implements CharacterRepository {
  constructor(private character: Character | null) {}

  async findByUserId(_userId: string): Promise<Character | null> {
    return this.character;
  }

  async save(): Promise<void> {}
}

describe("GetCharacter", () => {
  it("returns the default character", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const useCase = new GetCharacter(new InMemoryCharacterRepository(character));

    const result = await useCase.execute(TEST_USER_ID);

    expect(result.getName()).toBe("Leone");
  });

  it("throws when no character exists", async () => {
    const useCase = new GetCharacter(new InMemoryCharacterRepository(null));

    await expect(useCase.execute(TEST_USER_ID)).rejects.toBeInstanceOf(NotFoundError);
  });
});
