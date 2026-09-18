import { loadEnv } from "../config/loadEnv.js";
import DatabasePool from "../database/DatabasePool.js";
import { SEED_ADMIN_USER_ID } from "../database/migration/seed/authSeedData.js";
import { SEED_CHARACTER_ID } from "../database/migration/seed/mvpSeedData.js";
import PostgresCharacterRepository from "./PostgresCharacterRepository.js";

const describeIntegration = process.env.DATABASE_URL ? describe : describe.skip;

describeIntegration("PostgresCharacterRepository", () => {
  beforeAll(() => {
    loadEnv();
    DatabasePool.getInstance();
  });

  afterAll(async () => {
    await DatabasePool.getInstance().close();
  });

  it("loads the seeded default character", async () => {
    const repository = new PostgresCharacterRepository();
    const character = await repository.findByUserId(SEED_ADMIN_USER_ID);

    expect(character).not.toBeNull();
    expect(character?.getId().toString()).toBe(SEED_CHARACTER_ID);
    expect(character?.getName()).toBe("Leone");
  });

  it("persists profile updates", async () => {
    const repository = new PostgresCharacterRepository();
    const character = await repository.findByUserId(SEED_ADMIN_USER_ID);

    if (!character) {
      throw new Error("Expected seeded character");
    }

    const originalRank = character.getCurrentRank();
    character.updateProfile({ currentRank: "Pleno Forte" });
    await repository.save(character);

    const reloaded = await repository.findByUserId(SEED_ADMIN_USER_ID);
    expect(reloaded?.getCurrentRank()).toBe("Pleno Forte");

    character.updateProfile({ currentRank: originalRank });
    await repository.save(character);
  });
});
