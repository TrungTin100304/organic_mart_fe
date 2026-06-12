import type { User } from "../types/user";
import { apiRequest, toJsonBody } from "./apiClient";
import type { PageResponse } from "./adminOrderService";
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

export const getUsers = async (params: { page?: number; size?: number } = {}) => {
  const pageNumber = params.page ?? 0;
  const pageSize = params.size ?? 20;
  const response = await apiRequest<PageResponse<User> | User[]>(
    `/admin/users?page=${pageNumber}&size=${pageSize}`,
    { requireAuth: true },
  );

  if (Array.isArray(response)) {
    return {
      content: response.map(normalizeUser),
      totalElements: response.length,
      totalPages: response.length ? 1 : 0,
      size: pageSize,
      number: pageNumber,
    } satisfies PageResponse<User>;
  }

  return {
    ...response,
    content: response.content.map(normalizeUser),
  };
};

export const getUserById = async (id: string | number) => {
  const user = await apiRequest<User>(`/users/${id}`, { requireAuth: true });
  return normalizeUser(user);
};

export const createUser = async (payload: CreateUserPayload) => {
  await apiRequest<User>("/admin/users", {
    method: "POST",
    body: toJsonBody(payload),
    requireAuth: true,
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
