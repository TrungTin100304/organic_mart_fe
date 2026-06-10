import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createPromotion, deactivatePromotion, getPromotions, updatePromotion } from "../src/services/adminPromotionService.ts";

const payload = {
  code: "WELCOME10",
  name: "Welcome",
  description: "",
  type: "PERCENTAGE" as const,
  value: 10,
  minOrderAmount: 0,
  maxDiscountAmount: 50000,
  validFrom: "2026-06-01",
  validTo: "2026-06-30",
  usageLimit: 100,
  usageLimitPerUser: 1,
  active: true,
};

test("admin promotion service uses protected CRUD endpoints", async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const originalFetch = globalThis.fetch;
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: () => "admin-token", setItem: () => {}, removeItem: () => {} } });
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify({ data: [] }), { status: 200 });
  }) as typeof fetch;
  try {
    await getPromotions("http://api.test/api/v1");
    await createPromotion(payload, "http://api.test/api/v1");
    await updatePromotion(2, payload, "http://api.test/api/v1");
    await deactivatePromotion(2, "http://api.test/api/v1");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
    else delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
  }
  assert.deepEqual(calls.map((call) => [new URL(call.url).pathname, call.init.method ?? "GET"]), [
    ["/api/v1/admin/promotions", "GET"],
    ["/api/v1/admin/promotions", "POST"],
    ["/api/v1/admin/promotions/2", "PUT"],
    ["/api/v1/admin/promotions/2", "DELETE"],
  ]);
});

test("admin promotions page no longer imports mock promotions", async () => {
  const page = await readFile(new URL("../src/admin/pages/Promotions.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, /PROMOTIONS|from "\.\.\/mocks"/);
  assert.match(page, /getPromotions/);
});
