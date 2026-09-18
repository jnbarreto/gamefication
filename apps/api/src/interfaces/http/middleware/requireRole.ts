import type { NextFunction, Request, Response } from "express";

import ForbiddenError from "../../../application/exception/ForbiddenError.js";
import UnauthorizedError from "../../../application/exception/UnauthorizedError.js";
import type { UserRole } from "../../../domain/user/UserRole.js";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new UnauthorizedError("Authentication required"));
      return;
    }

    if (!roles.includes(req.auth.role)) {
      next(new ForbiddenError("Insufficient permissions"));
      return;
    }

    next();
  };
}
