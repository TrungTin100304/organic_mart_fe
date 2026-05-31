import type { ProductCategoryResponse } from "../../services/productService";
import type { InventoryBatch } from "../../services/inventoryBatchService";
import { ADMIN_PRODUCTS, CATEGORIES } from "../mocks/catalog";
import type { AdminProduct } from "../types";

const numericId = (id: string, fallback: number) => {
  const parsed = Number(id.replace(/\D/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getMockProductCategories = (): ProductCategoryResponse[] =>
  CATEGORIES.map((category, index) => ({
    id: index + 1,
    name: category.name,
    slug: category.slug,
    parentId: null,
    sortOrder: index + 1,
  }));

export const getMockAdminProducts = (): AdminProduct[] => {
  const categories = getMockProductCategories();

  return ADMIN_PRODUCTS.map((product) => {
    const category = categories.find((item) => item.name === product.category);
    return {
      ...product,
      categoryId: category ? String(category.id) : product.categoryId,
    };
  });
};

export const getMockInventoryBatches = (): InventoryBatch[] =>
  getMockAdminProducts().map((product, index) => ({
    id: index + 1,
    productId: numericId(product.id, index + 1),
    productName: product.name,
    farmId: (index % 3) + 1,
    farmName: ["Green Valley Farm", "Mekong Fresh Garden", "Sunny Herb Farm"][index % 3],
    batchCode: `MOCK-${String(index + 1).padStart(3, "0")}`,
    quantityInitial: Math.max(product.stock + 20, product.stock),
    quantityRemaining: product.stock,
    importDate: product.updatedAt || "2025-05-01",
    expiryDate: "2026-12-31",
    expired: false,
  }));
