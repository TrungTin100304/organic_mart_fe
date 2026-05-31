import type { User } from "../types/user";
import { apiRequest, normalizeRole } from "./apiClient";

export const normalizeUser = (user: User): User => ({
  ...user,
  phone: user.phoneNumber || user.phone,
  role: normalizeRole(user.role),
});

export const getCurrentUser = async (): Promise<User> => {
  const user = await apiRequest<User>("/users/me", { requireAuth: true });
  return normalizeUser(user);
};

export const updateCurrentUser = async (data: FormData): Promise<User> => {
  const user = await apiRequest<User>("/users/me", {
    method: "PUT",
    body: data,
    requireAuth: true,
  });
  return normalizeUser(user);
};
