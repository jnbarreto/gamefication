import { TEST_USER_ID } from '../../test/testAuth.js';
import { EvidenceType } from "../../domain/enum/EvidenceType.js";
import ApplicationError from "../../application/exception/ApplicationError.js";
import ListAchievements from "../../application/usecase/achievement/ListAchievements.js";
import UnlockAchievement from "../../application/usecase/achievement/UnlockAchievement.js";
import { loadEnv } from "../config/loadEnv.js";
import DatabasePool from "../database/DatabasePool.js";
import { getSeedAchievementCount } from "../database/migration/seed/mvpSeedData.js";
import PostgresAchievementRepository from "./PostgresAchievementRepository.js";
import PostgresAchievementUnlockRepository from "./PostgresAchievementUnlockRepository.js";
import PostgresCharacterRepository from "./PostgresCharacterRepository.js";

const describeIntegration = process.env.DATABASE_URL ? describe : describe.skip;

describeIntegration("PostgresAchievementRepository", () => {
  beforeAll(() => {
    loadEnv();
    DatabasePool.getInstance();
  });

  afterAll(async () => {
    await DatabasePool.getInstance().close();
  });

  it("lists achievements and unlocks one achievement atomically", async () => {
    const characterRepository = new PostgresCharacterRepository();
    const achievementRepository = new PostgresAchievementRepository();
    const listAchievements = new ListAchievements(
      characterRepository,
      achievementRepository,
    );
    const unlockAchievement = new UnlockAchievement(
      characterRepository,
      achievementRepository,
      new PostgresAchievementUnlockRepository(),
    );

    const entries = await listAchievements.execute(TEST_USER_ID);

    expect(entries.length).toBe(getSeedAchievementCount());

    const target = entries.find((entry) => entry.unlock === null) ?? entries[0]!;
    const slug = target.achievement.getSlug();

    if (target.unlock === null) {
      const result = await unlockAchievement.execute(TEST_USER_ID, slug, {
        evidence: {
          type: EvidenceType.URL,
          value: "https://example.com/pr/1",
          description: "Integration unlock",
        },
      });

      expect(result.achievement.getSlug()).toBe(slug);
      expect(result.xpTransaction).not.toBeNull();
    }

    await expect(unlockAchievement.execute(TEST_USER_ID, slug)).rejects.toBeInstanceOf(
      ApplicationError,
    );

    const refreshed = await listAchievements.execute(TEST_USER_ID);
    const unlocked = refreshed.find((entry) => entry.achievement.getSlug() === slug);

    expect(unlocked?.unlock).not.toBeNull();
  });
});
