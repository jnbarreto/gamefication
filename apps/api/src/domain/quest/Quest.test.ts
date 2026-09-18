import { QuestDifficulty } from "../enum/QuestDifficulty.js";
import { QuestStatus } from "../enum/QuestStatus.js";
import { QuestType } from "../enum/QuestType.js";
import DomainError from "../exception/DomainError.js";
import InvalidValueError from "../exception/InvalidValueError.js";
import Quest from "./Quest.js";

const characterId = "550e8400-e29b-41d4-a716-446655440000";
const nodeSkillId = "550e8400-e29b-41d4-a716-446655440001";
const redisSkillId = "550e8400-e29b-41d4-a716-446655440002";

function createQuestProps(overrides: Partial<Parameters<typeof Quest.create>[0]> = {}) {
  return {
    characterId,
    title: "Implement Redis cache",
    description: "Add cache layer to read endpoint",
    type: QuestType.WORK,
    difficulty: QuestDifficulty.MEDIUM,
    skillAllocations: [
      { skillId: nodeSkillId, xp: 15 },
      { skillId: redisSkillId, xp: 10 },
    ],
    ...overrides,
  };
}

describe("Quest", () => {
  it("creates a quest with default XP from difficulty", () => {
    const quest = Quest.create(createQuestProps());

    expect(quest.getTitle()).toBe("Implement Redis cache");
    expect(quest.getBaseXp()).toBe(25);
    expect(quest.getStatus()).toBe(QuestStatus.TODO);
    expect(quest.getSkillAllocations()).toHaveLength(2);
  });

  it("requires at least one skill allocation", () => {
    expect(() => Quest.create(createQuestProps({ skillAllocations: [] }))).toThrow(
      InvalidValueError,
    );
  });

  it("requires skill allocations to sum to base XP", () => {
    expect(() =>
      Quest.create(
        createQuestProps({
          baseXp: 30,
          skillAllocations: [{ skillId: nodeSkillId, xp: 20 }],
        }),
      ),
    ).toThrow(InvalidValueError);
  });

  it("rejects duplicate skill allocations", () => {
    expect(() =>
      Quest.create(
        createQuestProps({
          skillAllocations: [
            { skillId: nodeSkillId, xp: 15 },
            { skillId: nodeSkillId, xp: 10 },
          ],
        }),
      ),
    ).toThrow(InvalidValueError);
  });

  it("transitions through start and complete", () => {
    const quest = Quest.create(createQuestProps());
    const completedAt = new Date("2026-09-14T15:00:00.000Z");

    quest.start();
    expect(quest.getStatus()).toBe(QuestStatus.IN_PROGRESS);

    quest.complete(completedAt);
    expect(quest.getStatus()).toBe(QuestStatus.COMPLETED);
    expect(quest.getCompletedAt()).toEqual(completedAt);
  });

  it("allows cancel from TODO or IN_PROGRESS", () => {
    const quest = Quest.create(createQuestProps());

    quest.cancel();
    expect(quest.getStatus()).toBe(QuestStatus.CANCELLED);
  });

  it("reopens a cancelled quest back to TODO", () => {
    const quest = Quest.create(createQuestProps());

    quest.start();
    quest.cancel();
    quest.reopen();

    expect(quest.getStatus()).toBe(QuestStatus.TODO);
    expect(quest.getCompletedAt()).toBeNull();
  });

  it("reopens a completed quest back to TODO", () => {
    const quest = Quest.create(createQuestProps());

    quest.start();
    quest.complete();
    quest.reopen();

    expect(quest.getStatus()).toBe(QuestStatus.TODO);
    expect(quest.getCompletedAt()).toBeNull();
  });

  it("blocks invalid transitions", () => {
    const quest = Quest.create(createQuestProps());

    expect(() => quest.complete()).toThrow(DomainError);

    quest.start();
    quest.complete();

    expect(() => quest.start()).toThrow(DomainError);
  });

  it("resets completed weekly quests for a new calendar week", () => {
    const quest = Quest.create(
      createQuestProps({
        type: QuestType.WEEKLY,
        difficulty: QuestDifficulty.MEDIUM,
        skillAllocations: [{ skillId: nodeSkillId, xp: 25 }],
        calendarWeekStart: "2026-09-08",
      }),
    );

    quest.start();
    quest.complete(new Date("2026-09-12T18:00:00.000Z"));
    quest.resetForNewCalendarWeek("2026-09-14");

    expect(quest.getStatus()).toBe(QuestStatus.TODO);
    expect(quest.getCompletedAt()).toBeNull();
    expect(quest.getCalendarWeekStart()).toBe("2026-09-14");
  });

  it("resets completed daily quests for a new calendar day", () => {
    const quest = Quest.create(
      createQuestProps({
        type: QuestType.DAILY,
        difficulty: QuestDifficulty.SMALL,
        skillAllocations: [{ skillId: nodeSkillId, xp: 10 }],
        calendarDay: "2026-09-13",
      }),
    );

    quest.start();
    quest.complete(new Date("2026-09-13T18:00:00.000Z"));
    quest.resetForNewCalendarDay("2026-09-14");

    expect(quest.getStatus()).toBe(QuestStatus.TODO);
    expect(quest.getCompletedAt()).toBeNull();
    expect(quest.getCalendarDay()).toBe("2026-09-14");
  });

  it("rebuilds from persistence", () => {
    const createdAt = new Date("2026-09-01T00:00:00.000Z");
    const updatedAt = new Date("2026-09-14T00:00:00.000Z");
    const completedAt = new Date("2026-09-14T15:00:00.000Z");

    const quest = Quest.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440003",
      characterId,
      title: "Implement Redis cache",
      description: "Add cache layer",
      type: QuestType.WORK,
      difficulty: QuestDifficulty.MEDIUM,
      baseXp: 25,
      status: QuestStatus.COMPLETED,
      skillAllocations: [
        { skillId: nodeSkillId, xp: 15 },
        { skillId: redisSkillId, xp: 10 },
      ],
      dueDate: null,
      completedAt,
      notes: null,
      calendarDay: null,
      calendarWeekStart: null,
      createdAt,
      updatedAt,
    });

    expect(quest.getStatus()).toBe(QuestStatus.COMPLETED);
    expect(quest.getCompletedAt()).toEqual(completedAt);
  });
});
