import type { Allergen } from "../types/user";
import { apiRequest, toJsonBody } from "./apiClient";

export const getAllAllergens = () =>
  apiRequest<Allergen[]>("/allergens", { requireAuth: true });

export const createAllergen = (name: string) =>
  apiRequest<Allergen>("/allergens", {
    method: "POST",
    body: toJsonBody({ name }),
    requireAuth: true,
  });

export const updateAllergen = (id: string | number, name: string) =>
  apiRequest<Allergen>(`/allergens/${id}`, {
    method: "PUT",
    body: toJsonBody({ name }),
    requireAuth: true,
  });

export const deleteAllergen = (id: string | number) =>
  apiRequest<void>(`/allergens/${id}`, {
    method: "DELETE",
    requireAuth: true,
  });
