import type { AuthTokenType } from "../../domain/auth/AuthTokenType.js";

export type AuthTokenRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  type: AuthTokenType;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

export default interface AuthTokenRepository {
  create(record: AuthTokenRecord): Promise<void>;
  findValidByHash(tokenHash: string, type: AuthTokenType): Promise<AuthTokenRecord | null>;
  invalidateActiveForUser(userId: string, type: AuthTokenType): Promise<void>;
  markUsed(id: string, usedAt: Date): Promise<void>;
}
