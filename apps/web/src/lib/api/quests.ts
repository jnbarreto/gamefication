import { apiGet, apiPatch, apiPost } from "./client";
import type {
  CompleteQuestResponse,
  CreateQuestResponse,
  QuestListResponse,
  QuestMissionResponse,
  QuestResponse,
  StartQuestResponse,
} from "./types";

export type ListQuestsParams = {
  status?: string;
  type?: string;
  period?: "last30days";
};

export type CreateQuestRequest = {
  title: string;
  type: string;
  difficulty: string;
  skillAllocations: Array<{ skillId: string; xp: number }>;
  description?: string;
  missions?: string[];
};

export type CompleteQuestEvidence = {
  type: string;
  value: string;
  description?: string | null;
};

export type UpdateQuestRequest = {
  title: string;
  description?: string | null;
  type?: string;
  difficulty?: string;
  skillAllocations?: Array<{ skillId: string; xp: number }>;
  missions?: Array<{ id?: string; title: string }>;
};

function buildQuestsPath(params?: ListQuestsParams): string {
  if (!params) {
    return "/quests";
  }

  const search = new URLSearchParams();

  if (params.status) {
    search.set("status", params.status);
  }

  if (params.type) {
    search.set("type", params.type);
  }

  if (params.period) {
    search.set("period", params.period);
  }

  const query = search.toString();

  return query ? `/quests?${query}` : "/quests";
}

export function fetchQuests(params?: ListQuestsParams): Promise<QuestListResponse> {
  return apiGet<QuestListResponse>(buildQuestsPath(params));
}

function sortQuestsByUpdatedDesc(left: QuestResponse, right: QuestResponse): number {
  return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
}

export async function fetchActiveQuests(): Promise<QuestResponse[]> {
  const [inProgressResult, todoResult] = await Promise.all([
    fetchQuests({ status: "IN_PROGRESS" }),
    fetchQuests({ status: "TODO" }),
  ]);

  return [
    ...inProgressResult.quests.sort(sortQuestsByUpdatedDesc),
    ...todoResult.quests.sort(sortQuestsByUpdatedDesc),
  ];
}

export function createQuest(input: CreateQuestRequest): Promise<CreateQuestResponse> {
  return apiPost<CreateQuestResponse>("/quests", input);
}

export function startQuest(questId: string): Promise<StartQuestResponse> {
  return apiPost<StartQuestResponse>(`/quests/${questId}/start`);
}

export function completeQuest(
  questId: string,
  evidence?: CompleteQuestEvidence,
): Promise<CompleteQuestResponse> {
  return apiPost<CompleteQuestResponse>(
    `/quests/${questId}/complete`,
    evidence ? { evidence } : {},
  );
}

export function cancelQuest(questId: string): Promise<StartQuestResponse> {
  return apiPost<StartQuestResponse>(`/quests/${questId}/cancel`);
}

export function reopenQuest(questId: string): Promise<StartQuestResponse> {
  return apiPost<StartQuestResponse>(`/quests/${questId}/reopen`);
}

export function updateQuest(
  questId: string,
  input: UpdateQuestRequest,
): Promise<StartQuestResponse> {
  return apiPatch<StartQuestResponse>(`/quests/${questId}`, input);
}

export function updateQuestMission(
  questId: string,
  missionId: string,
  completed: boolean,
): Promise<{ mission: QuestMissionResponse }> {
  return apiPatch(`/quests/${questId}/missions/${missionId}`, { completed });
}
