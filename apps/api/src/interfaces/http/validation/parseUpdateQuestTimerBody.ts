import type { UpdateQuestTimerInput } from "../../../application/usecase/quest/UpdateQuestTimer.js";
import ValidationError from "../../../shared/exception/ValidationError.js";

export function parseUpdateQuestTimerBody(body: unknown): UpdateQuestTimerInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Request body must be an object");
  }

  const record = body as Record<string, unknown>;

  const action = record.action;
  if (action !== "START" && action !== "PAUSE" && action !== "SYNC") {
    throw new ValidationError("action must be 'START', 'PAUSE', or 'SYNC'");
  }

  let timerSeconds: number | undefined;
  if ("timerSeconds" in record) {
    if (
      typeof record.timerSeconds !== "number" ||
      !Number.isInteger(record.timerSeconds) ||
      record.timerSeconds < 0
    ) {
      throw new ValidationError("timerSeconds must be a non-negative integer");
    }
    timerSeconds = record.timerSeconds;
  }

  return {
    action,
    timerSeconds,
  };
}
