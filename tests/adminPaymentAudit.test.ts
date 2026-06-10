import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { getPaymentAudit, getWebhookAudit } from "../src/services/adminPaymentAuditService.ts";

const API_BASE_URL = "http://api.test/api/v1";

const capture = async (call: () => Promise<unknown>) => {
  const originalFetch = globalThis.fetch;
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  let requestUrl = "";
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => "admin-token", setItem: () => {}, removeItem: () => {} },
  });
  globalThis.fetch = (async (url: string | URL | Request) => {
    requestUrl = String(url);
    return new Response(JSON.stringify({ data: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 } }), { status: 200 });
  }) as typeof fetch;
  try {
    await call();
    return new URL(requestUrl).pathname + new URL(requestUrl).search;
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
    else delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
  }
};

test("payment audit service calls read-only admin endpoints", async () => {
  assert.equal(
    await capture(() => getPaymentAudit({ status: "PENDING", search: "OM123", page: 1 }, API_BASE_URL)),
    "/api/v1/admin/payment-audit/payments?status=PENDING&search=OM123&page=1",
  );
  assert.equal(
    await capture(() => getWebhookAudit({ status: "REJECTED", page: 0 }, API_BASE_URL)),
    "/api/v1/admin/payment-audit/webhooks?status=REJECTED&page=0",
  );
});

test("admin routes expose the payment audit page", async () => {
  const routes = await readFile(new URL("../src/admin/config/routes.tsx", import.meta.url), "utf8");
  assert.match(routes, /payment-audit/);
  assert.match(routes, /PaymentAudit/);
});
