import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("shop renders a paginated slice and resets to page one when filters change", async () => {
  const page = await readFile(new URL("../src/pages/Shop.tsx", import.meta.url), "utf8");

  assert.match(page, /SHOP_PAGE_SIZE/);
  assert.match(page, /paginatedProducts/);
  assert.match(page, /filteredProducts\.length\s*\/\s*SHOP_PAGE_SIZE/);
  assert.match(page, /setCurrentPage\(1\)/);
  assert.match(page, /paginatedProducts\.map/);
});

test("user order history uses totalPages returned by the backend", async () => {
  const page = await readFile(new URL("../src/pages/UserInfo.tsx", import.meta.url), "utf8");

  assert.match(page, /setOrderTotalPages\(page\.totalPages\)/);
  assert.match(page, /currentPage >= orderTotalPages/);
  assert.doesNotMatch(page, /Math\.ceil\(orders\.length\s*\/\s*ORDERS_PER_PAGE\)/);
});
