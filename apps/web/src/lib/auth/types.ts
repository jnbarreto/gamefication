export type UserRole = "ADMIN" | "PLAYER";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  characterId: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type UsersListResponse = {
  users: AuthUser[];
};
