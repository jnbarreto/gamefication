import InvalidValueError from "../../../domain/exception/InvalidValueError.js";
import User from "../../../domain/user/User.js";
import Uuid from "../../../domain/shared/Uuid.js";
import type UserRepository from "../../repository/UserRepository.js";
import PasswordHasher from "../../../infrastructure/auth/PasswordHasher.js";
import JwtService from "../../../infrastructure/auth/JwtService.js";
import { presentLogin } from "../../presenter/UserPresenter.js";

export type RegisterUserInput = {
  email: string;
  password: string;
  displayName: string;
};

export default class RegisterUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: RegisterUserInput) {
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
        role: "PLAYER",
      },
      passwordHash,
      characterId,
    );

    await this.userRepository.createWithCharacter(user);

    const token = JwtService.sign({
      sub: user.getId().toString(),
      role: user.getRole(),
      characterId: user.getCharacterId().toString(),
    });

    return presentLogin(token, user);
  }
}
