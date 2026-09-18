import { QuestDifficulty } from "../../domain/enum/QuestDifficulty.js";
import { QuestType } from "../../domain/enum/QuestType.js";
import Quest from "../../domain/quest/Quest.js";
import CompleteQuest from "../../application/usecase/quest/CompleteQuest.js";
import ListXpTransactions from "../../application/usecase/xp/ListXpTransactions.js";
import { loadEnv } from "../config/loadEnv.js";
import DatabasePool from "../database/DatabasePool.js";
import { SEED_CHARACTER_ID } from "../database/migration/seed/mvpSeedData.js";
import PostgresCharacterRepository from "./PostgresCharacterRepository.js";
import PostgresCharacterSkillRepository from "./PostgresCharacterSkillRepository.js";
import PostgresQuestCompletionRepository from "./PostgresQuestCompletionRepository.js";
import PostgresQuestMissionRepository from "./PostgresQuestMissionRepository.js";
import PostgresQuestRepository from "./PostgresQuestRepository.js";
import PostgresStreakRepository from "./PostgresStreakRepository.js";
import PostgresXpTransactionRepository from "./PostgresXpTransactionRepository.js";

const describeIntegration = process.env.DATABASE_URL ? describe : describe.skip;

describeIntegration("PostgresXpTransactionRepository", () => {
  const nodeSkillId = "00000000-0000-4000-8000-0000000003e9";
  const timezone = "UTC";

  beforeAll(() => {
    loadEnv();
    DatabasePool.getInstance();
  });

  afterAll(async () => {
    await DatabasePool.getInstance().close();
  });

  it("loads transactions ordered by created_at desc with filters", async () => {
    const questRepository = new PostgresQuestRepository();
    const quest = Quest.create({
      characterId: SEED_CHARACTER_ID,
      title: "XP history integration quest",
      type: QuestType.WORK,
      difficulty: QuestDifficulty.MEDIUM,
      skillAllocations: [{ skillId: nodeSkillId, xp: 25 }],
    });

    quest.start();
    await questRepository.save(quest);

    const completeQuest = new CompleteQuest(
      new PostgresCharacterRepository(),
      questRepository,
      new PostgresCharacterSkillRepository(),
      new PostgresStreakRepository(),
      new PostgresQuestCompletionRepository(),
      new PostgresQuestMissionRepository(),
      timezone,
    );

    await completeQuest.execute(TEST_USER_ID, quest.getId().toString());

    const repository = new PostgresXpTransactionRepository();
    const allTransactions = await repository.findByCharacterId(SEED_CHARACTER_ID);
    const filteredBySkill = await repository.findByCharacterId(SEED_CHARACTER_ID, {
      skillId: nodeSkillId,
    });
    const createdAfter = new Date();
    createdAfter.setDate(createdAfter.getDate() - 30);
    const filteredByPeriod = await repository.findByCharacterId(SEED_CHARACTER_ID, {
      createdAfter,
    });

    expect(allTransactions.length).toBeGreaterThanOrEqual(1);
    expect(filteredBySkill.length).toBeGreaterThanOrEqual(1);
    expect(filteredByPeriod.length).toBeGreaterThanOrEqual(1);
    expect(
      filteredBySkill.every((tx) => tx.getSkillId()?.toString() === nodeSkillId),
    ).toBe(true);

    const listXpTransactions = new ListXpTransactions(
      new PostgresCharacterRepository(),
      repository,
    );
    const listed = await listXpTransactions.execute(TEST_USER_ID, { skillId: nodeSkillId });

    expect(listed.length).toBeGreaterThanOrEqual(1);
  });
});
