import MigrationLoader from "../MigrationLoader.js";
import {
  SEED_CHARACTER_ID,
  buildMvpSeedSql,
  getSeedAchievementCount,
  getSeedCategoryCount,
  getSeedSkillCount,
  getSeedSkillSlugs,
} from "./mvpSeedData.js";

describe("mvpSeedData", () => {
  it("defines expected seed counts", () => {
    expect(getSeedCategoryCount()).toBe(7);
    expect(getSeedSkillCount()).toBe(40);
    expect(getSeedAchievementCount()).toBe(10);
  });

  it("generates kebab-case slugs for all skills", () => {
    const slugs = getSeedSkillSlugs();

    expect(slugs).toHaveLength(40);
    expect(new Set(slugs).size).toBe(40);

    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("includes seeded character and streak inserts", () => {
    const sql = buildMvpSeedSql();

    expect(sql).toContain(`'${SEED_CHARACTER_ID}'`);
    expect(sql).toContain("INSERT INTO skill_categories");
    expect(sql).toContain("INSERT INTO achievements");
    expect(sql).toContain("'MANUAL'");
  });
});

describe("MigrationLoader", () => {
  it("loads domain schema and seed migrations in order", async () => {
    const migrations = await MigrationLoader.load();
    const versions = migrations.map((migration) => migration.version);

    expect(versions).toEqual([
      "202609140001",
      "202609140002",
      "202609140003",
      "202609140004",
      "202609140005",
      "202609140006",
      "202609140007",
      "202609140008",
      "202609140009",
      "202609140010",
    ]);
    expect(migrations[7]?.name).toBe("auth_tokens");
    expect(migrations[6]?.name).toBe("users_and_auth");
    expect(migrations[5]?.name).toBe("quest_missions");
    expect(migrations[4]?.name).toBe("custom_skill_categories");
    expect(migrations[3]?.name).toBe("skill_hierarchy_and_custom");
    expect(migrations[1]?.name).toBe("create_domain_schema");
    expect(migrations[2]?.name).toBe("seed_mvp_data");
  });
});
