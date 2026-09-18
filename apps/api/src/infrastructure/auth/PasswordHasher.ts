import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export default class PasswordHasher {
  static hash(password: string): string {
    const salt = randomBytes(SALT_LENGTH);
    const hash = scryptSync(password, salt, KEY_LENGTH);

    return `${salt.toString("hex")}:${hash.toString("hex")}`;
  }

  /** Deterministic hash for seed data / migrations — never use for live user passwords. */
  static hashDeterministic(password: string, seedKey: string): string {
    const salt = createHash("sha256").update(seedKey).digest().subarray(0, SALT_LENGTH);
    const hash = scryptSync(password, salt, KEY_LENGTH);

    return `${salt.toString("hex")}:${hash.toString("hex")}`;
  }

  static verify(password: string, stored: string): boolean {
    const [saltHex, hashHex] = stored.split(":");

    if (!saltHex || !hashHex) {
      return false;
    }

    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(password, salt, KEY_LENGTH);

    if (expected.length !== actual.length) {
      return false;
    }

    return timingSafeEqual(expected, actual);
  }
}
