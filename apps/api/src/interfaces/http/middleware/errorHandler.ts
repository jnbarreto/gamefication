import type { NextFunction, Request, Response } from "express";

import ApplicationError from "../../../application/exception/ApplicationError.js";
import ForbiddenError from "../../../application/exception/ForbiddenError.js";
import InvalidCredentialsError from "../../../application/exception/InvalidCredentialsError.js";
import NotFoundError from "../../../application/exception/NotFoundError.js";
import UnauthorizedError from "../../../application/exception/UnauthorizedError.js";
import DomainError from "../../../domain/exception/DomainError.js";
import DatabaseConnectionError from "../../../infrastructure/exception/DatabaseConnectionError.js";
import InfraError from "../../../infrastructure/exception/InfraError.js";
import MigrationError from "../../../infrastructure/exception/MigrationError.js";
import AppError from "../../../shared/exception/AppError.js";
import ValidationError from "../../../shared/exception/ValidationError.js";

export default class HttpErrorStatus {
  static from(error: AppError): number {
    if (error instanceof ValidationError) {
      return 400;
    }

    if (error instanceof UnauthorizedError || error instanceof InvalidCredentialsError) {
      return 401;
    }

    if (error instanceof ForbiddenError) {
      return 403;
    }

    if (error instanceof NotFoundError) {
      return 404;
    }

    if (error instanceof DomainError) {
      return 422;
    }

    if (error instanceof ApplicationError) {
      return 400;
    }

    if (error instanceof DatabaseConnectionError) {
      return 503;
    }

    if (error instanceof MigrationError) {
      return 500;
    }

    if (error instanceof InfraError) {
      return 500;
    }

    return 500;
  }
}

export type HttpErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

export function buildErrorBody(error: AppError): HttpErrorBody {
  return {
    error: {
      code: error.code,
      message: error.message,
    },
  };
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    res.status(HttpErrorStatus.from(error)).json(buildErrorBody(error));
    return;
  }

  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Invalid JSON body",
      },
    });
    return;
  }

  console.error("[gamefication-api] unhandled error", error);

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
}
