import { isQuestDifficulty, parseQuestDifficulty } from "../../../domain/enum/QuestDifficulty.js";
import { isQuestType, parseQuestType } from "../../../domain/enum/QuestType.js";
import Uuid from "../../../domain/shared/Uuid.js";
import type { UpdateQuestInput } from "../../../application/usecase/quest/UpdateQuest.js";
import ValidationError from "../../../shared/exception/ValidationError.js";

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
): string | null | undefined {
  if (!(field in record)) {
    return undefined;
  }

  const value = record[field];

  if (value === null) {
    return null;
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

function readOptionalSkillAllocations(record: Record<string, unknown>) {
  if (!("skillAllocations" in record)) {
    return undefined;
  }

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

function readMissions(record: Record<string, unknown>) {
  if (!("missions" in record)) {
    return undefined;
  }

  const value = record.missions;

  if (!Array.isArray(value)) {
    throw new ValidationError("missions must be an array");
  }

  return value.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new ValidationError(`missions[${index}] must be an object`);
    }

    const mission = item as Record<string, unknown>;
    const title = mission.title;

    if (typeof title !== "string" || title.trim().length === 0) {
      throw new ValidationError(`missions[${index}].title must be a non-empty string`);
    }

    const id = mission.id;

    if (id !== undefined && id !== null) {
      if (typeof id !== "string" || !Uuid.isValid(id)) {
        throw new ValidationError(`missions[${index}].id must be a valid UUID`);
      }
    }

    return {
      id: typeof id === "string" ? id : undefined,
      title: title.trim(),
    };
  });
}

export function parseUpdateQuestBody(body: unknown): UpdateQuestInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Request body must be an object");
  }

  const record = body as Record<string, unknown>;

  let type;
  if ("type" in record && record.type !== undefined && record.type !== null) {
    if (typeof record.type !== "string") {
      throw new ValidationError("type must be a string");
    }
    if (!isQuestType(record.type)) {
      parseQuestType(record.type);
    }
    type = parseQuestType(record.type);
  }

  let difficulty;
  if ("difficulty" in record && record.difficulty !== undefined && record.difficulty !== null) {
    if (typeof record.difficulty !== "string") {
      throw new ValidationError("difficulty must be a string");
    }
    if (!isQuestDifficulty(record.difficulty)) {
      parseQuestDifficulty(record.difficulty);
    }
    difficulty = parseQuestDifficulty(record.difficulty);
  }

  return {
    title: readRequiredString(record, "title"),
    description: readOptionalString(record, "description"),
    type,
    difficulty,
    baseXp: readOptionalPositiveInteger(record, "baseXp"),
    skillAllocations: readOptionalSkillAllocations(record),
    missions: readMissions(record),
  };
}
