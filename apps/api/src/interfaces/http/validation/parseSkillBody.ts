import ValidationError from "../../../shared/exception/ValidationError.js";
import Uuid from "../../../domain/shared/Uuid.js";
import type { CreateSkillInput } from "../../../application/usecase/skill/CreateSkill.js";
import type { UpdateSkillInput } from "../../../application/usecase/skill/UpdateSkill.js";

function readRequiredString(record: Record<string, unknown>, field: string): string {
  const value = record[field];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${field} is required`);
  }

  return value.trim();
}

function readOptionalString(
  record: Record<string, unknown>,
  field: string,
): string | undefined {
  if (!(field in record)) {
    return undefined;
  }

  const value = record[field];

  if (value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ValidationError(`${field} must be a string`);
  }

  return value.trim();
}

function readNullableString(
  record: Record<string, unknown>,
  field: string,
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

  return value.trim();
}

function readOptionalUuid(
  record: Record<string, unknown>,
  field: string,
): string | undefined {
  if (!(field in record)) {
    return undefined;
  }

  const value = record[field];

  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || !Uuid.isValid(value)) {
    throw new ValidationError(`${field} must be a valid UUID`);
  }

  return value;
}

function readNullableUuid(
  record: Record<string, unknown>,
  field: string,
): string | null | undefined {
  if (!(field in record)) {
    return undefined;
  }

  const value = record[field];

  if (value === null) {
    return null;
  }

  if (typeof value !== "string" || !Uuid.isValid(value)) {
    throw new ValidationError(`${field} must be a valid UUID or null`);
  }

  return value;
}

export function parseCreateSkillCategoryBody(body: unknown): { name: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Request body must be an object");
  }

  const record = body as Record<string, unknown>;

  return {
    name: readRequiredString(record, "name"),
  };
}

export function parseCreateSkillBody(body: unknown): CreateSkillInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Request body must be an object");
  }

  const record = body as Record<string, unknown>;

  return {
    name: readRequiredString(record, "name"),
    description: readOptionalString(record, "description"),
    categoryId: readOptionalUuid(record, "categoryId"),
    parentSkillId: readNullableUuid(record, "parentSkillId"),
  };
}

export function parseUpdateSkillBody(body: unknown): Omit<UpdateSkillInput, "skillId"> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Request body must be an object");
  }

  const record = body as Record<string, unknown>;

  return {
    name: readOptionalString(record, "name"),
    description: readNullableString(record, "description"),
    parentSkillId: readNullableUuid(record, "parentSkillId"),
  };
}

export function parseSkillIdParam(value: unknown): string {
  if (typeof value !== "string" || !Uuid.isValid(value)) {
    throw new ValidationError("skill id must be a valid UUID");
  }

  return value;
}
