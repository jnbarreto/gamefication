import type XpTransaction from "../../domain/xp/XpTransaction.js";

export type ListXpTransactionsFilter = {
  createdAfter?: Date;
  skillId?: string;
};

export type DailyXpSummary = {
  calendarDay: string;
  totalXp: number;
};

export default interface XpTransactionRepository {
  findByCharacterId(
    characterId: string,
    filter?: ListXpTransactionsFilter,
  ): Promise<XpTransaction[]>;

  summarizeDailyXp(
    characterId: string,
    fromCalendarDay: string,
    timezone: string,
  ): Promise<DailyXpSummary[]>;
}
