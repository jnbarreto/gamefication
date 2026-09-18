import User from "../../../domain/user/User.js";
import PasswordHasher from "../../../infrastructure/auth/PasswordHasher.js";
import type UserRepository from "../../repository/UserRepository.js";
import RegisterUser from "./RegisterUser.js";

class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  findByEmail(email: string) {
    return Promise.resolve(
      this.users.find((user) => user.getEmail() === email.toLowerCase()) ?? null,
    );
  }

  findById(id: string) {
    return Promise.resolve(this.users.find((user) => user.getId().toString() === id) ?? null);
  }

  listAll() {
    return Promise.resolve(this.users);
  }

  emailExists(email: string) {
    return this.findByEmail(email).then((user) => user !== null);
  }

  save(user: User) {
    this.users = this.users.map((entry) =>
      entry.getId().toString() === user.getId().toString() ? user : entry,
    );
    return Promise.resolve();
  }

  createWithCharacter(user: User) {
    this.users.push(user);
    return Promise.resolve();
  }
}

describe("RegisterUser", () => {
  it("creates a player and returns login token", async () => {
    const useCase = new RegisterUser(new InMemoryUserRepository());

    const result = await useCase.execute({
      email: "player@example.com",
      password: "password123",
      displayName: "Player One",
    });

    expect(result.token).toBeTruthy();
    expect(result.user.email).toBe("player@example.com");
    expect(result.user.role).toBe("PLAYER");
    expect(result.user.displayName).toBe("Player One");
  });

  it("rejects duplicate email", async () => {
    const repository = new InMemoryUserRepository();
    const useCase = new RegisterUser(repository);

    await useCase.execute({
      email: "player@example.com",
      password: "password123",
      displayName: "Player One",
    });

    await expect(
      useCase.execute({
        email: "player@example.com",
        password: "anotherpass",
        displayName: "Player Two",
      }),
    ).rejects.toThrow("Email already exists");
  });
});
