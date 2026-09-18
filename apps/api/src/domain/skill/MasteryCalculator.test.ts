import { MasteryLevel } from "../enum/MasteryLevel.js";
import {
  calculateMasteryLevel,
  progressToNextMasteryLevel,
  xpToNextMasteryLevel,
} from "./MasteryCalculator.js";

describe("MasteryCalculator", () => {
  it("calculates mastery from skill XP", () => {
    expect(calculateMasteryLevel(0)).toBe(MasteryLevel.UNKNOWN);
    expect(calculateMasteryLevel(200)).toBe(MasteryLevel.SOLO);
  });

  it("calculates XP remaining to next mastery level", () => {
    expect(xpToNextMasteryLevel(10, MasteryLevel.UNKNOWN)).toBe(15);
    expect(xpToNextMasteryLevel(500, MasteryLevel.TEACH)).toBeNull();
  });

  it("calculates progress within the current mastery band", () => {
    expect(progressToNextMasteryLevel(10, MasteryLevel.UNKNOWN)).toBe(0.4);
    expect(progressToNextMasteryLevel(500, MasteryLevel.TEACH)).toBe(1);
  });
});
