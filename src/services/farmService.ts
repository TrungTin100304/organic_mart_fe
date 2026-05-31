import { apiRequest, toJsonBody } from "./apiClient";

export interface Farm {
  id: number;
  name: string;
  certification?: string;
  location?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt?: string;
}

export type FarmRequest = Omit<Farm, "id" | "createdAt">;

export const getFarms = () => apiRequest<Farm[]>("/farms");

export const getFarmById = (id: string | number) => apiRequest<Farm>(`/farms/${id}`, { requireAuth: true });

export const createFarm = (data: FarmRequest) =>
  apiRequest<Farm>("/farms", {
    method: "POST",
    body: toJsonBody(data),
    requireAuth: true,
  });

export const updateFarm = (id: string | number, data: FarmRequest) =>
  apiRequest<Farm>(`/farms/${id}`, {
    method: "PUT",
    body: toJsonBody(data),
    requireAuth: true,
  });

export const deleteFarm = (id: string | number) =>
  apiRequest<void>(`/farms/${id}`, {
    method: "DELETE",
    requireAuth: true,
  });
