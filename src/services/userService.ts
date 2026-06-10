import type { User } from "../types/user";
import { apiRequest, isAdminRole, normalizeRole } from "./apiClient";

const persistRole = (role: string) => {
  try {
    localStorage.setItem("userRole", normalizeRole(role));
  } catch {
    // ignore
  }
};

export const normalizeUser = (user: User): User => ({
  ...user,
  phone: user.phoneNumber || user.phone,
  role: normalizeRole(user.role),
});

export const getCurrentUser = async (): Promise<User> => {
  const user = await apiRequest<User>("/users/me", { requireAuth: true });
  const normalized = normalizeUser(user);
  if (normalized.role) {
    persistRole(normalized.role);
  }
  return normalized;
};

export const updateCurrentUser = async (data: FormData): Promise<User> => {
  const user = await apiRequest<User>("/users/me", {
    method: "PUT",
    body: data,
    requireAuth: true,
  });
  return normalizeUser(user);
};

export { isAdminRole };
