import type { QuestDifficulty } from "../../../domain/enum/QuestDifficulty.js";
import { QuestStatus } from "../../../domain/enum/QuestStatus.js";
import type { QuestType } from "../../../domain/enum/QuestType.js";
import type Quest from "../../../domain/quest/Quest.js";
import QuestMission from "../../../domain/quest/QuestMission.js";
import type { CreateQuestSkillAllocationProps } from "../../../domain/quest/QuestSkillAllocation.js";
import NotFoundError from "../../exception/NotFoundError.js";
import ApplicationError from "../../exception/ApplicationError.js";
import type CharacterRepository from "../../repository/CharacterRepository.js";
import type QuestMissionRepository from "../../repository/QuestMissionRepository.js";
import type QuestRepository from "../../repository/QuestRepository.js";

export type UpdateQuestMissionInput = {
  id?: string;
  title: string;
};

export type UpdateQuestInput = {
  title: string;
  description?: string | null;
  type?: QuestType;
  difficulty?: QuestDifficulty;
  baseXp?: number;
  skillAllocations?: CreateQuestSkillAllocationProps[];
  missions?: UpdateQuestMissionInput[];
};

export default class UpdateQuest {
  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly questRepository: QuestRepository,
    private readonly missionRepository: QuestMissionRepository,
  ) {}

  async execute(userId: string, questId: string, input: UpdateQuestInput): Promise<Quest> {
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
      throw new ApplicationError("Quest cannot be edited in its current status");
    }

    quest.updateDetails({
      title: input.title,
      description: input.description,
      type: input.type,
      difficulty: input.difficulty,
      baseXp: input.baseXp,
      skillAllocations: input.skillAllocations,
    });
    await this.questRepository.update(quest);

    if (input.missions) {
      await this.syncMissions(questId, input.missions);
    }

    return quest;
  }

  private async syncMissions(
    questId: string,
    missionsInput: UpdateQuestMissionInput[],
  ): Promise<void> {
    const existingMissions = await this.missionRepository.findByQuestId(questId);
    const existingById = new Map(
      existingMissions.map((mission) => [mission.getId().toString(), mission]),
    );

    const normalized = missionsInput
      .map((mission) => ({
        id: mission.id?.trim() || undefined,
        title: mission.title.trim(),
      }))
      .filter((mission) => mission.title.length > 0);

    const retainedIds = new Set<string>();
    const missionsToUpdate: QuestMission[] = [];
    const missionsToCreate: QuestMission[] = [];

    normalized.forEach((missionInput, index) => {
      if (missionInput.id) {
        const existing = existingById.get(missionInput.id);

        if (!existing) {
          throw new NotFoundError("Mission not found");
        }

        existing.updateTitle(missionInput.title);
        existing.setDisplayOrder(index);
        missionsToUpdate.push(existing);
        retainedIds.add(missionInput.id);

        return;
      }

      missionsToCreate.push(
        QuestMission.create({
          questId,
          title: missionInput.title,
          displayOrder: index,
        }),
      );
    });

    for (const existing of existingMissions) {
      const missionId = existing.getId().toString();

      if (retainedIds.has(missionId)) {
        continue;
      }

      if (existing.isMissionCompleted()) {
        throw new ApplicationError("Completed missions cannot be removed");
      }

      await this.missionRepository.deleteById(missionId);
    }

    for (const mission of missionsToUpdate) {
      await this.missionRepository.update(mission);
    }

    if (missionsToCreate.length > 0) {
      await this.missionRepository.saveAll(missionsToCreate);
    }
  }
}
