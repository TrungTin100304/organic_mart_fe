import test from "node:test";
import assert from "node:assert/strict";

import type { Product } from "../src/types/index.ts";
import { getHomeProductSections } from "../src/utils/homeProductSections.ts";

const product = (id: string, createdAt: string, overrides: Partial<Product> = {}): Product => ({
  id,
  name: `Product ${id}`,
  slug: `product-${id}`,
  price: Number(id) * 1000,
  image: `/product-${id}.png`,
  category: "Rau cu",
  description: "",
  organic: true,
  isActive: true,
  createdAt,
  ...overrides,
});

test("getHomeProductSections keeps new arrivals and favorites as separate stable lists", () => {
  const products = [
    product("1", "2026-05-01T00:00:00Z"),
    product("2", "2026-05-02T00:00:00Z"),
    product("3", "2026-05-03T00:00:00Z"),
    product("4", "2026-05-04T00:00:00Z"),
    product("5", "2026-05-05T00:00:00Z"),
    product("6", "2026-05-06T00:00:00Z"),
    product("7", "2026-05-07T00:00:00Z"),
    product("8", "2026-05-08T00:00:00Z"),
  ];

  const firstRender = getHomeProductSections(products, 4);
  const afterNavigationRender = getHomeProductSections([...products], 4);

  assert.deepEqual(
    firstRender.newArrivals.map((item) => item.id),
    ["8", "7", "6", "5"],
  );
  assert.deepEqual(
    firstRender.favoriteProducts.map((item) => item.id),
    ["4", "3", "2", "1"],
  );
  assert.deepEqual(afterNavigationRender, firstRender);
  assert.equal(
    firstRender.newArrivals.some((item) => firstRender.favoriteProducts.includes(item)),
    false,
  );
});

test("getHomeProductSections does not mutate the product array from state", () => {
  const products = [
    product("1", "2026-05-01T00:00:00Z"),
    product("2", "2026-05-02T00:00:00Z"),
    product("3", "2026-05-03T00:00:00Z"),
  ];
  const originalOrder = products.map((item) => item.id);

  getHomeProductSections(products, 2);

  assert.deepEqual(products.map((item) => item.id), originalOrder);
});
