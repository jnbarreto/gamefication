import InvalidValueError from "../exception/InvalidValueError.js";
import XpAmount from "../shared/XpAmount.js";
import Character from "./Character.js";

describe("Character", () => {
  it("creates a new character at level 1 with zero XP", () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
      subclass: "DevOps",
      careerGoal: "Senior Backend + DevOps",
      currentRank: "Pleno",
    });

    expect(character.getName()).toBe("Leone");
    expect(character.getCharacterClass()).toBe("Backend Developer");
    expect(character.getLevel()).toBe(1);
    expect(character.getTotalXp()).toBe(0);
    expect(character.getXpToNextLevel()).toBe(100);
    expect(character.getProgressToNextLevel()).toBe(0);
  });

  it("rejects empty required fields on create", () => {
    expect(() =>
      Character.create({
        name: "  ",
        characterClass: "Backend Developer",
        specialization: "Node.js / TypeScript",
      }),
    ).toThrow(InvalidValueError);
  });

  it("rehydrates from persistence without validating business rules", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const updatedAt = new Date("2026-02-01T00:00:00.000Z");

    const character = Character.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
      subclass: "DevOps",
      careerGoal: "Senior Backend + DevOps",
      currentRank: "Pleno",
      totalXp: 300,
      createdAt,
      updatedAt,
    });

    expect(character.getLevel()).toBe(3);
    expect(character.getTotalXp()).toBe(300);
    expect(character.getUpdatedAt()).toEqual(updatedAt);
  });

  it("adds XP and levels up automatically", () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });

    character.addXp(XpAmount.from(100));

    expect(character.getTotalXp()).toBe(100);
    expect(character.getLevel()).toBe(2);
    expect(character.getXpToNextLevel()).toBe(200);
  });

  it("never reduces XP through addXp", () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });

    character.addXp(XpAmount.medium());
    const totalAfterFirstGain = character.getTotalXp();

    character.addXp(XpAmount.small());

    expect(character.getTotalXp()).toBe(totalAfterFirstGain + 10);
  });

  it("updates profile fields and updatedAt", () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });

    const before = character.getUpdatedAt();

    character.updateProfile({
      currentRank: "Pleno Forte",
      careerGoal: "Senior Backend + DevOps",
    });

    expect(character.getCurrentRank()).toBe("Pleno Forte");
    expect(character.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});
