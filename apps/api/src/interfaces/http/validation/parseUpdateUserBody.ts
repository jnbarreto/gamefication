import ValidationError from "../../../shared/exception/ValidationError.js";
import type { UserRole } from "../../../domain/user/UserRole.js";
import { isUserRole } from "../../../domain/user/UserRole.js";

export type UpdateUserBody = {
  displayName?: string;
  role?: UserRole;
  password?: string;
};

export function parseUpdateUserBody(body: unknown): UpdateUserBody {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body is required");
  }

  const record = body as Record<string, unknown>;
  const result: UpdateUserBody = {};

  if ("displayName" in record) {
    if (typeof record.displayName !== "string" || !record.displayName.trim()) {
      throw new ValidationError("Display name must be a non-empty string");
    }

    result.displayName = record.displayName.trim();
  }

  if ("role" in record) {
    if (typeof record.role !== "string" || !isUserRole(record.role)) {
      throw new ValidationError("Role must be ADMIN or PLAYER");
    }

    result.role = record.role;
  }

  if ("password" in record) {
    if (typeof record.password !== "string" || !record.password) {
      throw new ValidationError("Password must be a non-empty string");
    }

    result.password = record.password;
  }

  if (
    result.displayName === undefined &&
    result.role === undefined &&
    result.password === undefined
  ) {
    throw new ValidationError("At least one field must be provided");
  }

  return result;
}
