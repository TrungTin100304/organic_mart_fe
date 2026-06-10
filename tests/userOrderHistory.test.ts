import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { getMyOrders } from "../src/services/orderService.ts";

test("user order history uses the authenticated /orders/me endpoint", async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  let requestedUrl = "";

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => "user-token", setItem: () => {}, removeItem: () => {} },
  });
  globalThis.fetch = (async (url: string | URL | Request) => {
    requestedUrl = String(url);
    return new Response(JSON.stringify({
      data: { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 },
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;

  try {
    await getMyOrders({ page: 0, size: 10 }, "http://api.test/api/v1");
    assert.equal(new URL(requestedUrl).pathname + new URL(requestedUrl).search, "/api/v1/orders/me?page=0&size=10");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
    else delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
  }
});

test("UserInfo loads real order history instead of reading recentOrders from profile", async () => {
  const page = await readFile(new URL("../src/pages/UserInfo.tsx", import.meta.url), "utf8");

  assert.match(page, /getMyOrders/);
  assert.doesNotMatch(page, /user\.recentOrders/);
});
