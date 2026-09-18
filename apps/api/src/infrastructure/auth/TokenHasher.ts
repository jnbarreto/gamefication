import { createHash, randomBytes } from "node:crypto";

export default class TokenHasher {
  static generateRawToken(): string {
    return randomBytes(32).toString("hex");
  }

  static hash(rawToken: string): string {
    return createHash("sha256").update(rawToken).digest("hex");
  }
}
