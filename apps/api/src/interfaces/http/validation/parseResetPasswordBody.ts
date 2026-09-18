import ValidationError from "../../../shared/exception/ValidationError.js";

export type ResetPasswordBody = {
  token: string;
  password: string;
};

export function parseResetPasswordBody(body: unknown): ResetPasswordBody {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body is required");
  }

  const record = body as Record<string, unknown>;
  const token = record.token;
  const password = record.password;

  if (typeof token !== "string" || !token.trim()) {
    throw new ValidationError("Reset token is required");
  }

  if (typeof password !== "string" || !password) {
    throw new ValidationError("Password is required");
  }

  return {
    token: token.trim(),
    password,
  };
}
