import { DAILY_QUEST_SOFT_LIMIT, QuestType } from "../../../domain/enum/QuestType.js";
import type { CreateQuestProps } from "../../../domain/quest/Quest.js";
import Quest from "../../../domain/quest/Quest.js";
import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type QuestMissionRepository from "../../repository/QuestMissionRepository.js";
import type QuestRepository from "../../repository/QuestRepository.js";
import { getCalendarDay } from "../../shared/getCalendarDay.js";
import { getCalendarWeekStart } from "../../shared/getCalendarWeekStart.js";
import QuestMission from "../../../domain/quest/QuestMission.js";

export type CreateQuestInput = Omit<CreateQuestProps, "characterId"> & {
  missions?: string[];
};

export type CreateQuestResult = {
  quest: Quest;
  warnings: string[];
};

export default class CreateQuest {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly questRepository: QuestRepository,
    private readonly missionRepository: QuestMissionRepository,
    private readonly timezone: string,
  ) {}

  async execute(userId: string, input: CreateQuestInput): Promise<CreateQuestResult> {
    const character = await this.characterRepository.findByUserId(userId);

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    const now = new Date();
    const calendarDay =
      input.type === QuestType.DAILY ? getCalendarDay(now, this.timezone) : null;
    const calendarWeekStart =
      input.type === QuestType.WEEKLY
        ? getCalendarWeekStart(now, this.timezone)
        : null;
    const quest = Quest.create({
      ...input,
      characterId: character.getId().toString(),
      calendarDay,
      calendarWeekStart,
    });

    const warnings: string[] = [];

    if (quest.getType() === QuestType.DAILY) {
      const existingDailyCount =
        await this.questRepository.countDailyQuestsForCalendarDay(
          character.getId().toString(),
          calendarDay as string,
          this.timezone,
        );

      if (existingDailyCount >= DAILY_QUEST_SOFT_LIMIT) {
        warnings.push(
          `You already have ${existingDailyCount} daily quests for ${calendarDay}. Consider focusing on fewer tasks.`,
        );
      }
    }

    await this.questRepository.save(quest);

    const missionTitles = (input.missions ?? [])
      .map((title) => title.trim())
      .filter((title) => title.length > 0);

    if (missionTitles.length > 0) {
      const missions = missionTitles.map((title, index) =>
        QuestMission.create({
          questId: quest.getId().toString(),
          title,
          displayOrder: index,
        }),
      );

      await this.missionRepository.saveAll(missions);
    }

    return {
      quest,
      warnings,
    };
  }
}
