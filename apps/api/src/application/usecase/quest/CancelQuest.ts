import { QuestStatus } from "../../../domain/enum/QuestStatus.js";
import type Quest from "../../../domain/quest/Quest.js";
import NotFoundError from "../../exception/NotFoundError.js";
import ApplicationError from "../../exception/ApplicationError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type QuestRepository from "../../repository/QuestRepository.js";

export default class CancelQuest {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly questRepository: QuestRepository,
  ) {}

  async execute(userId: string, questId: string): Promise<Quest> {
    const character = await this.characterRepository.findByUserId(userId);

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    const quest = await this.questRepository.findById(questId);

    if (!quest || quest.getCharacterId().toString() !== character.getId().toString()) {
      throw new NotFoundError("Quest not found");
    }

    if (
      quest.getStatus() !== QuestStatus.TODO &&
      quest.getStatus() !== QuestStatus.IN_PROGRESS
    ) {
      throw new ApplicationError("Quest cannot be cancelled in its current status");
    }

    quest.cancel();
    await this.questRepository.update(quest);

    return quest;
  }
}
