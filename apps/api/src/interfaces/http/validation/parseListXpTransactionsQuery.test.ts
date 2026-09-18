import ValidationError from "../../../shared/exception/ValidationError.js";
import { parseListXpTransactionsQuery } from "./parseListXpTransactionsQuery.js";

const nodeSkillId = "550e8400-e29b-41d4-a716-446655440001";

describe("parseListXpTransactionsQuery", () => {
  it("returns an empty filter by default", () => {
    expect(parseListXpTransactionsQuery({})).toEqual({});
  });

  it("parses period=last30days", () => {
    const filter = parseListXpTransactionsQuery({ period: "last30days" });
    const daysDiff =
      (Date.now() - (filter.createdAfter?.getTime() ?? 0)) / (1000 * 60 * 60 * 24);

    expect(filter.createdAfter).toBeInstanceOf(Date);
    expect(daysDiff).toBeGreaterThanOrEqual(29.9);
    expect(daysDiff).toBeLessThanOrEqual(30.1);
  });

  it("parses skillId", () => {
    expect(parseListXpTransactionsQuery({ skillId: nodeSkillId })).toEqual({
      skillId: nodeSkillId,
    });
  });

  it("rejects unsupported period values", () => {
    expect(() => parseListXpTransactionsQuery({ period: "last7days" })).toThrow(
      ValidationError,
    );
  });

  it("rejects invalid skillId", () => {
    expect(() => parseListXpTransactionsQuery({ skillId: "invalid" })).toThrow(
      ValidationError,
    );
  });
});
