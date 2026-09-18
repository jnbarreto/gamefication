import type CharacterSkillRepository from "../../application/repository/CharacterSkillRepository.js";
import CharacterSkill from "../../domain/skill/CharacterSkill.js";
import DatabasePool from "../database/DatabasePool.js";
import InfraError from "../exception/InfraError.js";

type CharacterSkillRow = {
  id: string;
  character_id: string;
  skill_id: string;
  xp: number;
  mastery_level: string;
  mastery_overridden: boolean;
  last_xp_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export default class PostgresCharacterSkillRepository implements CharacterSkillRepository {
  async findByCharacterAndSkillIds(
    characterId: string,
    skillIds: string[],
  ): Promise<CharacterSkill[]> {
    if (skillIds.length === 0) {
      return [];
    }

    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<CharacterSkillRow>(
          `
          SELECT
            id,
            character_id,
            skill_id,
            xp,
            mastery_level,
            mastery_overridden,
            last_xp_at,
            created_at,
            updated_at
          FROM character_skills
          WHERE character_id = $1
            AND skill_id = ANY($2::uuid[])
          `,
          [characterId, skillIds],
        );

      return result.rows.map((row) =>
        CharacterSkill.rebuild({
          id: row.id,
          characterId: row.character_id,
          skillId: row.skill_id,
          xp: row.xp,
          masteryLevel: row.mastery_level,
          masteryOverridden: row.mastery_overridden,
          lastXpAt: row.last_xp_at,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }),
      );
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load character skills",
      );
    }
  }
}
