import test from "node:test";
import assert from "node:assert/strict";
import {
  isSepayDemoEnabled,
  completeVietQrOrder,
  type VietQrPayment,
} from "../src/services/paymentService.ts";

// ─── SePay Demo Guard ────────────────────────────────────────────────────────

test("isSepayDemoEnabled returns true only for lowercase 'true'", () => {
  assert.equal(isSepayDemoEnabled("true"), true);
  assert.equal(isSepayDemoEnabled("TRUE"), false, "case-sensitive");
  assert.equal(isSepayDemoEnabled("True"), false);
  assert.equal(isSepayDemoEnabled("false"), false);
  assert.equal(isSepayDemoEnabled(undefined), false);
});

test("SePay demo is disabled when VITE_ENABLE_SEPAY_MOCK is not set", () => {
  assert.equal(isSepayDemoEnabled(undefined), false);
  assert.equal(isSepayDemoEnabled(""), false);
});

test("completeVietQrOrder sends POST /payments/vietqr/:id/complete-order", async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const originalFetch = globalThis.fetch;
  const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const storage = new Map<string, string>([
    ["accessToken", "access-token"],
    ["refreshToken", "refresh-token"],
  ]);

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
  });

  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify({
      status: 200,
      message: "OK",
      data: {
        id: 10,
        orderCode: "OM260706001",
        totalAmount: 220000,
        status: "PENDING",
        details: [],
        statusHistories: [],
      },
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    await completeVietQrOrder(7);
    assert.equal(calls.length, 1, "should make exactly one call");
    const parsed = new URL(calls[0].url);
    assert.equal(parsed.pathname.replace("/api/v1", ""), "/payments/vietqr/7/complete-order");
    assert.equal(calls[0].init.method, "POST");
    const authHeader = (calls[0].init.headers as Record<string, string>)?.Authorization;
    assert.equal(authHeader, "Bearer access-token");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
    } else {
      delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
    }
  }
});

test("completeVietQrOrder is idempotent: returns existing order on second call", async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const originalFetch = globalThis.fetch;
  const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const storage = new Map<string, string>([
    ["accessToken", "access-token"],
    ["refreshToken", "refresh-token"],
  ]);

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
  });

  globalThis.fetch = (async (url: string | URL | Request) => {
    calls.push({ url: String(url), init: {} });
    return new Response(JSON.stringify({
      status: 200,
      message: "OK",
      data: {
        id: 99,
        orderCode: "OM260706002",
        totalAmount: 150000,
        status: "PENDING",
        details: [],
        statusHistories: [],
      },
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const result1 = await completeVietQrOrder(10);
    assert.equal(result1.id, 99);
    assert.equal(result1.orderCode, "OM260706002");
    const result2 = await completeVietQrOrder(10);
    assert.equal(result2.id, 99, "second call should return same order");
    assert.equal(calls.length, 2, "both calls should reach the backend");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
    } else {
      delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
    }
  }
});

test("VietQrPayment interface includes new fields from backend", () => {
  const payment: VietQrPayment = {
    id: 1,
    amount: 220000,
    status: "PAID",
    transferCode: "OMABC123XYZDEF",
    qrUrl: "https://qr.vietqr.io/demo",
    bankId: "MB",
    accountNo: "123456789",
    accountName: "ORGANIC MART",
    expiresAt: "2026-06-07T18:00:00Z",
    paidAt: "2026-06-07T12:30:00Z",
    orderId: 55,
    orderCode: "OM260706001",
  };

  assert.equal(payment.paidAt, "2026-06-07T12:30:00Z");
  assert.equal(payment.orderId, 55);
  assert.equal(payment.orderCode, "OM260706001");
  assert.equal(payment.status, "PAID");
});
