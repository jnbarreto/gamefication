import Uuid from "../../../domain/shared/Uuid.js";
import ValidationError from "../../../shared/exception/ValidationError.js";

export function parseQuestIdParam(value: string): string {
  if (!Uuid.isValid(value)) {
    throw new ValidationError("Quest id must be a valid UUID");
  }

  return value;
}
