import { apiRequest } from "./apiClient";

export interface ShippingProvider {
  id: number;
  name: string;
  isActive: boolean;
  createdAt?: string;
}

export const getActiveShippingProviders = () =>
  apiRequest<ShippingProvider[]>("/shipping-providers/active", { requireAuth: false });
