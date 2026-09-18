import type UserRepository from "../../repository/UserRepository.js";
import { presentUser } from "../../presenter/UserPresenter.js";

export default class ListUsers {
  constructor(private readonly userRepository: UserRepository) {}

  async execute() {
    const users = await this.userRepository.listAll();

    return users.map((user) => presentUser(user));
  }
}
