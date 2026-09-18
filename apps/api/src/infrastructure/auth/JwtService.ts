import jwt from "jsonwebtoken";

import UnauthorizedError from "../../application/exception/UnauthorizedError.js";
import type { UserRole } from "../../domain/user/UserRole.js";
import { getAuthConfig } from "../config/authConfig.js";

export type JwtPayload = {
  sub: string;
  role: UserRole;
  characterId: string;
};

export default class JwtService {
  static sign(payload: JwtPayload): string {
    const { jwtSecret, jwtExpiresIn } = getAuthConfig();

    return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
  }

  static verify(token: string): JwtPayload {
    const { jwtSecret } = getAuthConfig();

    try {
      const decoded = jwt.verify(token, jwtSecret);

      if (typeof decoded !== "object" || decoded === null) {
        throw new UnauthorizedError("Invalid token");
      }

      const { sub, role, characterId } = decoded as Partial<JwtPayload>;

      if (!sub || !role || !characterId) {
        throw new UnauthorizedError("Invalid token");
      }

      return { sub, role, characterId };
    } catch {
      throw new UnauthorizedError("Invalid token");
    }
  }
}
