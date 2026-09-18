import InvalidValueError from "../exception/InvalidValueError.js";
import Uuid from "../shared/Uuid.js";
import type { UserRole } from "./UserRole.js";
import { parseUserRole } from "./UserRole.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_DISPLAY_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;

export type CreateUserProps = {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
};

export type RebuildUserProps = {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: UserRole;
  characterId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateUserProps = {
  displayName?: string;
  role?: UserRole;
  password?: string;
};

export default class User {
  private constructor(
    private readonly id: Uuid,
    private email: string,
    private passwordHash: string,
    private displayName: string,
    private role: UserRole,
    private readonly characterId: Uuid,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(props: CreateUserProps, passwordHash: string, characterId: string): User {
    const now = new Date();

    return new User(
      Uuid.create(),
      User.requireEmail(props.email),
      passwordHash,
      User.requireDisplayName(props.displayName),
      parseUserRole(props.role),
      Uuid.from(characterId),
      now,
      now,
    );
  }

  static rebuild(props: RebuildUserProps): User {
    return new User(
      Uuid.from(props.id),
      props.email,
      props.passwordHash,
      props.displayName,
      parseUserRole(props.role),
      Uuid.from(props.characterId),
      props.createdAt,
      props.updatedAt,
    );
  }

  getId(): Uuid {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  getDisplayName(): string {
    return this.displayName;
  }

  getRole(): UserRole {
    return this.role;
  }

  getCharacterId(): Uuid {
    return this.characterId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  updateProfile(props: UpdateUserProps, passwordHash?: string): void {
    if (props.displayName !== undefined) {
      this.displayName = User.requireDisplayName(props.displayName);
    }

    if (props.role !== undefined) {
      this.role = parseUserRole(props.role);
    }

    if (passwordHash !== undefined) {
      this.passwordHash = passwordHash;
    }

    this.updatedAt = new Date();
  }

  static requirePassword(password: string): string {
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      throw new InvalidValueError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }

    return password;
  }

  private static requireEmail(email: string): string {
    const normalized = email.trim().toLowerCase();

    if (!normalized || normalized.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(normalized)) {
      throw new InvalidValueError("Invalid email address");
    }

    return normalized;
  }

  private static requireDisplayName(displayName: string): string {
    const trimmed = displayName.trim();

    if (!trimmed || trimmed.length > MAX_DISPLAY_NAME_LENGTH) {
      throw new InvalidValueError("Display name is required");
    }

    return trimmed;
  }
}
