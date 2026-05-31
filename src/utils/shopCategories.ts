import type { Product } from "../types";
import type { ProductCategory } from "../services/categoryService";

const categoryId = (id: ProductCategory["id"] | ProductCategory["parentId"] | string | null | undefined) =>
  id === null || id === undefined ? null : String(id);

const bySortOrder = (a: ProductCategory, b: ProductCategory) =>
  (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name);

export const getRootCategories = (categories: ProductCategory[]) =>
  [...categories]
    .filter((category) => category.parentId === null)
    .sort(bySortOrder);

export const getChildCategories = (categories: ProductCategory[], parentId: ProductCategory["id"] | string) => {
  const normalizedParentId = categoryId(parentId);
  return [...categories]
    .filter((category) => categoryId(category.parentId) === normalizedParentId)
    .sort(bySortOrder);
};

export const getCategoryFilterIds = (categories: ProductCategory[], activeCategoryId: string | null) => {
  if (!activeCategoryId) return null;

  const ids = new Set<string>([activeCategoryId]);
  const pending = [activeCategoryId];

  while (pending.length > 0) {
    const parentId = pending.pop();
    if (!parentId) continue;

    getChildCategories(categories, parentId).forEach((child) => {
      const childId = categoryId(child.id);
      if (childId && !ids.has(childId)) {
        ids.add(childId);
        pending.push(childId);
      }
    });
  }

  return ids;
};

export const filterProductsByCategory = (
  products: Product[],
  categories: ProductCategory[],
  activeCategoryId: string | null,
) => {
  const categoryIds = getCategoryFilterIds(categories, activeCategoryId);
  if (!categoryIds) return products;

  const categoryNames = new Set(
    categories
      .filter((category) => categoryIds.has(String(category.id)))
      .map((category) => category.name),
  );

  return products.filter((product) => {
    if (product.categoryId && categoryIds.has(product.categoryId)) return true;
    return categoryNames.has(product.category);
  });
};
