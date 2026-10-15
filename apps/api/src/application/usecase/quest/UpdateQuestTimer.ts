import { QuestStatus } from "../../../domain/enum/QuestStatus.js";
import type Quest from "../../../domain/quest/Quest.js";
import NotFoundError from "../../exception/NotFoundError.js";
import ApplicationError from "../../exception/ApplicationError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type QuestRepository from "../../repository/QuestRepository.js";

export type UpdateQuestTimerAction = "START" | "PAUSE" | "SYNC" | "RESET";

export type UpdateQuestTimerInput = {
  action: UpdateQuestTimerAction;
  timerSeconds?: number;
};

export default class UpdateQuestTimer {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly questRepository: QuestRepository,
  ) {}

  async execute(
    userId: string,
    questId: string,
    input: UpdateQuestTimerInput,
  ): Promise<Quest> {
    const character = await this.characterRepository.findByUserId(userId);

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    const quest = await this.questRepository.findById(questId);

    if (!quest || quest.getCharacterId().toString() !== character.getId().toString()) {
      throw new NotFoundError("Quest not found");
    }

    if (quest.getStatus() !== QuestStatus.IN_PROGRESS) {
      throw new ApplicationError("Timer can only be updated while the quest is in progress");
    }

    if (input.action === "START") {
      quest.startTimer();
    } else if (input.action === "PAUSE") {
      quest.pauseTimer();
    } else if (input.action === "SYNC") {
      if (typeof input.timerSeconds === "number") {
        quest.syncTimer(input.timerSeconds);
      }
    } else if (input.action === "RESET") {
      quest.resetTimer();
    }

    await this.questRepository.update(quest);

    return quest;
  }
}
