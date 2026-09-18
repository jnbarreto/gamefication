import InvalidValueError from "../exception/InvalidValueError.js";
import Uuid from "./Uuid.js";

describe("Uuid", () => {
  it("creates a valid UUID", () => {
    const id = Uuid.create();

    expect(Uuid.isValid(id.toString())).toBe(true);
  });

  it("rehydrates from a valid string", () => {
    const value = "550e8400-e29b-41d4-a716-446655440000";
    const id = Uuid.from(value);

    expect(id.toString()).toBe(value);
  });

  it("rejects invalid UUID strings", () => {
    expect(() => Uuid.from("not-a-uuid")).toThrow(InvalidValueError);
    expect(() => Uuid.from("")).toThrow(InvalidValueError);
  });

  it("compares equality by value", () => {
    const value = "550e8400-e29b-41d4-a716-446655440000";

    expect(Uuid.from(value).equals(Uuid.from(value))).toBe(true);
    expect(Uuid.from(value).equals(Uuid.create())).toBe(false);
  });
});
