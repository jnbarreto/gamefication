import ValidationError from "../../../shared/exception/ValidationError.js";

export type LoginBody = {
  email: string;
  password: string;
};

export function parseLoginBody(body: unknown): LoginBody {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body is required");
  }

  const record = body as Record<string, unknown>;
  const email = record.email;
  const password = record.password;

  if (typeof email !== "string" || !email.trim()) {
    throw new ValidationError("Email is required");
  }

  if (typeof password !== "string" || !password) {
    throw new ValidationError("Password is required");
  }

  return {
    email: email.trim(),
    password,
  };
}
