import { QuestStatus } from "../../../domain/enum/QuestStatus.js";
import type Quest from "../../../domain/quest/Quest.js";
import NotFoundError from "../../exception/NotFoundError.js";
import ApplicationError from "../../exception/ApplicationError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type QuestMissionRepository from "../../repository/QuestMissionRepository.js";
import type QuestRepository from "../../repository/QuestRepository.js";

export default class ReopenQuest {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly questRepository: QuestRepository,
    private readonly missionRepository: QuestMissionRepository,
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

    const status = quest.getStatus();

    if (status !== QuestStatus.CANCELLED && status !== QuestStatus.COMPLETED) {
      throw new ApplicationError("Quest cannot be reopened in its current status");
    }

    const wasCompleted = status === QuestStatus.COMPLETED;

    quest.reopen();
    await this.questRepository.update(quest);

    if (wasCompleted) {
      const missions = await this.missionRepository.findByQuestId(questId);

      for (const mission of missions) {
        if (mission.isMissionCompleted()) {
          mission.setCompleted(false);
          await this.missionRepository.update(mission);
        }
      }
    }

    return quest;
  }
}
