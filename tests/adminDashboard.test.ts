import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { getAdminDashboard } from "../src/services/adminDashboardService.ts";

test("admin dashboard loads real statistics and contains no mock or random data", async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  let requestedUrl = "";
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => "admin-token", setItem: () => {}, removeItem: () => {} },
  });
  globalThis.fetch = (async (url: string | URL | Request) => {
    requestedUrl = String(url);
    return new Response(JSON.stringify({ data: { revenue: [], topProducts: [], categoryRevenue: [], recentOrders: [], orderStatusCounts: {} } }), { status: 200 });
  }) as typeof fetch;

  try {
    await getAdminDashboard(30, "http://api.test/api/v1");
    assert.equal(new URL(requestedUrl).pathname + new URL(requestedUrl).search, "/api/v1/admin/dashboard?days=30");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
    else delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
  }

  const dashboard = await readFile(new URL("../src/admin/pages/Dashboard.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(dashboard, /DASHBOARD_STATS|ADMIN_USERS|Math\.random|loadAdminDataWithFallback/);
  assert.match(dashboard, /getAdminDashboard/);
});
