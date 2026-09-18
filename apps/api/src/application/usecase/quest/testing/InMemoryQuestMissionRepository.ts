import type QuestMissionRepository from "../../application/repository/QuestMissionRepository.js";
import QuestMission from "../../domain/quest/QuestMission.js";

export class InMemoryQuestMissionRepository implements QuestMissionRepository {
  private missions: QuestMission[] = [];

  async saveAll(missions: QuestMission[]): Promise<void> {
    this.missions.push(...missions);
  }

  async findByQuestId(questId: string): Promise<QuestMission[]> {
    return this.missions.filter((mission) => mission.getQuestId().toString() === questId);
  }

  async findByQuestIds(questIds: string[]): Promise<Map<string, QuestMission[]>> {
    const grouped = new Map<string, QuestMission[]>();

    for (const mission of this.missions) {
      const questId = mission.getQuestId().toString();

      if (!questIds.includes(questId)) {
        continue;
      }

      const list = grouped.get(questId) ?? [];
      list.push(mission);
      grouped.set(questId, list);
    }

    return grouped;
  }

  async findById(missionId: string): Promise<QuestMission | null> {
    return this.missions.find((mission) => mission.getId().toString() === missionId) ?? null;
  }

  async update(mission: QuestMission): Promise<void> {
    const index = this.missions.findIndex(
      (item) => item.getId().toString() === mission.getId().toString(),
    );

    if (index >= 0) {
      this.missions[index] = mission;
    }
  }
}
