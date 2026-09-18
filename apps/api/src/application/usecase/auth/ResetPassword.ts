import User from "../../../domain/user/User.js";
import ValidationError from "../../../shared/exception/ValidationError.js";
import type AuthTokenRepository from "../../repository/AuthTokenRepository.js";
import type UserRepository from "../../repository/UserRepository.js";
import PasswordHasher from "../../../infrastructure/auth/PasswordHasher.js";
import TokenHasher from "../../../infrastructure/auth/TokenHasher.js";

export type ResetPasswordInput = {
  token: string;
  password: string;
};

export default class ResetPassword {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authTokenRepository: AuthTokenRepository,
  ) {}

  async execute(input: ResetPasswordInput) {
    const tokenHash = TokenHasher.hash(input.token.trim());
    const authToken = await this.authTokenRepository.findValidByHash(
      tokenHash,
      "PASSWORD_RESET",
    );

    if (!authToken) {
      throw new ValidationError("Invalid or expired reset token");
    }

    const user = await this.userRepository.findById(authToken.userId);

    if (!user) {
      throw new ValidationError("Invalid or expired reset token");
    }

    const passwordHash = PasswordHasher.hash(User.requirePassword(input.password));

    user.updateProfile({ password: input.password }, passwordHash);

    await this.userRepository.save(user);
    await this.authTokenRepository.markUsed(authToken.id, new Date());

    return {
      message: "Password updated successfully",
    };
  }
}
