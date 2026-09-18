import type { QuestStatus } from "../../domain/enum/QuestStatus.js";
import type { QuestType } from "../../domain/enum/QuestType.js";
import type Quest from "../../domain/quest/Quest.js";

export type ListQuestsFilter = {
  status?: QuestStatus;
  type?: QuestType;
  createdAfter?: Date;
};

export default interface QuestRepository {
  save(quest: Quest): Promise<void>;
  update(quest: Quest): Promise<void>;
  findById(questId: string): Promise<Quest | null>;
  findByCharacterId(characterId: string, filter?: ListQuestsFilter): Promise<Quest[]>;
  findDailyQuestsForCalendarDay(
    characterId: string,
    calendarDay: string,
    timezone: string,
  ): Promise<Quest[]>;
  countDailyQuestsForCalendarDay(
    characterId: string,
    calendarDay: string,
    timezone: string,
  ): Promise<number>;
  rolloverDailyQuests(characterId: string, calendarDay: string): Promise<void>;
  rolloverWeeklyQuests(characterId: string, calendarWeekStart: string): Promise<void>;
}
