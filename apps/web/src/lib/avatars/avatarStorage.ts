import { DEFAULT_AVATAR_ID, getAvatarById } from "./catalog";

const STORAGE_KEY = "gamefication:avatar";

export function getStoredAvatarId(): string {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored && getAvatarById(stored)) {
    return stored;
  }

  return DEFAULT_AVATAR_ID;
}

export function persistAvatarId(id: string): void {
  localStorage.setItem(STORAGE_KEY, id);
}
