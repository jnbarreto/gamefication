import { isQuestStatus, parseQuestStatus } from "../../../domain/enum/QuestStatus.js";
import { isQuestType, parseQuestType } from "../../../domain/enum/QuestType.js";
import type { ListQuestsFilter } from "../../../application/repository/QuestRepository.js";
import ValidationError from "../../../shared/exception/ValidationError.js";

const ALLOWED_PERIODS = new Set(["last30days"]);

function readOptionalQueryValue(
  query: Record<string, unknown>,
  field: string,
): string | undefined {
  const value = query[field];

  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    throw new ValidationError(`${field} must be a single value`);
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${field} must be a non-empty string`);
  }

  return value;
}

export function parseListQuestsQuery(query: Record<string, unknown>): ListQuestsFilter {
  const filter: ListQuestsFilter = {};

  const statusValue = readOptionalQueryValue(query, "status");

  if (statusValue !== undefined) {
    if (!isQuestStatus(statusValue)) {
      parseQuestStatus(statusValue);
    }

    filter.status = parseQuestStatus(statusValue);
  }

  const typeValue = readOptionalQueryValue(query, "type");

  if (typeValue !== undefined) {
    if (!isQuestType(typeValue)) {
      parseQuestType(typeValue);
    }

    filter.type = parseQuestType(typeValue);
  }

  const periodValue = readOptionalQueryValue(query, "period");

  if (periodValue !== undefined) {
    if (!ALLOWED_PERIODS.has(periodValue)) {
      throw new ValidationError(`Unsupported period: ${periodValue}`);
    }

    const createdAfter = new Date();
    createdAfter.setDate(createdAfter.getDate() - 30);
    filter.createdAfter = createdAfter;
  }

  return filter;
}
