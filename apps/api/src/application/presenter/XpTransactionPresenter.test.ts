import { XpSourceType } from "../../domain/enum/XpSourceType.js";
import XpTransaction from "../../domain/xp/XpTransaction.js";
import {
  presentXpTransaction,
  presentXpTransactionList,
} from "./XpTransactionPresenter.js";

describe("XpTransactionPresenter", () => {
  it("maps transaction fields to API response", () => {
    const transaction = XpTransaction.createFromQuest({
      characterId: "550e8400-e29b-41d4-a716-446655440000",
      questId: "550e8400-e29b-41d4-a716-446655440001",
      amount: 25,
      skillId: "550e8400-e29b-41d4-a716-446655440002",
      description: "Quest completed: Implement endpoint",
    });

    expect(presentXpTransaction(transaction)).toEqual(
      expect.objectContaining({
        amount: 25,
        sourceType: XpSourceType.QUEST,
        sourceId: "550e8400-e29b-41d4-a716-446655440001",
        skillId: "550e8400-e29b-41d4-a716-446655440002",
        description: "Quest completed: Implement endpoint",
      }),
    );
  });

  it("maps transaction collections", () => {
    const transaction = XpTransaction.createFromStreakBonus({
      characterId: "550e8400-e29b-41d4-a716-446655440000",
      amount: 10,
      description: "Streak bonus: 3 days",
    });

    expect(presentXpTransactionList([transaction]).transactions).toHaveLength(1);
  });
});
