import type { User } from "../types/user";
import type { AuthResponse } from "../types/auth";
import { apiRequest, toJsonBody } from "./apiClient";
import { normalizeUser } from "./userService";

const ADMIN_PROTECTED_ROLES = new Set(["ROLE_ADMIN", "ADMIN"]);

export const isAdminUser = (user: Pick<User, "role"> & Record<string, unknown>) => {
  const raw = (user as { role?: string | null }).role;
  const normalized = String(raw || "").trim().toUpperCase();
  return ADMIN_PROTECTED_ROLES.has(normalized);
};

export interface CreateUserPayload {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role?: "ROLE_USER";
}

export interface UpdateUserPayload {
  fullName?: string;
  phoneNumber?: string;
}

export const getUsers = async () => {
  const users = await apiRequest<User[]>("/users", { requireAuth: true });
  return users.map(normalizeUser);
};

export const getUserById = async (id: string | number) => {
  const user = await apiRequest<User>(`/users/${id}`, { requireAuth: true });
  return normalizeUser(user);
};

export const createUser = async (payload: CreateUserPayload) => {
  await apiRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: toJsonBody({
      fullName: payload.fullName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      password: payload.password,
    }),
  });
};

export const updateUser = async (id: string | number, payload: UpdateUserPayload) => {
  const formData = new FormData();
  formData.append("fullName", payload.fullName?.trim() || "");
  formData.append("phoneNumber", payload.phoneNumber?.trim() || "");

  const user = await apiRequest<User>(`/users/${id}`, {
    method: "PUT",
    body: formData,
    requireAuth: true,
  });
  return normalizeUser(user);
};

export const updateUserStatus = async (id: string | number, isActive: boolean) => {
  const user = await apiRequest<User>(`/users/${id}/status`, {
    method: "PATCH",
    body: toJsonBody({ isActive }),
    requireAuth: true,
  });
  return normalizeUser(user);
};

export const deleteUser = (id: string | number) =>
  apiRequest<void>(`/users/${id}`, {
    method: "DELETE",
    requireAuth: true,
  });
