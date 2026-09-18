import User from "../../../domain/user/User.js";
import ValidationError from "../../../shared/exception/ValidationError.js";
import PasswordHasher from "../../../infrastructure/auth/PasswordHasher.js";
import TokenHasher from "../../../infrastructure/auth/TokenHasher.js";
import type { AuthTokenRecord } from "../../repository/AuthTokenRepository.js";
import type AuthTokenRepository from "../../repository/AuthTokenRepository.js";
import type UserRepository from "../../repository/UserRepository.js";
import ResetPassword from "./ResetPassword.js";

const characterId = "550e8400-e29b-41d4-a716-446655440101";
const userId = "550e8400-e29b-41d4-a716-446655440100";

function buildUser() {
  return User.rebuild({
    id: userId,
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

  findByEmail() {
    return Promise.resolve(this.user);
  }

  findById(id: string) {
    if (!this.user || this.user.getId().toString() !== id) {
      return Promise.resolve(null);
    }

    return Promise.resolve(this.user);
  }

  listAll() {
    return Promise.resolve(this.user ? [this.user] : []);
  }

  emailExists() {
    return Promise.resolve(false);
  }

  async save(user: User) {
    this.user = user;
  }

  createWithCharacter() {
    return Promise.resolve();
  }

  getUser() {
    return this.user;
  }
}

class InMemoryAuthTokenRepository implements AuthTokenRepository {
  constructor(private record: AuthTokenRecord | null) {}

  create() {
    return Promise.resolve();
  }

  findValidByHash(tokenHash: string, type: AuthTokenRecord["type"]) {
    if (!this.record || this.record.tokenHash !== tokenHash || this.record.type !== type) {
      return Promise.resolve(null);
    }

    return Promise.resolve(this.record);
  }

  invalidateActiveForUser() {
    return Promise.resolve();
  }

  async markUsed(id: string, usedAt: Date) {
    if (this.record && this.record.id === id) {
      this.record = { ...this.record, usedAt };
    }
  }
}

describe("ResetPassword", () => {
  it("updates password for valid token", async () => {
    const rawToken = TokenHasher.generateRawToken();
    const repository = new InMemoryUserRepository(buildUser());
    const authTokenRepository = new InMemoryAuthTokenRepository({
      id: "token-1",
      userId,
      tokenHash: TokenHasher.hash(rawToken),
      type: "PASSWORD_RESET",
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      createdAt: new Date(),
    });
    const useCase = new ResetPassword(repository, authTokenRepository);

    const result = await useCase.execute({
      token: rawToken,
      password: "newpassword99",
    });

    expect(result.message).toBe("Password updated successfully");
    expect(
      PasswordHasher.verify("newpassword99", repository.getUser()!.getPasswordHash()),
    ).toBe(true);
  });

  it("rejects invalid token", async () => {
    const useCase = new ResetPassword(
      new InMemoryUserRepository(buildUser()),
      new InMemoryAuthTokenRepository(null),
    );

    await expect(
      useCase.execute({
        token: "invalid-token",
        password: "newpassword99",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
