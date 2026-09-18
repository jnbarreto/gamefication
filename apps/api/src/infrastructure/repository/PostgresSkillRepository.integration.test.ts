import { loadEnv } from "../config/loadEnv.js";
import DatabasePool from "../database/DatabasePool.js";
import {
  getSeedSkillCount,
  SEED_CHARACTER_ID,
} from "../database/migration/seed/mvpSeedData.js";
import PostgresSkillRepository from "./PostgresSkillRepository.js";

const describeIntegration = process.env.DATABASE_URL ? describe : describe.skip;

describeIntegration("PostgresSkillRepository", () => {
  beforeAll(() => {
    loadEnv();
    DatabasePool.getInstance();
  });

  afterAll(async () => {
    await DatabasePool.getInstance().close();
  });

  it("loads the full seeded skill tree", async () => {
    const repository = new PostgresSkillRepository();
    const entries = await repository.findSkillTree(SEED_CHARACTER_ID);

    expect(entries).toHaveLength(getSeedSkillCount());
    expect(entries[0]?.category.getName()).toBe("Backend");
    expect(entries.every((entry) => entry.progress.getXp() >= 0)).toBe(true);
  });
});
