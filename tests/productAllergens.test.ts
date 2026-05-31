import test from "node:test";
import assert from "node:assert/strict";

import { getAllergenDisplayName, getAllergenKey } from "../src/utils/productAllergens.ts";

test("getAllergenDisplayName renders backend allergen objects as text labels", () => {
  const allergen = { id: 3, name: "Sesame", createdAt: "2026-05-29T00:00:00" };

  assert.equal(getAllergenDisplayName(allergen), "Sesame");
});

test("getAllergenDisplayName still supports legacy string allergens", () => {
  assert.equal(getAllergenDisplayName("Milk"), "Milk");
  assert.equal(getAllergenKey("Milk"), "Milk");
});

