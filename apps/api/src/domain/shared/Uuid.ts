import { randomUUID } from "node:crypto";

import InvalidValueError from "../exception/InvalidValueError.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default class Uuid {
  private constructor(private readonly value: string) {}

  static create(): Uuid {
    return new Uuid(randomUUID());
  }

  static from(value: string): Uuid {
    if (!Uuid.isValid(value)) {
      throw new InvalidValueError(`Invalid UUID: ${value}`);
    }

    return new Uuid(value);
  }

  static isValid(value: string): boolean {
    return UUID_PATTERN.test(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Uuid): boolean {
    return this.value === other.value;
  }
}
