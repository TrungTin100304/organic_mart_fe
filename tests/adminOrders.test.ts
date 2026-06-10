import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  getAdminOrderById,
  getAdminOrders,
  updateAdminOrderStatus,
} from "../src/services/adminOrderService.ts";

const API_BASE_URL = "http://api.test/api/v1";

const withMockApi = async (call: () => Promise<unknown>, data: unknown) => {
  const requests: Array<{ url: string; init: RequestInit }> = [];
  const originalFetch = globalThis.fetch;
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => "admin-token", setItem: () => {}, removeItem: () => {} },
  });
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    await call();
    return requests[0];
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
    else delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
  }
};

test("admin order service uses authenticated order endpoints", async () => {
  const listRequest = await withMockApi(
    () => getAdminOrders({ page: 2, size: 20, status: "PENDING" }, API_BASE_URL),
    { content: [], totalElements: 0, totalPages: 0, number: 2, size: 20 },
  );
  assert.equal(new URL(listRequest.url).pathname + new URL(listRequest.url).search, "/api/v1/orders?page=2&size=20&status=PENDING");

  const detailRequest = await withMockApi(() => getAdminOrderById(7, API_BASE_URL), { id: 7 });
  assert.equal(new URL(detailRequest.url).pathname, "/api/v1/orders/7");

  const updateRequest = await withMockApi(
    () => updateAdminOrderStatus(7, "CONFIRMED", "Admin confirmed", API_BASE_URL),
    { id: 7 },
  );
  assert.equal(new URL(updateRequest.url).pathname, "/api/v1/orders/7/status");
  assert.equal(updateRequest.init.method, "PATCH");
  assert.deepEqual(JSON.parse(String(updateRequest.init.body)), {
    status: "CONFIRMED",
    note: "Admin confirmed",
  });
});

test("admin orders and sidebar do not use hard-coded order data or badges", async () => {
  const ordersPage = await readFile(new URL("../src/admin/pages/Orders.tsx", import.meta.url), "utf8");
  const routes = await readFile(new URL("../src/admin/config/routes.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(ordersPage, /ADMIN_ORDERS/);
  assert.match(ordersPage, /getAdminOrders/);
  assert.doesNotMatch(routes, /badge:\s*\d+/);
});
