import type { QuestResponse } from "@/lib/api/types";

export type QuestMissionDraft = {
  id?: string;
  title: string;
};

export function missionDraftsFromQuest(quest: QuestResponse): QuestMissionDraft[] {
  if (quest.missions.length === 0) {
    return [{ title: "" }];
  }

  return quest.missions.map((mission) => ({
    id: mission.id,
    title: mission.title,
  }));
}

export function buildUpdateQuestMissions(
  drafts: QuestMissionDraft[],
): Array<{ id?: string; title: string }> {
  return drafts
    .map((draft) => ({
      id: draft.id,
      title: draft.title.trim(),
    }))
    .filter((draft) => draft.title.length > 0);
}

export function canEditQuest(quest: QuestResponse): boolean {
  return quest.status === "TODO" || quest.status === "IN_PROGRESS";
}
