import type { UserRole } from "../../../domain/user/UserRole.js";

export type AuthContext = {
  userId: string;
  role: UserRole;
  characterId: string;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export {};
