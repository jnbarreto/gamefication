import NotFoundError from "../../exception/NotFoundError.js";
import User from "../../../domain/user/User.js";
import type { UserRole } from "../../../domain/user/UserRole.js";
import type UserRepository from "../../repository/UserRepository.js";
import PasswordHasher from "../../../infrastructure/auth/PasswordHasher.js";
import { presentUser } from "../../presenter/UserPresenter.js";

export type UpdateUserInput = {
  userId: string;
  displayName?: string;
  role?: UserRole;
  password?: string;
};

export default class UpdateUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: UpdateUserInput) {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const passwordHash =
      input.password !== undefined
        ? PasswordHasher.hash(User.requirePassword(input.password))
        : undefined;

    user.updateProfile(
      {
        displayName: input.displayName,
        role: input.role,
        password: input.password,
      },
      passwordHash,
    );

    await this.userRepository.save(user);

    return presentUser(user);
  }
}
