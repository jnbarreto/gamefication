import ValidationError from "../../../shared/exception/ValidationError.js";
import {
  parseAchievementSlugParam,
  parseUnlockAchievementBody,
} from "./parseUnlockAchievementBody.js";

describe("parseUnlockAchievementBody", () => {
  it("returns an empty input by default", () => {
    expect(parseUnlockAchievementBody({})).toEqual({});
  });

  it("parses optional evidence", () => {
    expect(
      parseUnlockAchievementBody({
        evidence: {
          type: "URL",
          value: "https://github.com/org/repo/pull/1",
          description: "Merged PR",
        },
      }),
    ).toEqual({
      evidence: {
        type: "URL",
        value: "https://github.com/org/repo/pull/1",
        description: "Merged PR",
      },
    });
  });

  it("validates achievement slug param", () => {
    expect(parseAchievementSlugParam("first-pr")).toBe("first-pr");
    expect(() => parseAchievementSlugParam("Invalid Slug")).toThrow(ValidationError);
  });
});
