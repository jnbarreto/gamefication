import { TEST_USER_ID } from '../../test/testAuth.js';
import GetDashboard from "../../application/usecase/dashboard/GetDashboard.js";
import GetCharacter from "../../application/usecase/character/GetCharacter.js";
import ListStaleSkills from "../../application/usecase/skill/ListStaleSkills.js";
import ListTodayQuests from "../../application/usecase/quest/ListTodayQuests.js";
import ListXpTransactions from "../../application/usecase/xp/ListXpTransactions.js";
import { loadEnv } from "../config/loadEnv.js";
import DatabasePool from "../database/DatabasePool.js";
import PostgresCharacterRepository from "./PostgresCharacterRepository.js";
import PostgresQuestMissionRepository from "./PostgresQuestMissionRepository.js";
import PostgresQuestRepository from "./PostgresQuestRepository.js";
import PostgresSkillRepository from "./PostgresSkillRepository.js";
import PostgresStreakRepository from "./PostgresStreakRepository.js";
import PostgresXpTransactionRepository from "./PostgresXpTransactionRepository.js";

const describeIntegration = process.env.DATABASE_URL ? describe : describe.skip;

describeIntegration("GetDashboard integration", () => {
  beforeAll(() => {
    loadEnv();
    DatabasePool.getInstance();
  });

  afterAll(async () => {
    await DatabasePool.getInstance().close();
  });

  it("loads all dashboard sections from seeded data", async () => {
    const characterRepository = new PostgresCharacterRepository();
    const getDashboard = new GetDashboard(
      new GetCharacter(characterRepository),
      new ListTodayQuests(
        characterRepository,
        new PostgresQuestRepository(),
        new PostgresQuestMissionRepository(),
        "UTC",
      ),
      new ListXpTransactions(
        characterRepository,
        new PostgresXpTransactionRepository(),
      ),
      new ListStaleSkills(characterRepository, new PostgresSkillRepository()),
      new PostgresStreakRepository(),
      new PostgresSkillRepository(),
      new PostgresXpTransactionRepository(),
      "UTC",
    );

    const result = await getDashboard.execute(TEST_USER_ID);

    expect(result.character.getName()).toBe("Leone");
    expect(result.calendarDay).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Array.isArray(result.todayQuests)).toBe(true);
    expect(result.topSkills.length).toBeGreaterThan(0);
    expect(Array.isArray(result.recentTransactions)).toBe(true);
    expect(result.streak.getBestCount()).toBeGreaterThanOrEqual(0);
    expect(result.activityHeatmap.cells.length).toBeGreaterThan(0);
    expect(Array.isArray(result.staleSkills)).toBe(true);
  });
});
