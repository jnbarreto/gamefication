import type XpTransaction from "../../domain/xp/XpTransaction.js";

export type XpTransactionResponse = {
  id: string;
  amount: number;
  sourceType: string;
  sourceId: string | null;
  skillId: string | null;
  description: string;
  createdAt: string;
};

export type XpTransactionListResponse = {
  transactions: XpTransactionResponse[];
};

export function presentXpTransaction(
  transaction: XpTransaction,
): XpTransactionResponse {
  return {
    id: transaction.getId().toString(),
    amount: transaction.getAmount().amount,
    sourceType: transaction.getSourceType(),
    sourceId: transaction.getSourceId()?.toString() ?? null,
    skillId: transaction.getSkillId()?.toString() ?? null,
    description: transaction.getDescription(),
    createdAt: transaction.getCreatedAt().toISOString(),
  };
}

export function presentXpTransactionList(
  transactions: XpTransaction[],
): XpTransactionListResponse {
  return {
    transactions: transactions.map((transaction) => presentXpTransaction(transaction)),
  };
}
