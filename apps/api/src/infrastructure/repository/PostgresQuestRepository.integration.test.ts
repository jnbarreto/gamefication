import { QuestDifficulty } from "../../domain/enum/QuestDifficulty.js";
import { QuestType } from "../../domain/enum/QuestType.js";
import Quest from "../../domain/quest/Quest.js";
import { loadEnv } from "../config/loadEnv.js";
import DatabasePool from "../database/DatabasePool.js";
import { SEED_CHARACTER_ID } from "../database/migration/seed/mvpSeedData.js";
import PostgresQuestRepository from "./PostgresQuestRepository.js";

const describeIntegration = process.env.DATABASE_URL ? describe : describe.skip;

describeIntegration("PostgresQuestRepository", () => {
  const nodeSkillId = "00000000-0000-4000-8000-0000000003e9";

  beforeAll(() => {
    loadEnv();
    DatabasePool.getInstance();
  });

  afterAll(async () => {
    await DatabasePool.getInstance().close();
  });

  it("persists a quest with skill allocations", async () => {
    const repository = new PostgresQuestRepository();
    const quest = Quest.create({
      characterId: SEED_CHARACTER_ID,
      title: "Integration quest",
      type: QuestType.WORK,
      difficulty: QuestDifficulty.MEDIUM,
      skillAllocations: [{ skillId: nodeSkillId, xp: 25 }],
    });

    await repository.save(quest);

    const result = await DatabasePool.getInstance()
      .getPool()
      .query<{ count: string }>(
        `
        SELECT COUNT(*)::text AS count
        FROM quest_skill_allocations
        WHERE quest_id = $1
        `,
        [quest.getId().toString()],
      );

    expect(Number(result.rows[0]?.count ?? 0)).toBe(1);
  });

  it("loads quests with skill allocations", async () => {
    const repository = new PostgresQuestRepository();
    const quest = Quest.create({
      characterId: SEED_CHARACTER_ID,
      title: "List integration quest",
      type: QuestType.WORK,
      difficulty: QuestDifficulty.MEDIUM,
      skillAllocations: [{ skillId: nodeSkillId, xp: 25 }],
    });

    await repository.save(quest);

    const quests = await repository.findByCharacterId(SEED_CHARACTER_ID, {
      type: QuestType.WORK,
    });
    const loaded = quests.find((item) => item.getId().equals(quest.getId()));

    expect(loaded).toBeDefined();
    expect(loaded?.getSkillAllocations()).toHaveLength(1);
  });
});
