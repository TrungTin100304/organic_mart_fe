import { apiRequest, toJsonBody } from "./apiClient";

export interface ResidentialBuilding {
  id: number;
  code: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getAllBuildings = () =>
  apiRequest<ResidentialBuilding[]>("/admin/residential-buildings", { requireAuth: true });

export const createBuilding = (data: Omit<ResidentialBuilding, "id" | "createdAt" | "updatedAt">) =>
  apiRequest<ResidentialBuilding>("/admin/residential-buildings", {
    method: "POST",
    body: toJsonBody(data),
    requireAuth: true,
  });

export const updateBuilding = (id: number, data: Omit<ResidentialBuilding, "id" | "createdAt" | "updatedAt">) =>
  apiRequest<ResidentialBuilding>(`/admin/residential-buildings/${id}`, {
    method: "PUT",
    body: toJsonBody(data),
    requireAuth: true,
  });

export const toggleBuildingStatus = (id: number, isActive: boolean) =>
  apiRequest<ResidentialBuilding>(`/admin/residential-buildings/${id}/status`, {
    method: "PATCH",
    body: toJsonBody({ isActive }),
    requireAuth: true,
  });
