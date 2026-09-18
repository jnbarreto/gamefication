import { TEST_USER_ID } from '../../../test/testAuth.js';
import { XpSourceType } from "../../../domain/enum/XpSourceType.js";
import Character from "../../../domain/character/Character.js";
import XpTransaction from "../../../domain/xp/XpTransaction.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type { ListXpTransactionsFilter } from "../../repository/XpTransactionRepository.js";
import type XpTransactionRepository from "../../repository/XpTransactionRepository.js";
import ListXpTransactions from "./ListXpTransactions.js";

class InMemoryCharacterRepository implements CharacterRepository {
  constructor(private character: Character | null) {}

  async findByUserId(_userId: string) {
    return this.character;
  }

  async save() {}
}

class InMemoryXpTransactionRepository implements XpTransactionRepository {
  constructor(private transactions: XpTransaction[]) {}

  async findByCharacterId(_characterId: string, filter: ListXpTransactionsFilter = {}) {
    return this.transactions.filter((transaction) => {
      if (filter.createdAfter && transaction.getCreatedAt() < filter.createdAfter) {
        return false;
      }

      if (filter.skillId && transaction.getSkillId()?.toString() !== filter.skillId) {
        return false;
      }

      return true;
    });
  }

  async summarizeDailyXp() {
    return [];
  }
}

const nodeSkillId = "550e8400-e29b-41d4-a716-446655440001";
const questId = "550e8400-e29b-41d4-a716-446655440002";

describe("ListXpTransactions", () => {
  it("returns transactions for the default character", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const transactions = [
      XpTransaction.createFromQuest({
        characterId: character.getId().toString(),
        questId,
        amount: 25,
        skillId: nodeSkillId,
        description: "Quest completed: Implement endpoint",
      }),
      XpTransaction.createFromStreakBonus({
        characterId: character.getId().toString(),
        amount: 10,
        description: "Streak bonus: 3 days",
      }),
    ];
    const useCase = new ListXpTransactions(
      new InMemoryCharacterRepository(character),
      new InMemoryXpTransactionRepository(transactions),
    );

    const result = await useCase.execute(TEST_USER_ID);

    expect(result).toHaveLength(2);
    expect(result[0]?.getSourceType()).toBe(XpSourceType.QUEST);
  });

  it("filters transactions by skillId", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const otherSkillId = "550e8400-e29b-41d4-a716-446655440003";
    const transactions = [
      XpTransaction.createFromQuest({
        characterId: character.getId().toString(),
        questId,
        amount: 25,
        skillId: nodeSkillId,
        description: "Quest completed: Node.js",
      }),
      XpTransaction.createFromQuest({
        characterId: character.getId().toString(),
        questId,
        amount: 25,
        skillId: otherSkillId,
        description: "Quest completed: PostgreSQL",
      }),
    ];
    const useCase = new ListXpTransactions(
      new InMemoryCharacterRepository(character),
      new InMemoryXpTransactionRepository(transactions),
    );

    const result = await useCase.execute(TEST_USER_ID, { skillId: nodeSkillId });

    expect(result).toHaveLength(1);
    expect(result[0]?.getSkillId()?.toString()).toBe(nodeSkillId);
  });

  it("filters transactions by createdAfter", async () => {
    const character = Character.create({
      name: "Leone",
      characterClass: "Backend Developer",
      specialization: "Node.js / TypeScript",
    });
    const oldTransaction = XpTransaction.rebuild({
      id: "550e8400-e29b-41d4-a716-446655440010",
      characterId: character.getId().toString(),
      amount: 10,
      sourceType: XpSourceType.STREAK_BONUS,
      sourceId: null,
      skillId: null,
      description: "Old bonus",
      createdAt: new Date("2026-08-01T12:00:00.000Z"),
    });
    const recentTransaction = XpTransaction.createFromQuest({
      characterId: character.getId().toString(),
      questId,
      amount: 25,
      skillId: nodeSkillId,
      description: "Recent quest",
    });
    const useCase = new ListXpTransactions(
      new InMemoryCharacterRepository(character),
      new InMemoryXpTransactionRepository([oldTransaction, recentTransaction]),
    );
    const createdAfter = new Date();
    createdAfter.setDate(createdAfter.getDate() - 30);

    const result = await useCase.execute(TEST_USER_ID, { createdAfter });

    expect(result).toHaveLength(1);
    expect(result[0]?.getDescription()).toBe("Recent quest");
  });

  it("throws when no character exists", async () => {
    const useCase = new ListXpTransactions(
      new InMemoryCharacterRepository(null),
      new InMemoryXpTransactionRepository([]),
    );

    await expect(useCase.execute(TEST_USER_ID)).rejects.toBeInstanceOf(NotFoundError);
  });
});
