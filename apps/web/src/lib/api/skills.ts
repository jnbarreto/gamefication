import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type {
  CreateSkillRequest,
  SkillMutationResponse,
  SkillTreeResponse,
  StaleSkillsResponse,
  UpdateSkillRequest,
} from "./types";

export function fetchSkillTree(): Promise<SkillTreeResponse> {
  return apiGet<SkillTreeResponse>("/skills");
}

export function fetchStaleSkills(): Promise<StaleSkillsResponse> {
  return apiGet<StaleSkillsResponse>("/skills/stale");
}

export function createSkillCategory(input: {
  name: string;
}): Promise<{ category: { id: string; name: string; displayOrder: number; isCustom: boolean } }> {
  return apiPost("/skill-categories", input);
}

export function deleteSkillCategory(categoryId: string): Promise<void> {
  return apiDelete(`/skill-categories/${categoryId}`);
}

export function createSkill(input: CreateSkillRequest): Promise<SkillMutationResponse> {
  return apiPost<SkillMutationResponse>("/skills", input);
}

export function updateSkill(
  skillId: string,
  input: UpdateSkillRequest,
): Promise<SkillMutationResponse> {
  return apiPatch<SkillMutationResponse>(`/skills/${skillId}`, input);
}

export function deleteSkill(skillId: string): Promise<void> {
  return apiDelete(`/skills/${skillId}`);
}
