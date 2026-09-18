import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type QuestMissionRepository from "../../repository/QuestMissionRepository.js";
import type QuestRepository from "../../repository/QuestRepository.js";
import { getCalendarDay } from "../../shared/getCalendarDay.js";
import { getCalendarWeekStart } from "../../shared/getCalendarWeekStart.js";

export default class ListTodayQuests {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly questRepository: QuestRepository,
    private readonly missionRepository: QuestMissionRepository,
    private readonly timezone: string,
  ) {}

  async execute(userId: string, referenceDate: Date = new Date()) {
    const character = await this.characterRepository.findByUserId(userId);

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    const calendarDay = getCalendarDay(referenceDate, this.timezone);
    const characterId = character.getId().toString();
    await this.questRepository.rolloverDailyQuests(characterId, calendarDay);
    await this.questRepository.rolloverWeeklyQuests(
      characterId,
      getCalendarWeekStart(referenceDate, this.timezone),
    );
    const quests = await this.questRepository.findDailyQuestsForCalendarDay(
      character.getId().toString(),
      calendarDay,
      this.timezone,
    );
    const missionsByQuestId = await this.missionRepository.findByQuestIds(
      quests.map((quest) => quest.getId().toString()),
    );

    return {
      calendarDay,
      quests,
      missionsByQuestId,
    };
  }
}
