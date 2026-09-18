import { QuestStatus } from "../../../domain/enum/QuestStatus.js";
import { QuestType } from "../../../domain/enum/QuestType.js";
import ValidationError from "../../../shared/exception/ValidationError.js";
import { parseListQuestsQuery } from "./parseListQuestsQuery.js";

describe("parseListQuestsQuery", () => {
  it("returns an empty filter by default", () => {
    expect(parseListQuestsQuery({})).toEqual({});
  });

  it("parses status and type filters", () => {
    expect(
      parseListQuestsQuery({
        status: QuestStatus.TODO,
        type: QuestType.WORK,
      }),
    ).toEqual({
      status: QuestStatus.TODO,
      type: QuestType.WORK,
    });
  });

  it("parses last30days period", () => {
    const filter = parseListQuestsQuery({ period: "last30days" });
    const daysDiff =
      (Date.now() - filter.createdAfter!.getTime()) / (24 * 60 * 60 * 1000);

    expect(filter.createdAfter).toBeInstanceOf(Date);
    expect(daysDiff).toBeGreaterThanOrEqual(29.9);
    expect(daysDiff).toBeLessThanOrEqual(30.1);
  });

  it("rejects unsupported period values", () => {
    expect(() => parseListQuestsQuery({ period: "last7days" })).toThrow(
      ValidationError,
    );
  });
});
