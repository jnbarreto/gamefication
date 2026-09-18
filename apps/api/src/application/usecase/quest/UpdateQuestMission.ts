import { QuestStatus } from "../../../domain/enum/QuestStatus.js";
import type QuestMission from "../../../domain/quest/QuestMission.js";
import NotFoundError from "../../exception/NotFoundError.js";
import ApplicationError from "../../exception/ApplicationError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type QuestMissionRepository from "../../repository/QuestMissionRepository.js";
import type QuestRepository from "../../repository/QuestRepository.js";

export type UpdateQuestMissionInput = {
  completed: boolean;
};

export default class UpdateQuestMission {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly questRepository: QuestRepository,
    private readonly missionRepository: QuestMissionRepository,
  ) {}

  async execute(
    userId: string,
    questId: string,
    missionId: string,
    input: UpdateQuestMissionInput,
  ): Promise<QuestMission> {
    const character = await this.characterRepository.findByUserId(userId);

    if (!character) {
      throw new NotFoundError("Character not found");
    }

    const quest = await this.questRepository.findById(questId);

    if (!quest || quest.getCharacterId().toString() !== character.getId().toString()) {
      throw new NotFoundError("Quest not found");
    }

    if (quest.getStatus() !== QuestStatus.IN_PROGRESS) {
      throw new ApplicationError("Missions can only be updated while the quest is in progress");
    }

    const mission = await this.missionRepository.findById(missionId);

    if (!mission || mission.getQuestId().toString() !== questId) {
      throw new NotFoundError("Mission not found");
    }

    mission.setCompleted(input.completed);
    await this.missionRepository.update(mission);

    return mission;
  }
}
