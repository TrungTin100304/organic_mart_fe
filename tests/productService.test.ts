import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";

import { mapProductResponseToProduct } from "../src/services/productService.ts";

test("mapProductResponseToProduct adapts backend product shape for storefront cards", () => {
  const product = mapProductResponseToProduct({
    id: 12,
    name: "Organic Kale",
    slug: "organic-kale",
    description: "Fresh kale",
    storageInstructions: "Keep chilled",
    detailedDescription: "Detailed",
    price: 36000,
    unit: "300gr",
    nutritionPer100g: { calories: 35 },
    imageUrl: "https://img.test/kale.jpg",
    isActive: true,
    createdAt: "2026-05-29T00:00:00",
    updatedAt: "2026-05-29T00:00:00",
    category: {
      id: 2,
      name: "Vegetables",
      slug: "vegetables",
      parentId: null,
      sortOrder: 1,
      createdAt: "2026-05-29T00:00:00",
    },
    allergens: [{ id: 3, name: "Sesame", createdAt: "2026-05-29T00:00:00" }],
  });

  assert.equal(product.id, "12");
  assert.equal(product.category, "Vegetables");
  assert.equal(product.image, "https://img.test/kale.jpg");
  assert.equal(product.unit, "300gr");
  assert.equal(product.organic, true);
  assert.equal(product.allergens?.[0].name, "Sesame");
});

test("mapProductResponseToProduct uses a public fallback image when imageUrl is missing", () => {
  const product = mapProductResponseToProduct({
    id: 13,
    name: "Organic Apple",
    slug: "organic-apple",
    price: 42000,
    isActive: true,
  });

  assert.equal(product.image, "/assets/hero.png");
  assert.equal(existsSync(new URL("../public/assets/hero.png", import.meta.url)), true);
});
