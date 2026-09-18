import type CharacterRepository from "../../application/repository/CharacterRepository.js";
import Character from "../../domain/character/Character.js";
import DatabasePool from "../database/DatabasePool.js";
import InfraError from "../exception/InfraError.js";

type CharacterRow = {
  id: string;
  name: string;
  character_class: string;
  specialization: string;
  subclass: string | null;
  career_goal: string | null;
  current_rank: string | null;
  total_xp: number;
  created_at: Date;
  updated_at: Date;
};

export default class PostgresCharacterRepository implements CharacterRepository {
  async findByUserId(userId: string): Promise<Character | null> {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<CharacterRow>(
          `
          SELECT
            id,
            name,
            character_class,
            specialization,
            subclass,
            career_goal,
            current_rank,
            total_xp,
            created_at,
            updated_at
          FROM characters
          WHERE user_id = $1
          LIMIT 1
          `,
          [userId],
        );

      const row = result.rows[0];

      if (!row) {
        return null;
      }

      return this.toDomain(row);
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load character",
      );
    }
  }

  async save(character: Character): Promise<void> {
    try {
      await DatabasePool.getInstance()
        .getPool()
        .query(
          `
          UPDATE characters
          SET
            name = $1,
            character_class = $2,
            specialization = $3,
            subclass = $4,
            career_goal = $5,
            current_rank = $6,
            updated_at = $7
          WHERE id = $8
          `,
          [
            character.getName(),
            character.getCharacterClass(),
            character.getSpecialization(),
            character.getSubclass(),
            character.getCareerGoal(),
            character.getCurrentRank(),
            character.getUpdatedAt(),
            character.getId().toString(),
          ],
        );
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to save character",
      );
    }
  }

  private toDomain(row: CharacterRow): Character {
    return Character.rebuild({
      id: row.id,
      name: row.name,
      characterClass: row.character_class,
      specialization: row.specialization,
      subclass: row.subclass,
      careerGoal: row.career_goal,
      currentRank: row.current_rank,
      totalXp: row.total_xp,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
