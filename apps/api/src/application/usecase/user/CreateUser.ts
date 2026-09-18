import InvalidValueError from "../../../domain/exception/InvalidValueError.js";
import User from "../../../domain/user/User.js";
import type { UserRole } from "../../../domain/user/UserRole.js";
import Uuid from "../../../domain/shared/Uuid.js";
import type UserRepository from "../../repository/UserRepository.js";
import PasswordHasher from "../../../infrastructure/auth/PasswordHasher.js";
import { presentUser } from "../../presenter/UserPresenter.js";

export type CreateUserInput = {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
};

export default class CreateUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserInput) {
    if (await this.userRepository.emailExists(input.email)) {
      throw new InvalidValueError("Email already exists");
    }

    const passwordHash = PasswordHasher.hash(User.requirePassword(input.password));
    const characterId = Uuid.create().toString();

    const user = User.create(
      {
        email: input.email,
        password: input.password,
        displayName: input.displayName,
        role: input.role,
      },
      passwordHash,
      characterId,
    );

    await this.userRepository.createWithCharacter(user);

    return presentUser(user);
  }
}
