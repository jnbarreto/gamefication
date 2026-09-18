import Character from "../../domain/character/Character.js";
import { presentCharacter } from "./CharacterPresenter.js";

describe("presentCharacter", () => {
  it("maps domain fields to API response", () => {
    const character = Character.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
      subclass: "DevOps",
      careerGoal: "Senior Backend Developer + DevOps",
      currentRank: "Pleno",
      totalXp: 150,
      createdAt: new Date("2026-09-01T00:00:00.000Z"),
      updatedAt: new Date("2026-09-14T00:00:00.000Z"),
    });

    expect(presentCharacter(character)).toEqual({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
      subclass: "DevOps",
      careerGoal: "Senior Backend Developer + DevOps",
      currentRank: "Pleno",
      totalXp: 150,
      level: 2,
      xpToNextLevel: 150,
      progressToNextLevel: 0.25,
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-14T00:00:00.000Z",
    });
  });
});
