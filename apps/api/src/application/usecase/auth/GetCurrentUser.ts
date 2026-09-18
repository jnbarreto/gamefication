import NotFoundError from "../../exception/NotFoundError.js";
import type UserRepository from "../../repository/UserRepository.js";
import { presentUser } from "../../presenter/UserPresenter.js";

export default class GetCurrentUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return presentUser(user);
  }
}
