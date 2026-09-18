import ValidationError from "../../../shared/exception/ValidationError.js";
import { parseUpdateCharacterBody } from "./parseUpdateCharacterBody.js";

describe("parseUpdateCharacterBody", () => {
  it("accepts partial profile updates", () => {
    expect(
      parseUpdateCharacterBody({
        currentRank: "Pleno Forte",
      }),
    ).toEqual({
      currentRank: "Pleno Forte",
    });
  });

  it("allows nullable fields to be cleared", () => {
    expect(
      parseUpdateCharacterBody({
        subclass: null,
      }),
    ).toEqual({
      subclass: null,
    });
  });

  it("rejects empty bodies", () => {
    expect(() => parseUpdateCharacterBody({})).toThrow(ValidationError);
  });

  it("rejects unknown fields", () => {
    expect(() =>
      parseUpdateCharacterBody({
        totalXp: 999,
      }),
    ).toThrow(ValidationError);
  });
});
