import InvalidValueError from "../exception/InvalidValueError.js";
import XpAmount, { XP_TIERS } from "./XpAmount.js";

describe("XpAmount", () => {
  it("accepts positive integers including custom values", () => {
    expect(XpAmount.from(42).amount).toBe(42);
    expect(XpAmount.from(500).amount).toBe(500);
  });

  it("exposes preset tiers", () => {
    expect(XpAmount.small().amount).toBe(XP_TIERS.SMALL);
    expect(XpAmount.medium().amount).toBe(XP_TIERS.MEDIUM);
    expect(XpAmount.large().amount).toBe(XP_TIERS.LARGE);
  });

  it("rejects zero, negative, and non-integer values", () => {
    expect(() => XpAmount.from(0)).toThrow(InvalidValueError);
    expect(() => XpAmount.from(-10)).toThrow(InvalidValueError);
    expect(() => XpAmount.from(10.5)).toThrow(InvalidValueError);
  });

  it("adds XP without mutation", () => {
    const base = XpAmount.from(10);
    const bonus = XpAmount.from(30);

    expect(base.add(bonus).amount).toBe(40);
    expect(base.amount).toBe(10);
  });
});
