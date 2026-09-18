import ValidationError from "../../../shared/exception/ValidationError.js";

export type RegisterBody = {
  email: string;
  password: string;
  displayName: string;
};

export function parseRegisterBody(body: unknown): RegisterBody {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body is required");
  }

  const record = body as Record<string, unknown>;
  const email = record.email;
  const password = record.password;
  const displayName = record.displayName;

  if (typeof email !== "string" || !email.trim()) {
    throw new ValidationError("Email is required");
  }

  if (typeof password !== "string" || !password) {
    throw new ValidationError("Password is required");
  }

  if (typeof displayName !== "string" || !displayName.trim()) {
    throw new ValidationError("Display name is required");
  }

  return {
    email: email.trim(),
    password,
    displayName: displayName.trim(),
  };
}
