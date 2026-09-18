import {
  isQuestDifficulty,
  parseQuestDifficulty,
} from "../../../domain/enum/QuestDifficulty.js";
import { isQuestType, parseQuestType } from "../../../domain/enum/QuestType.js";
import Uuid from "../../../domain/shared/Uuid.js";
import type { CreateQuestInput } from "../../../application/usecase/quest/CreateQuest.js";
import ValidationError from "../../../shared/exception/ValidationError.js";

function readRequiredString(record: Record<string, unknown>, field: string): string {
  const value = record[field];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${field} is required`);
  }

  return value;
}

function readOptionalString(
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

  if (typeof value !== "string") {
    throw new ValidationError(`${field} must be a string`);
  }

  return value;
}

function readOptionalPositiveInteger(
  record: Record<string, unknown>,
  field: string,
): number | undefined {
  if (!(field in record)) {
    return undefined;
  }

  const value = record[field];

  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new ValidationError(`${field} must be a positive integer`);
  }

  return value;
}

function readSkillAllocations(record: Record<string, unknown>) {
  const value = record.skillAllocations;

  if (!Array.isArray(value) || value.length === 0) {
    throw new ValidationError("skillAllocations must be a non-empty array");
  }

  return value.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new ValidationError(`skillAllocations[${index}] must be an object`);
    }

    const allocation = item as Record<string, unknown>;
    const skillId = allocation.skillId;

    if (typeof skillId !== "string" || !Uuid.isValid(skillId)) {
      throw new ValidationError(
        `skillAllocations[${index}].skillId must be a valid UUID`,
      );
    }

    const xp = allocation.xp;

    if (typeof xp !== "number" || !Number.isInteger(xp) || xp <= 0) {
      throw new ValidationError(
        `skillAllocations[${index}].xp must be a positive integer`,
      );
    }

    return { skillId, xp };
  });
}

function readOptionalDueDate(record: Record<string, unknown>): Date | undefined {
  if (!("dueDate" in record)) {
    return undefined;
  }

  const value = record.dueDate;

  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ValidationError("dueDate must be an ISO date string");
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError("dueDate must be a valid ISO date string");
  }

  return parsed;
}

export function parseCreateQuestBody(body: unknown): CreateQuestInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Request body must be an object");
  }

  const record = body as Record<string, unknown>;
  const typeValue = readRequiredString(record, "type");

  if (!isQuestType(typeValue)) {
    parseQuestType(typeValue);
  }

  const difficultyValue = readRequiredString(record, "difficulty");

  if (!isQuestDifficulty(difficultyValue)) {
    parseQuestDifficulty(difficultyValue);
  }

  return {
    title: readRequiredString(record, "title"),
    description: readOptionalString(record, "description"),
    type: parseQuestType(typeValue),
    difficulty: parseQuestDifficulty(difficultyValue),
    baseXp: readOptionalPositiveInteger(record, "baseXp"),
    skillAllocations: readSkillAllocations(record),
    missions: readOptionalMissionTitles(record),
    dueDate: readOptionalDueDate(record),
    notes: readOptionalString(record, "notes"),
  };
}

function readOptionalMissionTitles(record: Record<string, unknown>): string[] | undefined {
  if (!("missions" in record)) {
    return undefined;
  }

  const value = record.missions;

  if (value === null || value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new ValidationError("missions must be an array");
  }

  return value.map((item, index) => {
    if (typeof item !== "string" || item.trim().length === 0) {
      throw new ValidationError(`missions[${index}] must be a non-empty string`);
    }

    return item.trim();
  });
}
