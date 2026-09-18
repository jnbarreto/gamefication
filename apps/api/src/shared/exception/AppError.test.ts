import DomainError from "../../domain/exception/DomainError.js";
import NotFoundError from "../../application/exception/NotFoundError.js";
import DatabaseConnectionError from "../../infrastructure/exception/DatabaseConnectionError.js";

describe("AppError", () => {
  it("generates code from class name", () => {
    const error = new DomainError("Quest is already completed");

    expect(error.code).toBe("DOMAIN_ERROR");
    expect(error.message).toBe("Quest is already completed");
    expect(error.name).toBe("DomainError");
  });

  it("generates code for multi-word class names", () => {
    const error = new NotFoundError("Quest not found");

    expect(error.code).toBe("NOT_FOUND_ERROR");
  });

  it("generates code for infrastructure errors", () => {
    const error = new DatabaseConnectionError("Database is unavailable");

    expect(error.code).toBe("DATABASE_CONNECTION_ERROR");
  });
});
