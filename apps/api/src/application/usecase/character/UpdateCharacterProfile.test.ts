import { TEST_USER_ID } from '../../../test/testAuth.js';
import Character from "../../../domain/character/Character.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import UpdateCharacterProfile from "./UpdateCharacterProfile.js";

class InMemoryCharacterRepository implements CharacterRepository {
  constructor(private character: Character | null) {}

  async findByUserId(_userId: string): Promise<Character | null> {
    return this.character;
  }

  async save(character: Character): Promise<void> {
    this.character = character;
  }
}

describe("UpdateCharacterProfile", () => {
  it("updates profile fields and persists", async () => {
    const character = Character.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
      subclass: "DevOps",
      careerGoal: "Senior Backend Developer + DevOps",
      currentRank: "Pleno",
      totalXp: 0,
      createdAt: new Date("2026-09-01T00:00:00.000Z"),
      updatedAt: new Date("2026-09-01T00:00:00.000Z"),
    });
    const repository = new InMemoryCharacterRepository(character);
    const useCase = new UpdateCharacterProfile(repository);

    const result = await useCase.execute(TEST_USER_ID, {
      currentRank: "Pleno Forte",
      careerGoal: "Senior Backend",
    });

    expect(result.getCurrentRank()).toBe("Pleno Forte");
    expect(result.getCareerGoal()).toBe("Senior Backend");
    expect((await repository.findByUserId(TEST_USER_ID))?.getCurrentRank()).toBe("Pleno Forte");
  });

  it("throws when no character exists", async () => {
    const useCase = new UpdateCharacterProfile(new InMemoryCharacterRepository(null));

    await expect(useCase.execute(TEST_USER_ID, { name: "Leone" })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
