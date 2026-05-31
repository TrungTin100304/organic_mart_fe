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
