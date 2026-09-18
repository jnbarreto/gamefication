import ValidationError from "../../../shared/exception/ValidationError.js";

export type ForgotPasswordBody = {
  email: string;
};

export function parseForgotPasswordBody(body: unknown): ForgotPasswordBody {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body is required");
  }

  const record = body as Record<string, unknown>;
  const email = record.email;

  if (typeof email !== "string" || !email.trim()) {
    throw new ValidationError("Email is required");
  }

  return {
    email: email.trim(),
  };
}
