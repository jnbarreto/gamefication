import Uuid from "../../../domain/shared/Uuid.js";
import type { ListXpTransactionsFilter } from "../../../application/repository/XpTransactionRepository.js";
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

export function parseListXpTransactionsQuery(
  query: Record<string, unknown>,
): ListXpTransactionsFilter {
  const filter: ListXpTransactionsFilter = {};

  const periodValue = readOptionalQueryValue(query, "period");

  if (periodValue !== undefined) {
    if (!ALLOWED_PERIODS.has(periodValue)) {
      throw new ValidationError(`Unsupported period: ${periodValue}`);
    }

    const createdAfter = new Date();
    createdAfter.setDate(createdAfter.getDate() - 30);
    filter.createdAfter = createdAfter;
  }

  const skillIdValue = readOptionalQueryValue(query, "skillId");

  if (skillIdValue !== undefined) {
    if (!Uuid.isValid(skillIdValue)) {
      throw new ValidationError("skillId must be a valid UUID");
    }

    filter.skillId = skillIdValue;
  }

  return filter;
}
