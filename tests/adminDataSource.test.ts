import test from "node:test";
import assert from "node:assert/strict";

import { loadAdminDataWithFallback } from "../src/admin/utils/dataSource.ts";

test("loadAdminDataWithFallback returns API data when the request succeeds", async () => {
  const result = await loadAdminDataWithFallback(
    () => Promise.resolve(["api-product"]),
    ["mock-product"],
  );

  assert.deepEqual(result.data, ["api-product"]);
  assert.equal(result.source, "api");
  assert.equal(result.error, undefined);
});

test("loadAdminDataWithFallback returns mock data when the request fails", async () => {
  const result = await loadAdminDataWithFallback(
    () => Promise.reject(new Error("Network down")),
    () => ["mock-product"],
  );

  assert.deepEqual(result.data, ["mock-product"]);
  assert.equal(result.source, "mock");
  assert.equal(result.error, "Network down");
});
