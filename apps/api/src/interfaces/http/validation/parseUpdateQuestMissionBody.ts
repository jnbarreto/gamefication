import ValidationError from "../../../shared/exception/ValidationError.js";

export function parseUpdateQuestMissionBody(body: unknown): {
  completed: boolean;
  durationSeconds?: number | null;
} {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Request body must be an object");
  }

  const record = body as Record<string, unknown>;

  if (!("completed" in record) || typeof record.completed !== "boolean") {
    throw new ValidationError("completed must be a boolean");
  }

  let durationSeconds: number | null | undefined = undefined;
  if ("durationSeconds" in record) {
    if (record.durationSeconds === null) {
      durationSeconds = null;
    } else if (
      typeof record.durationSeconds === "number" &&
      Number.isInteger(record.durationSeconds) &&
      record.durationSeconds >= 0
    ) {
      durationSeconds = record.durationSeconds;
    } else {
      throw new ValidationError("durationSeconds must be a non-negative integer or null");
    }
  }

  return {
    completed: record.completed,
    durationSeconds,
  };
}
