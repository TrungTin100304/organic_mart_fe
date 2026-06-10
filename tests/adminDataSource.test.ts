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

test("loadAdminDataWithFallback propagates API errors when admin mocks are disabled", async () => {
  await assert.rejects(
    () =>
      loadAdminDataWithFallback(
        () => Promise.reject(new Error("Network down")),
        () => ["mock-product"],
      ),
    /Network down/,
  );
});

test("loadAdminDataWithFallback returns mock data only when explicitly enabled", async () => {
  const result = await loadAdminDataWithFallback(
    () => Promise.reject(new Error("Network down")),
    () => ["mock-product"],
    true,
  );

  assert.deepEqual(result.data, ["mock-product"]);
  assert.equal(result.source, "mock");
  assert.equal(result.error, "Network down");
});
