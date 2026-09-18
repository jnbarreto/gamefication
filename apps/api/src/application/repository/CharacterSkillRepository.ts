import type CharacterSkill from "../../domain/skill/CharacterSkill.js";

export default interface CharacterSkillRepository {
  findByCharacterAndSkillIds(
    characterId: string,
    skillIds: string[],
  ): Promise<CharacterSkill[]>;
}
