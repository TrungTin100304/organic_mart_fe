import { apiRequest, toJsonBody } from "./apiClient";
import type { ProductCategoryResponse } from "./productService";

export type ProductCategory = ProductCategoryResponse;

export const getProductCategories = () =>
  apiRequest<ProductCategory[]>("/product-categories");

export const createProductCategory = (data: { name: string; parentId?: number | null; sortOrder?: number }) =>
  apiRequest<ProductCategory>("/product-categories", {
    method: "POST",
    body: toJsonBody({
      name: data.name,
      parentId: data.parentId ?? null,
      sortOrder: data.sortOrder ?? 0,
    }),
    requireAuth: true,
  });
