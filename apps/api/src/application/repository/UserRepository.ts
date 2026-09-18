import type User from "../../domain/user/User.js";

export default interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  listAll(): Promise<User[]>;
  emailExists(email: string): Promise<boolean>;
  save(user: User): Promise<void>;
  createWithCharacter(user: User): Promise<void>;
}
