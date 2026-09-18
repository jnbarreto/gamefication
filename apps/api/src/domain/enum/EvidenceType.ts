import InvalidValueError from "../exception/InvalidValueError.js";

export const EvidenceType = {
  URL: "URL",
  COMMIT: "COMMIT",
  REPO: "REPO",
  DOCUMENT: "DOCUMENT",
  SCREENSHOT: "SCREENSHOT",
  NOTE: "NOTE",
  DEPLOY: "DEPLOY",
  VIDEO: "VIDEO",
} as const;

export type EvidenceType = (typeof EvidenceType)[keyof typeof EvidenceType];

const VALUES = new Set<string>(Object.values(EvidenceType));

export function isEvidenceType(value: string): value is EvidenceType {
  return VALUES.has(value);
}

export function parseEvidenceType(value: string): EvidenceType {
  if (!isEvidenceType(value)) {
    throw new InvalidValueError(`Invalid evidence type: ${value}`);
  }

  return value;
}
