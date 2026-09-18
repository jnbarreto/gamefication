import ApplicationError from "../../../application/exception/ApplicationError.js";
import NotFoundError from "../../../application/exception/NotFoundError.js";
import DomainError from "../../../domain/exception/DomainError.js";
import DatabaseConnectionError from "../../../infrastructure/exception/DatabaseConnectionError.js";
import MigrationError from "../../../infrastructure/exception/MigrationError.js";
import ValidationError from "../../../shared/exception/ValidationError.js";
import HttpErrorStatus, { buildErrorBody } from "./errorHandler.js";

describe("HttpErrorStatus", () => {
  it.each([
    [new ValidationError("invalid"), 400],
    [new ApplicationError("invalid transition"), 400],
    [new NotFoundError("missing"), 404],
    [new DomainError("rule violated"), 422],
    [new DatabaseConnectionError("down"), 503],
    [new MigrationError("failed"), 500],
  ])("maps %s to HTTP %i", (error, status) => {
    expect(HttpErrorStatus.from(error)).toBe(status);
  });
});

describe("buildErrorBody", () => {
  it("returns stable error payload", () => {
    const error = new ValidationError("title is required");

    expect(buildErrorBody(error)).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "title is required",
      },
    });
  });
});
