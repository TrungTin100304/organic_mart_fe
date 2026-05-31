import test from "node:test";
import assert from "node:assert/strict";

import type { Product } from "../src/types/index.ts";
import type { ProductCategory } from "../src/services/categoryService.ts";
import { filterProductsByCategory, getChildCategories, getRootCategories } from "../src/utils/shopCategories.ts";

const categories: ProductCategory[] = [
  { id: 10, name: "Vegetables", slug: "vegetables", parentId: null, sortOrder: 20 },
  { id: 11, name: "Leafy greens", slug: "leafy-greens", parentId: 10, sortOrder: 30 },
  { id: 12, name: "Root vegetables", slug: "root-vegetables", parentId: 10, sortOrder: 10 },
  { id: 20, name: "Fruit", slug: "fruit", parentId: null, sortOrder: 10 },
];

const product = (id: string, categoryId: string | undefined, category: string): Product => ({
  id,
  name: `Product ${id}`,
  slug: `product-${id}`,
  price: 1000,
  image: "/assets/hero.png",
  category,
  categoryId,
  description: "",
  organic: true,
});

test("getRootCategories and getChildCategories keep category trees sorted by backend order", () => {
  assert.deepEqual(getRootCategories(categories).map((category) => category.id), [20, 10]);
  assert.deepEqual(getChildCategories(categories, 10).map((category) => category.id), [12, 11]);
});

test("filterProductsByCategory includes descendants when a parent category is selected", () => {
  const products = [
    product("spinach", "11", "Leafy greens"),
    product("carrot", "12", "Root vegetables"),
    product("apple", "20", "Fruit"),
  ];

  assert.deepEqual(
    filterProductsByCategory(products, categories, "10").map((item) => item.id),
    ["spinach", "carrot"],
  );
});

test("filterProductsByCategory falls back to category names when product categoryId is missing", () => {
  const products = [
    product("legacy-leafy", undefined, "Leafy greens"),
    product("legacy-fruit", undefined, "Fruit"),
  ];

  assert.deepEqual(
    filterProductsByCategory(products, categories, "10").map((item) => item.id),
    ["legacy-leafy"],
  );
});
