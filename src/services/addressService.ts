import type { Address } from "../types/user";
import { apiRequest, toJsonBody } from "./apiClient";

export const getAllAddresses = () =>
  apiRequest<Address[]>("/user-addresses", { requireAuth: true });

export const getAddressById = (id: string | number) =>
  apiRequest<Address>(`/user-addresses/${id}`, { requireAuth: true });

export const createAddress = (data: Omit<Address, "id" | "createdAt">) =>
  apiRequest<Address>("/user-addresses", {
    method: "POST",
    body: toJsonBody(data),
    requireAuth: true,
  });

export const updateAddress = (id: string | number, data: Omit<Address, "createdAt">) =>
  apiRequest<Address>(`/user-addresses/${id}`, {
    method: "PUT",
    body: toJsonBody(data),
    requireAuth: true,
  });

export const deleteAddress = (id: string | number) =>
  apiRequest<void>(`/user-addresses/${id}`, {
    method: "DELETE",
    requireAuth: true,
  });
