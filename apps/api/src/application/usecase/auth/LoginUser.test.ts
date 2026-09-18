import User from "../../../domain/user/User.js";
import InvalidCredentialsError from "../../exception/InvalidCredentialsError.js";
import type UserRepository from "../../repository/UserRepository.js";
import PasswordHasher from "../../../infrastructure/auth/PasswordHasher.js";
import LoginUser from "./LoginUser.js";

const characterId = "550e8400-e29b-41d4-a716-446655440101";

function buildUser(password = "admin123") {
  return User.rebuild({
    id: "550e8400-e29b-41d4-a716-446655440100",
    email: "admin@gamefication.local",
    passwordHash: PasswordHasher.hash(password),
    displayName: "Admin",
    role: "ADMIN",
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

describe("LoginUser", () => {
  it("returns token and user for valid credentials", async () => {
    const useCase = new LoginUser(new InMemoryUserRepository(buildUser()));

    const result = await useCase.execute({
      email: "admin@gamefication.local",
      password: "admin123",
    });

    expect(result.token).toBeTruthy();
    expect(result.user.email).toBe("admin@gamefication.local");
    expect(result.user.role).toBe("ADMIN");
    expect(result.user.characterId).toBe(characterId);
  });

  it("throws for invalid credentials", async () => {
    const useCase = new LoginUser(new InMemoryUserRepository(buildUser()));

    await expect(
      useCase.execute({
        email: "admin@gamefication.local",
        password: "wrong-password",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
