import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { AuthUser, LoginResponse, UsersListResponse } from "./types";

export function loginRequest(email: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>("/auth/login", { email, password });
}

export function registerRequest(input: {
  email: string;
  password: string;
  displayName: string;
}): Promise<LoginResponse> {
  return apiPost<LoginResponse>("/auth/register", input);
}

export function forgotPasswordRequest(email: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>("/auth/forgot-password", { email });
}

export function resetPasswordRequest(
  token: string,
  password: string,
): Promise<{ message: string }> {
  return apiPost<{ message: string }>("/auth/reset-password", { token, password });
}

export function fetchCurrentUser(): Promise<AuthUser> {
  return apiGet<AuthUser>("/auth/me");
}

export function fetchUsers(): Promise<UsersListResponse> {
  return apiGet<UsersListResponse>("/users");
}

export function createUserRequest(input: {
  email: string;
  password: string;
  displayName: string;
  role: "ADMIN" | "PLAYER";
}): Promise<AuthUser> {
  return apiPost<AuthUser>("/users", input);
}

export function updateUserRequest(
  userId: string,
  input: Partial<{
    displayName: string;
    role: "ADMIN" | "PLAYER";
    password: string;
  }>,
): Promise<AuthUser> {
  return apiPatch<AuthUser>(`/users/${userId}`, input);
}
