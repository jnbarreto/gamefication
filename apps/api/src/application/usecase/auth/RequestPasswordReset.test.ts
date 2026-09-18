import User from "../../../domain/user/User.js";
import PasswordHasher from "../../../infrastructure/auth/PasswordHasher.js";
import type { AuthTokenRecord } from "../../repository/AuthTokenRepository.js";
import type AuthTokenRepository from "../../repository/AuthTokenRepository.js";
import type UserRepository from "../../repository/UserRepository.js";
import type EmailService from "../../service/EmailService.js";
import RequestPasswordReset from "./RequestPasswordReset.js";

const characterId = "550e8400-e29b-41d4-a716-446655440101";

function buildUser() {
  return User.rebuild({
    id: "550e8400-e29b-41d4-a716-446655440100",
    email: "player@example.com",
    passwordHash: PasswordHasher.hash("password123"),
    displayName: "Player",
    role: "PLAYER",
    characterId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

class InMemoryUserRepository implements UserRepository {
  constructor(private user: User | null) {}

  findByEmail(email: string) {
    if (!this.user || this.user.getEmail() !== email.toLowerCase()) {
      return Promise.resolve(null);
    }

    return Promise.resolve(this.user);
  }

  findById() {
    return Promise.resolve(this.user);
  }

  listAll() {
    return Promise.resolve(this.user ? [this.user] : []);
  }

  emailExists() {
    return Promise.resolve(false);
  }

  save() {
    return Promise.resolve();
  }

  createWithCharacter() {
    return Promise.resolve();
  }
}

class InMemoryAuthTokenRepository implements AuthTokenRepository {
  records: AuthTokenRecord[] = [];

  create(record: AuthTokenRecord) {
    this.records.push(record);
    return Promise.resolve();
  }

  findValidByHash(tokenHash: string, type: AuthTokenRecord["type"]) {
    const record = this.records.find(
      (entry) =>
        entry.tokenHash === tokenHash &&
        entry.type === type &&
        entry.usedAt === null &&
        entry.expiresAt > new Date(),
    );

    return Promise.resolve(record ?? null);
  }

  invalidateActiveForUser(userId: string, type: AuthTokenRecord["type"]) {
    this.records = this.records.map((entry) =>
      entry.userId === userId && entry.type === type && entry.usedAt === null
        ? { ...entry, usedAt: new Date() }
        : entry,
    );

    return Promise.resolve();
  }

  markUsed(id: string, usedAt: Date) {
    this.records = this.records.map((entry) =>
      entry.id === id ? { ...entry, usedAt } : entry,
    );

    return Promise.resolve();
  }
}

class FakeEmailService implements EmailService {
  lastResetUrl: string | null = null;

  async sendPasswordResetEmail(input: { to: string; resetUrl: string }) {
    this.lastResetUrl = input.resetUrl;
  }
}

describe("RequestPasswordReset", () => {
  it("returns generic message and sends email when user exists", async () => {
    const emailService = new FakeEmailService();
    const authTokenRepository = new InMemoryAuthTokenRepository();
    const useCase = new RequestPasswordReset(
      new InMemoryUserRepository(buildUser()),
      authTokenRepository,
      emailService,
    );

    const result = await useCase.execute({ email: "player@example.com" });

    expect(result.message).toBe("If the email exists, a reset link was sent.");
    expect(emailService.lastResetUrl).toContain("view=reset&token=");
    expect(authTokenRepository.records).toHaveLength(1);
  });

  it("returns generic message without sending when user is missing", async () => {
    const emailService = new FakeEmailService();
    const authTokenRepository = new InMemoryAuthTokenRepository();
    const useCase = new RequestPasswordReset(
      new InMemoryUserRepository(null),
      authTokenRepository,
      emailService,
    );

    const result = await useCase.execute({ email: "missing@example.com" });

    expect(result.message).toBe("If the email exists, a reset link was sent.");
    expect(emailService.lastResetUrl).toBeNull();
    expect(authTokenRepository.records).toHaveLength(0);
  });
});
