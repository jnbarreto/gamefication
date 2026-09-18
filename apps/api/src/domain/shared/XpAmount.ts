import InvalidValueError from "../exception/InvalidValueError.js";

export const XP_TIERS = {
  SMALL: 10,
  MEDIUM: 25,
  LARGE: 50,
  BOSS_MIN: 100,
  BOSS_MAX: 300,
} as const;

export default class XpAmount {
  private constructor(private readonly value: number) {}

  static from(value: number): XpAmount {
    if (!Number.isInteger(value) || value < 1) {
      throw new InvalidValueError(`XP must be a positive integer, got ${value}`);
    }

    return new XpAmount(value);
  }

  static small(): XpAmount {
    return XpAmount.from(XP_TIERS.SMALL);
  }

  static medium(): XpAmount {
    return XpAmount.from(XP_TIERS.MEDIUM);
  }

  static large(): XpAmount {
    return XpAmount.from(XP_TIERS.LARGE);
  }

  get amount(): number {
    return this.value;
  }

  add(other: XpAmount): XpAmount {
    return XpAmount.from(this.value + other.amount);
  }

  equals(other: XpAmount): boolean {
    return this.value === other.amount;
  }
}
