import type { Express } from "express";

import ApplicationError from "../../../application/exception/ApplicationError.js";
import NotFoundError from "../../../application/exception/NotFoundError.js";
import DomainError from "../../../domain/exception/DomainError.js";
import DatabaseConnectionError from "../../../infrastructure/exception/DatabaseConnectionError.js";
import ValidationError from "../../../shared/exception/ValidationError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export function registerDebugRoutes(app: Express): void {
  if (process.env.ENABLE_DEBUG_ROUTES !== "true") {
    return;
  }

  app.get(
    "/api/v1/_debug/errors/validation",
    asyncHandler((_req, _res, _next) => {
      throw new ValidationError("title is required");
    }),
  );

  app.get(
    "/api/v1/_debug/errors/not-found",
    asyncHandler((_req, _res, _next) => {
      throw new NotFoundError("Quest not found");
    }),
  );

  app.get(
    "/api/v1/_debug/errors/domain",
    asyncHandler((_req, _res, _next) => {
      throw new DomainError("Quest is already completed");
    }),
  );

  app.get(
    "/api/v1/_debug/errors/application",
    asyncHandler((_req, _res, _next) => {
      throw new ApplicationError("Invalid quest transition");
    }),
  );

  app.get(
    "/api/v1/_debug/errors/infra",
    asyncHandler((_req, _res, _next) => {
      throw new DatabaseConnectionError("Database is unavailable");
    }),
  );
}
