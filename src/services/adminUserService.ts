import type { User } from "../types/user";
import { apiRequest } from "./apiClient";
import { normalizeUser } from "./userService";

export const getUsers = async () => {
  const users = await apiRequest<User[]>("/users", { requireAuth: true });
  return users.map(normalizeUser);
};

export const getUserById = async (id: string | number) => {
  const user = await apiRequest<User>(`/users/${id}`, { requireAuth: true });
  return normalizeUser(user);
};

export const deleteUser = (id: string | number) =>
  apiRequest<void>(`/users/${id}`, {
    method: "DELETE",
    requireAuth: true,
  });
