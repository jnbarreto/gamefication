import type QuestMission from "../../domain/quest/QuestMission.js";

export default interface QuestMissionRepository {
  saveAll(missions: QuestMission[]): Promise<void>;
  findByQuestId(questId: string): Promise<QuestMission[]>;
  findByQuestIds(questIds: string[]): Promise<Map<string, QuestMission[]>>;
  findById(missionId: string): Promise<QuestMission | null>;
  update(mission: QuestMission): Promise<void>;
  deleteById(missionId: string): Promise<void>;
}
