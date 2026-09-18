import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type AchievementRepository from "../../repository/AchievementRepository.js";

export default class ListAchievements {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly achievementRepository: AchievementRepository,
  ) {}

  async execute(userId: string) {
    const character = await this.characterRepository.findByUserId(userId);

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    return this.achievementRepository.findAllWithUnlocks(character.getId().toString());
  }
}
