import NotFoundError from "../../exception/NotFoundError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type QuestMissionRepository from "../../repository/QuestMissionRepository.js";
import type { ListQuestsFilter } from "../../repository/QuestRepository.js";
import type QuestRepository from "../../repository/QuestRepository.js";
import { getCalendarDay } from "../../shared/getCalendarDay.js";
import { getCalendarWeekStart } from "../../shared/getCalendarWeekStart.js";

export default class ListQuests {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly questRepository: QuestRepository,
    private readonly missionRepository: QuestMissionRepository,
    private readonly timezone: string,
  ) {}

  async execute(userId: string, filter: ListQuestsFilter = {}, referenceDate: Date = new Date()) {
    const character = await this.characterRepository.findByUserId(userId);

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    const characterId = character.getId().toString();
    const calendarDay = getCalendarDay(referenceDate, this.timezone);
    await this.questRepository.rolloverDailyQuests(characterId, calendarDay);
    await this.questRepository.rolloverWeeklyQuests(
      characterId,
      getCalendarWeekStart(referenceDate, this.timezone),
    );

    const quests = await this.questRepository.findByCharacterId(
      character.getId().toString(),
      filter,
    );
    const missionsByQuestId = await this.missionRepository.findByQuestIds(
      quests.map((quest) => quest.getId().toString()),
    );

    return { quests, missionsByQuestId };
  }
}
