import type { Request } from "express";

import UnauthorizedError from "../../../application/exception/UnauthorizedError.js";
import type { AuthContext } from "../types/auth.js";

export function requireAuth(req: Request): AuthContext {
  if (!req.auth) {
    throw new UnauthorizedError("Authentication required");
  }

  return req.auth;
}
