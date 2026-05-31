import { apiRequest, toJsonBody } from "./apiClient";

export interface InventoryBatch {
  id: number;
  productId: number;
  productName: string;
  farmId: number;
  farmName: string;
  batchCode: string;
  quantityInitial: number;
  quantityRemaining: number;
  importDate: string;
  expiryDate: string;
  costPrice?: number;
  expired: boolean;
  createdAt?: string;
}

export interface InventoryBatchRequest {
  productId: number;
  farmId: number;
  batchCode: string;
  quantityInitial: number;
  quantityRemaining: number;
  importDate: string;
  expiryDate: string;
  costPrice?: number;
}

export interface ProductTraceability {
  productId: number;
  productName: string;
  productSlug: string;
  categoryName: string;
  totalQuantityInitial: number;
  totalQuantityRemaining: number;
  batches: InventoryBatch[];
}

export const getInventoryBatches = () =>
  apiRequest<InventoryBatch[]>("/inventory-batches", { requireAuth: true });

export const getInventoryBatchById = (id: string | number) =>
  apiRequest<InventoryBatch>(`/inventory-batches/${id}`, { requireAuth: true });

export const getInventoryBatchesByProductId = (productId: string | number) =>
  apiRequest<InventoryBatch[]>(`/inventory-batches/product/${productId}`, { requireAuth: true });

export const getProductTraceability = (productId: string | number) =>
  apiRequest<ProductTraceability>(`/inventory-batches/product/${productId}/traceability`, { requireAuth: true });

export const createInventoryBatch = (data: InventoryBatchRequest) =>
  apiRequest<InventoryBatch>("/inventory-batches", {
    method: "POST",
    body: toJsonBody(data),
    requireAuth: true,
  });

export const updateInventoryBatch = (id: string | number, data: InventoryBatchRequest) =>
  apiRequest<InventoryBatch>(`/inventory-batches/${id}`, {
    method: "PUT",
    body: toJsonBody(data),
    requireAuth: true,
  });

export const deleteInventoryBatch = (id: string | number) =>
  apiRequest<void>(`/inventory-batches/${id}`, {
    method: "DELETE",
    requireAuth: true,
  });
