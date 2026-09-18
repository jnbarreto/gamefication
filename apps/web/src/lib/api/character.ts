import { apiPost } from "./client";
import type { CharacterResponse } from "./types";

export function resetCharacterProgress(): Promise<CharacterResponse> {
  return apiPost<CharacterResponse>("/character/reset-progress");
}
