import { TEST_USER_ID } from '../../test/testAuth.js';
import { EvidenceType } from "../../domain/enum/EvidenceType.js";
import { QuestDifficulty } from "../../domain/enum/QuestDifficulty.js";
import { QuestStatus } from "../../domain/enum/QuestStatus.js";
import { QuestType } from "../../domain/enum/QuestType.js";
import Quest from "../../domain/quest/Quest.js";
import CompleteQuest from "../../application/usecase/quest/CompleteQuest.js";
import { loadEnv } from "../config/loadEnv.js";
import DatabasePool from "../database/DatabasePool.js";
import { SEED_CHARACTER_ID } from "../database/migration/seed/mvpSeedData.js";
import PostgresCharacterRepository from "./PostgresCharacterRepository.js";
import PostgresCharacterSkillRepository from "./PostgresCharacterSkillRepository.js";
import PostgresQuestCompletionRepository from "./PostgresQuestCompletionRepository.js";
import PostgresQuestMissionRepository from "./PostgresQuestMissionRepository.js";
import PostgresQuestRepository from "./PostgresQuestRepository.js";
import PostgresStreakRepository from "./PostgresStreakRepository.js";

const describeIntegration = process.env.DATABASE_URL ? describe : describe.skip;

describeIntegration("PostgresQuestCompletionRepository", () => {
  const nodeSkillId = "00000000-0000-4000-8000-0000000003e9";
  const timezone = "UTC";

  beforeAll(() => {
    loadEnv();
    DatabasePool.getInstance();
  });

  afterAll(async () => {
    await DatabasePool.getInstance().close();
  });

  it("persists quest completion atomically", async () => {
    const questRepository = new PostgresQuestRepository();
    const quest = Quest.create({
      characterId: SEED_CHARACTER_ID,
      title: "Completion integration quest",
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

    await completeQuest.execute(TEST_USER_ID, quest.getId().toString(), {
      evidence: {
        type: EvidenceType.URL,
        value: "https://example.com/pr/1",
        description: "Merged PR",
      },
    });

    const loaded = await questRepository.findById(quest.getId().toString());

    expect(loaded?.getStatus()).toBe(QuestStatus.COMPLETED);
    expect(loaded?.getCompletedAt()).not.toBeNull();

    const character = await new PostgresCharacterRepository().findByUserId(TEST_USER_ID);

    expect(character?.getTotalXp()).toBeGreaterThanOrEqual(25);

    const transactions = await DatabasePool.getInstance()
      .getPool()
      .query<{ count: string }>(
        `
        SELECT COUNT(*)::text AS count
        FROM xp_transactions
        WHERE source_id = $1
        `,
        [quest.getId().toString()],
      );

    expect(Number(transactions.rows[0]?.count ?? 0)).toBe(1);

    const evidence = await DatabasePool.getInstance()
      .getPool()
      .query<{ count: string }>(
        `
        SELECT COUNT(*)::text AS count
        FROM evidences
        WHERE entity_type = 'QUEST' AND entity_id = $1
        `,
        [quest.getId().toString()],
      );

    expect(Number(evidence.rows[0]?.count ?? 0)).toBe(1);
  });
});
