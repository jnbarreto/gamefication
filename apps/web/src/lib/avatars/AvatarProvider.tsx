import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  AVATAR_OPTIONS,
  getAvatarById,
  resolveAvatarSrc,
  type AvatarOption,
} from "./catalog";
import { getStoredAvatarId, persistAvatarId } from "./avatarStorage";

export type AvatarContextValue = {
  avatarId: string;
  avatarSrc: string | null;
  avatars: AvatarOption[];
  selectedAvatar: AvatarOption | undefined;
  setAvatarId: (avatarId: string) => void;
};

export const AvatarContext = createContext<AvatarContextValue | null>(null);

type AvatarProviderProps = {
  children: ReactNode;
};

export function AvatarProvider({ children }: AvatarProviderProps) {
  const [avatarId, setAvatarIdState] = useState<string>(() => getStoredAvatarId());

  const setAvatarId = useCallback((nextAvatarId: string) => {
    if (!getAvatarById(nextAvatarId)) {
      return;
    }

    setAvatarIdState(nextAvatarId);
    persistAvatarId(nextAvatarId);
  }, []);

  const value = useMemo<AvatarContextValue>(
    () => ({
      avatarId,
      avatarSrc: resolveAvatarSrc(avatarId),
      avatars: AVATAR_OPTIONS,
      selectedAvatar: getAvatarById(avatarId),
      setAvatarId,
    }),
    [avatarId, setAvatarId],
  );

  return <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>;
}
