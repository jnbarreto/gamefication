import ValidationError from "../../../shared/exception/ValidationError.js";

export function parseUpdateQuestMissionBody(body: unknown): { completed: boolean } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Request body must be an object");
  }

  const record = body as Record<string, unknown>;

  if (!("completed" in record) || typeof record.completed !== "boolean") {
    throw new ValidationError("completed must be a boolean");
  }

  return {
    completed: record.completed,
  };
}
