import InvalidCredentialsError from "../../exception/InvalidCredentialsError.js";
import type UserRepository from "../../repository/UserRepository.js";
import PasswordHasher from "../../../infrastructure/auth/PasswordHasher.js";
import JwtService from "../../../infrastructure/auth/JwtService.js";
import { presentLogin } from "../../presenter/UserPresenter.js";

export type LoginInput = {
  email: string;
  password: string;
};

export default class LoginUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: LoginInput) {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user || !PasswordHasher.verify(input.password, user.getPasswordHash())) {
      throw new InvalidCredentialsError();
    }

    const token = JwtService.sign({
      sub: user.getId().toString(),
      role: user.getRole(),
      characterId: user.getCharacterId().toString(),
    });

    return presentLogin(token, user);
  }
}
