import { useContext } from "react";

import { AvatarContext, type AvatarContextValue } from "./AvatarProvider";

export function useAvatar(): AvatarContextValue {
  const context = useContext(AvatarContext);

  if (!context) {
    throw new Error("useAvatar must be used within AvatarProvider");
  }

  return context;
}
