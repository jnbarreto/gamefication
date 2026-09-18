import type User from "../../domain/user/User.js";

export type UserView = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  characterId: string;
};

export type LoginView = {
  token: string;
  user: UserView;
};

export function presentUser(user: User): UserView {
  return {
    id: user.getId().toString(),
    email: user.getEmail(),
    displayName: user.getDisplayName(),
    role: user.getRole(),
    characterId: user.getCharacterId().toString(),
  };
}

export function presentLogin(token: string, user: User): LoginView {
  return {
    token,
    user: presentUser(user),
  };
}
