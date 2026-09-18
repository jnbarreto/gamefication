import type SkillRepository from "../../application/repository/SkillRepository.js";
import CharacterSkill from "../../domain/skill/CharacterSkill.js";
import Skill from "../../domain/skill/Skill.js";
import SkillCategory from "../../domain/skill/SkillCategory.js";
import DatabasePool from "../database/DatabasePool.js";
import InfraError from "../exception/InfraError.js";

type SkillTreeRow = {
  category_id: string;
  category_name: string;
  category_display_order: number;
  category_is_custom: boolean;
  skill_id: string;
  skill_name: string;
  skill_slug: string;
  skill_display_order: number;
  skill_description: string | null;
  skill_parent_skill_id: string | null;
  skill_is_custom: boolean;
  character_skill_id: string;
  character_id: string;
  xp: number;
  mastery_level: string;
  mastery_overridden: boolean;
  last_xp_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

type SkillCatalogRow = {
  category_id: string;
  category_name: string;
  category_display_order: number;
  category_is_custom: boolean;
  skill_id: string;
  skill_name: string;
  skill_slug: string;
  skill_display_order: number;
  skill_description: string | null;
  skill_parent_skill_id: string | null;
  skill_is_custom: boolean;
};

type SkillCategoryRow = {
  category_id: string;
  category_name: string;
  category_display_order: number;
  category_is_custom: boolean;
};

export default class PostgresSkillRepository implements SkillRepository {
  async findSkillTree(characterId: string) {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<SkillTreeRow>(
          `
          SELECT
            sc.id AS category_id,
            sc.name AS category_name,
            sc.display_order AS category_display_order,
            sc.is_custom AS category_is_custom,
            s.id AS skill_id,
            s.name AS skill_name,
            s.slug AS skill_slug,
            s.display_order AS skill_display_order,
            s.description AS skill_description,
            s.parent_skill_id AS skill_parent_skill_id,
            s.is_custom AS skill_is_custom,
            cs.id AS character_skill_id,
            cs.character_id,
            cs.xp,
            cs.mastery_level,
            cs.mastery_overridden,
            cs.last_xp_at,
            cs.created_at,
            cs.updated_at
          FROM character_skills cs
          JOIN skills s ON s.id = cs.skill_id
          JOIN skill_categories sc ON sc.id = s.category_id
          WHERE cs.character_id = $1
          ORDER BY sc.display_order ASC, s.display_order ASC
          `,
          [characterId],
        );

      return result.rows.map((row) => this.toTreeEntry(row));
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load skill tree",
      );
    }
  }

  async findById(skillId: string) {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<SkillCatalogRow>(
          `
          SELECT
            sc.id AS category_id,
            sc.name AS category_name,
            sc.display_order AS category_display_order,
            sc.is_custom AS category_is_custom,
            s.id AS skill_id,
            s.name AS skill_name,
            s.slug AS skill_slug,
            s.display_order AS skill_display_order,
            s.description AS skill_description,
            s.parent_skill_id AS skill_parent_skill_id,
            s.is_custom AS skill_is_custom
          FROM skills s
          JOIN skill_categories sc ON sc.id = s.category_id
          WHERE s.id = $1
          LIMIT 1
          `,
          [skillId],
        );

      const row = result.rows[0];

      if (!row) {
        return null;
      }

      return this.toCatalogEntry(row);
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load skill",
      );
    }
  }

  async slugExists(slug: string): Promise<boolean> {
    const result = await DatabasePool.getInstance()
      .getPool()
      .query<{ exists: boolean }>(
        `SELECT EXISTS(SELECT 1 FROM skills WHERE slug = $1) AS exists`,
        [slug],
      );

    return result.rows[0]?.exists ?? false;
  }

  async countChildren(skillId: string): Promise<number> {
    const result = await DatabasePool.getInstance()
      .getPool()
      .query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM skills WHERE parent_skill_id = $1`,
        [skillId],
      );

    return Number(result.rows[0]?.count ?? 0);
  }

  async countQuestAllocations(skillId: string): Promise<number> {
    const result = await DatabasePool.getInstance()
      .getPool()
      .query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM quest_skill_allocations WHERE skill_id = $1`,
        [skillId],
      );

    return Number(result.rows[0]?.count ?? 0);
  }

  async maxDepthFromRoot(skillId: string): Promise<number> {
    const result = await DatabasePool.getInstance()
      .getPool()
      .query<{ depth: number }>(
        `
        WITH RECURSIVE ancestors AS (
          SELECT id, parent_skill_id, 1 AS depth
          FROM skills
          WHERE id = $1
          UNION ALL
          SELECT parent.id, parent.parent_skill_id, ancestors.depth + 1
          FROM skills parent
          JOIN ancestors ON ancestors.parent_skill_id = parent.id
        )
        SELECT MAX(depth)::int AS depth FROM ancestors
        `,
        [skillId],
      );

    return result.rows[0]?.depth ?? 1;
  }

  async maxDepthBelow(skillId: string): Promise<number> {
    const result = await DatabasePool.getInstance()
      .getPool()
      .query<{ depth: number }>(
        `
        WITH RECURSIVE descendants AS (
          SELECT id, 1 AS depth
          FROM skills
          WHERE id = $1
          UNION ALL
          SELECT child.id, descendants.depth + 1
          FROM skills child
          JOIN descendants ON child.parent_skill_id = descendants.id
        )
        SELECT MAX(depth)::int AS depth FROM descendants
        `,
        [skillId],
      );

    return result.rows[0]?.depth ?? 1;
  }

  async wouldCreateCycle(skillId: string, newParentSkillId: string): Promise<boolean> {
    if (skillId === newParentSkillId) {
      return true;
    }

    const result = await DatabasePool.getInstance()
      .getPool()
      .query<{ exists: boolean }>(
        `
        WITH RECURSIVE descendants AS (
          SELECT id
          FROM skills
          WHERE id = $1
          UNION ALL
          SELECT child.id
          FROM skills child
          JOIN descendants ON child.parent_skill_id = descendants.id
        )
        SELECT EXISTS(
          SELECT 1 FROM descendants WHERE id = $2
        ) AS exists
        `,
        [skillId, newParentSkillId],
      );

    return result.rows[0]?.exists ?? false;
  }

  async findAllCategories() {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<SkillCategoryRow>(
          `
          SELECT
            id AS category_id,
            name AS category_name,
            display_order AS category_display_order,
            is_custom AS category_is_custom
          FROM skill_categories
          ORDER BY display_order ASC, name ASC
          `,
        );

      return result.rows.map((row) => this.toCategory(row));
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load skill categories",
      );
    }
  }

  async categoryNameExists(name: string): Promise<boolean> {
    const result = await DatabasePool.getInstance()
      .getPool()
      .query<{ exists: boolean }>(
        `
        SELECT EXISTS(
          SELECT 1
          FROM skill_categories
          WHERE LOWER(name) = LOWER($1)
        ) AS exists
        `,
        [name.trim()],
      );

    return result.rows[0]?.exists ?? false;
  }

  async nextCategoryDisplayOrder(): Promise<number> {
    const result = await DatabasePool.getInstance()
      .getPool()
      .query<{ next_order: number }>(
        `
        SELECT COALESCE(MAX(display_order), -1) + 1 AS next_order
        FROM skill_categories
        `,
      );

    return result.rows[0]?.next_order ?? 0;
  }

  async findCategoryById(categoryId: string) {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<SkillCategoryRow>(
          `
          SELECT
            id AS category_id,
            name AS category_name,
            display_order AS category_display_order,
            is_custom AS category_is_custom
          FROM skill_categories
          WHERE id = $1
          LIMIT 1
          `,
          [categoryId],
        );

      const row = result.rows[0];

      return row ? this.toCategory(row) : null;
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to load skill category",
      );
    }
  }

  async countSkillsInCategory(categoryId: string): Promise<number> {
    try {
      const result = await DatabasePool.getInstance()
        .getPool()
        .query<{ count: string }>(
          `SELECT COUNT(*)::text AS count FROM skills WHERE category_id = $1`,
          [categoryId],
        );

      return Number(result.rows[0]?.count ?? 0);
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to count category skills",
      );
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await DatabasePool.getInstance()
        .getPool()
        .query(`DELETE FROM skill_categories WHERE id = $1`, [categoryId]);
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to delete skill category",
      );
    }
  }

  async saveCategory(category: SkillCategory): Promise<void> {
    try {
      await DatabasePool.getInstance()
        .getPool()
        .query(
          `
          INSERT INTO skill_categories (id, name, display_order, is_custom)
          VALUES ($1, $2, $3, $4)
          `,
          [
            category.getId().toString(),
            category.getName(),
            category.getDisplayOrder(),
            category.isCustomCategory(),
          ],
        );
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to save skill category",
      );
    }
  }

  async nextDisplayOrder(categoryId: string, parentSkillId: string | null): Promise<number> {
    const result = await DatabasePool.getInstance()
      .getPool()
      .query<{ next_order: number }>(
        `
        SELECT COALESCE(MAX(display_order), -1) + 1 AS next_order
        FROM skills
        WHERE category_id = $1
          AND (
            ($2::uuid IS NULL AND parent_skill_id IS NULL)
            OR parent_skill_id = $2::uuid
          )
        `,
        [categoryId, parentSkillId],
      );

    return result.rows[0]?.next_order ?? 0;
  }

  async saveWithCharacterProgress(
    skill: Skill,
    characterId: string,
    progress: CharacterSkill,
  ): Promise<void> {
    const pool = DatabasePool.getInstance().getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
        INSERT INTO skills (
          id,
          category_id,
          name,
          slug,
          display_order,
          description,
          parent_skill_id,
          is_custom
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          skill.getId().toString(),
          skill.getCategoryId().toString(),
          skill.getName(),
          skill.getSlug(),
          skill.getDisplayOrder(),
          skill.getDescription(),
          skill.getParentSkillId()?.toString() ?? null,
          skill.isCustomSkill(),
        ],
      );

      await client.query(
        `
        INSERT INTO character_skills (
          id,
          character_id,
          skill_id,
          xp,
          mastery_level,
          mastery_overridden,
          last_xp_at,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          progress.getId().toString(),
          characterId,
          skill.getId().toString(),
          progress.getXp(),
          progress.getMasteryLevel(),
          progress.isMasteryOverridden(),
          progress.getLastXpAt(),
          progress.getCreatedAt(),
          progress.getUpdatedAt(),
        ],
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to save skill",
      );
    } finally {
      client.release();
    }
  }

  async update(skill: Skill): Promise<void> {
    try {
      await DatabasePool.getInstance()
        .getPool()
        .query(
          `
          UPDATE skills
          SET
            name = $2,
            description = $3,
            parent_skill_id = $4
          WHERE id = $1
          `,
          [
            skill.getId().toString(),
            skill.getName(),
            skill.getDescription(),
            skill.getParentSkillId()?.toString() ?? null,
          ],
        );
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to update skill",
      );
    }
  }

  async delete(skillId: string): Promise<void> {
    await this.deleteSkillData(skillId);
  }

  async deleteCategoryWithSkills(categoryId: string): Promise<void> {
    const pool = DatabasePool.getInstance().getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const skillsResult = await client.query<{
        id: string;
        parent_skill_id: string | null;
        is_custom: boolean;
      }>(
        `
        SELECT id, parent_skill_id, is_custom
        FROM skills
        WHERE category_id = $1
        `,
        [categoryId],
      );

      if (skillsResult.rows.some((row) => !row.is_custom)) {
        throw new InfraError("Category contains non-custom skills");
      }

      const orderedSkillIds = this.orderSkillIdsForDeletion(
        skillsResult.rows.map((row) => ({
          id: row.id,
          parentSkillId: row.parent_skill_id,
        })),
      );

      for (const skillId of orderedSkillIds) {
        await this.deleteSkillData(skillId, client);
      }

      await client.query(`DELETE FROM skill_categories WHERE id = $1`, [categoryId]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to delete skill category",
      );
    } finally {
      client.release();
    }
  }

  private async deleteSkillData(
    skillId: string,
    client: { query: (sql: string, params?: unknown[]) => Promise<unknown> } = DatabasePool.getInstance().getPool(),
  ): Promise<void> {
    try {
      await client.query(`DELETE FROM quest_skill_allocations WHERE skill_id = $1`, [skillId]);
      await client.query(`DELETE FROM character_skills WHERE skill_id = $1`, [skillId]);
      await client.query(`DELETE FROM skills WHERE id = $1`, [skillId]);
    } catch (error) {
      throw new InfraError(
        error instanceof Error ? error.message : "Failed to delete skill",
      );
    }
  }

  private orderSkillIdsForDeletion(
    skills: Array<{ id: string; parentSkillId: string | null }>,
  ): string[] {
    const remaining = new Set(skills.map((skill) => skill.id));
    const ordered: string[] = [];

    while (remaining.size > 0) {
      const leafId = [...remaining].find(
        (skillId) =>
          !skills.some(
            (skill) => skill.parentSkillId === skillId && remaining.has(skill.id),
          ),
      );

      if (!leafId) {
        throw new InfraError("Skill hierarchy cycle detected");
      }

      ordered.push(leafId);
      remaining.delete(leafId);
    }

    return ordered;
  }

  private toTreeEntry(row: SkillTreeRow) {
    return {
      category: this.toCategory(row),
      skill: this.toSkill(row),
      progress: CharacterSkill.rebuild({
        id: row.character_skill_id,
        characterId: row.character_id,
        skillId: row.skill_id,
        xp: row.xp,
        masteryLevel: row.mastery_level,
        masteryOverridden: row.mastery_overridden,
        lastXpAt: row.last_xp_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }),
    };
  }

  private toCatalogEntry(row: SkillCatalogRow) {
    return {
      category: this.toCategory(row),
      skill: this.toSkill(row),
    };
  }

  private toCategory(
    row: Pick<
      SkillCategoryRow,
      "category_id" | "category_name" | "category_display_order" | "category_is_custom"
    >,
  ) {
    return SkillCategory.rebuild({
      id: row.category_id,
      name: row.category_name,
      displayOrder: row.category_display_order,
      isCustom: row.category_is_custom,
    });
  }

  private toSkill(row: Pick<SkillCatalogRow, "skill_id" | "category_id" | "skill_name" | "skill_slug" | "skill_display_order" | "skill_description" | "skill_parent_skill_id" | "skill_is_custom">) {
    return Skill.rebuild({
      id: row.skill_id,
      categoryId: row.category_id,
      name: row.skill_name,
      slug: row.skill_slug,
      displayOrder: row.skill_display_order,
      description: row.skill_description,
      parentSkillId: row.skill_parent_skill_id,
      isCustom: row.skill_is_custom,
    });
  }
}
