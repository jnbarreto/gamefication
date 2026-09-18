import type Character from "../../domain/character/Character.js";

export type CharacterResponse = {
  id: string;
  name: string;
  characterClass: string;
  specialization: string;
  subclass: string | null;
  careerGoal: string | null;
  currentRank: string | null;
  totalXp: number;
  level: number;
  xpToNextLevel: number;
  progressToNextLevel: number;
  createdAt: string;
  updatedAt: string;
};

export function presentCharacter(character: Character): CharacterResponse {
  return {
    id: character.getId().toString(),
    name: character.getName(),
    characterClass: character.getCharacterClass(),
    specialization: character.getSpecialization(),
    subclass: character.getSubclass(),
    careerGoal: character.getCareerGoal(),
    currentRank: character.getCurrentRank(),
    totalXp: character.getTotalXp(),
    level: character.getLevel(),
    xpToNextLevel: character.getXpToNextLevel(),
    progressToNextLevel: character.getProgressToNextLevel(),
    createdAt: character.getCreatedAt().toISOString(),
    updatedAt: character.getUpdatedAt().toISOString(),
  };
}
