import type { NextFunction, Request, Response } from "express";

import UnauthorizedError from "../../../application/exception/UnauthorizedError.js";
import JwtService from "../../../infrastructure/auth/JwtService.js";

const PUBLIC_PATHS = new Set(["/api/v1/health"]);

const PUBLIC_POST_AUTH_PATHS = new Set([
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
]);

export function isPublicPath(method: string, path: string): boolean {
  if (PUBLIC_PATHS.has(path)) {
    return true;
  }

  return method === "POST" && PUBLIC_POST_AUTH_PATHS.has(path);
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  if (isPublicPath(req.method, req.path)) {
    next();
    return;
  }

  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    next(new UnauthorizedError("Missing or invalid authorization header"));
    return;
  }

  const token = header.slice("Bearer ".length).trim();

  if (!token) {
    next(new UnauthorizedError("Missing or invalid authorization header"));
    return;
  }

  const payload = JwtService.verify(token);

  req.auth = {
    userId: payload.sub,
    role: payload.role,
    characterId: payload.characterId,
  };

  next();
}
