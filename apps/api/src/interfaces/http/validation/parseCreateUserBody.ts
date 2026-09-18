import ValidationError from "../../../shared/exception/ValidationError.js";
import type { UserRole } from "../../../domain/user/UserRole.js";
import { isUserRole } from "../../../domain/user/UserRole.js";

export type CreateUserBody = {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
};

export function parseCreateUserBody(body: unknown): CreateUserBody {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body is required");
  }

  const record = body as Record<string, unknown>;
  const email = record.email;
  const password = record.password;
  const displayName = record.displayName;
  const role = record.role;

  if (typeof email !== "string" || !email.trim()) {
    throw new ValidationError("Email is required");
  }

  if (typeof password !== "string" || !password) {
    throw new ValidationError("Password is required");
  }

  if (typeof displayName !== "string" || !displayName.trim()) {
    throw new ValidationError("Display name is required");
  }

  if (typeof role !== "string" || !isUserRole(role)) {
    throw new ValidationError("Role must be ADMIN or PLAYER");
  }

  return {
    email: email.trim(),
    password,
    displayName: displayName.trim(),
    role,
  };
}
