import type { Allergen } from "../types/user";
import type { Product } from "../types";
import { apiRequest, toJsonBody } from "./apiClient";

export interface ProductCategoryResponse {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  sortOrder: number;
  createdAt?: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  storageInstructions?: string | null;
  detailedDescription?: string | null;
  price: number;
  unit?: string | null;
  nutritionPer100g?: Record<string, unknown> | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  category?: ProductCategoryResponse | null;
  allergens?: Allergen[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
}

export interface ProductFormValues {
  name: string;
  categoryId: string | number;
  description?: string;
  storageInstructions?: string;
  detailedDescription?: string;
  price: string | number;
  unit?: string;
  isActive: boolean;
  imageFile?: File | null;
  allergenIds?: Array<string | number>;
}

const fallbackImage = "/assets/hero.png";

export const mapProductResponseToProduct = (product: ProductResponse): Product => ({
  id: String(product.id),
  name: product.name,
  slug: product.slug,
  price: Number(product.price || 0),
  image: product.imageUrl || fallbackImage,
  imageUrl: product.imageUrl || undefined,
  category: product.category?.name || "Uncategorized",
  categoryId: product.category?.id ? String(product.category.id) : undefined,
  description: product.description || "",
  storageInstructions: product.storageInstructions || undefined,
  detailedDescription: product.detailedDescription || undefined,
  unit: product.unit || "kg",
  nutritionPer100g: product.nutritionPer100g || undefined,
  organic: true,
  isActive: product.isActive,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
  allergens: product.allergens || [],
});

const mapProductPage = (page: PageResponse<ProductResponse>): PageResponse<Product> => ({
  ...page,
  content: page.content.map(mapProductResponseToProduct),
});

const productFormData = (values: ProductFormValues) => {
  const formData = new FormData();
  formData.append("name", values.name.trim());
  formData.append("categoryId", String(values.categoryId));
  formData.append("description", values.description?.trim() || "");
  formData.append("storageInstructions", values.storageInstructions?.trim() || "");
  formData.append("detailedDescription", values.detailedDescription?.trim() || "");
  formData.append("price", String(values.price || 0));
  formData.append("unit", values.unit?.trim() || "kg");
  formData.append("isActive", String(values.isActive));
  formData.append("active", String(values.isActive));
  values.allergenIds?.forEach((id) => formData.append("allergenIds", String(id)));
  if (values.imageFile) {
    formData.append("imageFile", values.imageFile);
  }
  return formData;
};

export const getProducts = async (params: { page?: number; size?: number } = {}) => {
  const search = new URLSearchParams({
    page: String(params.page ?? 0),
    size: String(params.size ?? 100),
  });
  const page = await apiRequest<PageResponse<ProductResponse>>(`/products?${search.toString()}`);
  return mapProductPage(page);
};

export const getProductById = async (id: string | number) => {
  const product = await apiRequest<ProductResponse>(`/products/${id}`);
  return mapProductResponseToProduct(product);
};

export const getProductTraceability = (id: string | number) =>
  apiRequest(`/products/${id}/traceability`);

export const createProduct = async (values: ProductFormValues) => {
  const product = await apiRequest<ProductResponse>("/products", {
    method: "POST",
    body: productFormData(values),
    requireAuth: true,
  });
  return mapProductResponseToProduct(product);
};

export const updateProduct = async (id: string | number, values: ProductFormValues) => {
  const product = await apiRequest<ProductResponse>(`/products/${id}`, {
    method: "PUT",
    body: productFormData(values),
    requireAuth: true,
  });
  return mapProductResponseToProduct(product);
};

export const deleteProduct = (id: string | number) =>
  apiRequest<void>(`/products/${id}`, {
    method: "DELETE",
    requireAuth: true,
  });

export const createProductCategory = (name: string) =>
  apiRequest<ProductCategoryResponse>("/product-categories", {
    method: "POST",
    body: toJsonBody({ name, sortOrder: 0 }),
    requireAuth: true,
  });
