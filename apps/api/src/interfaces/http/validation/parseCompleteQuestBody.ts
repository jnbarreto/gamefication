import { parseEvidenceType } from "../../../domain/enum/EvidenceType.js";
import type { CompleteQuestInput } from "../../../application/usecase/quest/CompleteQuest.js";
import ValidationError from "../../../shared/exception/ValidationError.js";

function readOptionalNullableString(
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

  return value;
}

export function parseCompleteQuestBody(body: unknown): CompleteQuestInput {
  if (body === undefined || body === null) {
    return {};
  }

  if (typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Request body must be an object");
  }

  const record = body as Record<string, unknown>;

  if (!("evidence" in record)) {
    return {};
  }

  const evidenceValue = record.evidence;

  if (evidenceValue === null || evidenceValue === undefined) {
    return {};
  }

  if (typeof evidenceValue !== "object" || Array.isArray(evidenceValue)) {
    throw new ValidationError("evidence must be an object");
  }

  const evidence = evidenceValue as Record<string, unknown>;
  const typeValue = evidence.type;

  if (typeof typeValue !== "string") {
    throw new ValidationError("evidence.type is required");
  }

  const value = evidence.value;

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError("evidence.value is required");
  }

  return {
    evidence: {
      type: parseEvidenceType(typeValue),
      value: value.trim(),
      description: readOptionalNullableString(evidence, "description") ?? null,
    },
  };
}
