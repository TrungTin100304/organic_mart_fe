import { apiRequest } from './apiClient';

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

export const getActiveBuildings = () =>
  apiRequest<ResidentialBuilding[]>('/residential-buildings/active', { requireAuth: false });
