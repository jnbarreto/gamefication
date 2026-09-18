import type { UpdateCharacterProfileProps } from "../../../domain/character/Character.js";
import ValidationError from "../../../shared/exception/ValidationError.js";

const ALLOWED_FIELDS = [
  "name",
  "characterClass",
  "specialization",
  "subclass",
  "careerGoal",
  "currentRank",
] as const;

type AllowedField = (typeof ALLOWED_FIELDS)[number];

function isAllowedField(value: string): value is AllowedField {
  return ALLOWED_FIELDS.includes(value as AllowedField);
}

function readRequiredString(
  record: Record<string, unknown>,
  field: AllowedField,
): string {
  const value = readOptionalString(record, field);

  if (value === undefined || value === null) {
    throw new ValidationError(`${field} must be a non-empty string`);
  }

  return value;
}

function readOptionalString(
  record: Record<string, unknown>,
  field: AllowedField,
): string | null | undefined {
  if (!(field in record)) {
    return undefined;
  }

  const value = record[field];

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ValidationError(`${field} must be a string or null`);
  }

  return value;
}

export function parseUpdateCharacterBody(body: unknown): UpdateCharacterProfileProps {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Request body must be an object");
  }

  const record = body as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    if (!isAllowedField(key)) {
      throw new ValidationError(`Unknown field: ${key}`);
    }
  }

  const input: UpdateCharacterProfileProps = {};

  if ("name" in record) {
    input.name = readRequiredString(record, "name");
  }

  if ("characterClass" in record) {
    input.characterClass = readRequiredString(record, "characterClass");
  }

  if ("specialization" in record) {
    input.specialization = readRequiredString(record, "specialization");
  }

  if ("subclass" in record) {
    input.subclass = readOptionalString(record, "subclass");
  }

  if ("careerGoal" in record) {
    input.careerGoal = readOptionalString(record, "careerGoal");
  }

  if ("currentRank" in record) {
    input.currentRank = readOptionalString(record, "currentRank");
  }

  if (Object.keys(input).length === 0) {
    throw new ValidationError("At least one field is required");
  }

  return input;
}
