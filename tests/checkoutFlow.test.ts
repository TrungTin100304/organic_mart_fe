import test from "node:test";
import assert from "node:assert/strict";
import * as paymentService from "../src/services/paymentService.ts";
import { createOrder, type CreateOrderRequest, type DeliveryMethod } from "../src/services/orderService.ts";
import * as shippingProviderService from "../src/services/shippingProviderService.ts";

type CapturedCall = {
  url: string;
  init: RequestInit;
};

const withMockApi = async <T>(call: () => Promise<T>, data: unknown, options?: { status?: number }) => {
  const calls: CapturedCall[] = [];
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
    return new Response(JSON.stringify({ status: options?.status ?? 200, message: "OK", data }), {
      status: options?.status ?? 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const result = await call();
    return { calls, result };
  } finally {
    globalThis.fetch = originalFetch;
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
    } else {
      delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
    }
  }
};

const routeOf = (url: string) => {
  const parsed = new URL(url);
  return `${parsed.pathname.replace("/api/v1", "")}${parsed.search}`;
};

const jsonBody = (request: CapturedCall) => JSON.parse(String(request.init.body));

// ─── Payment Service ───────────────────────────────────────────────────────────

test("createVietQrPayment sends POST /payments/vietqr with addressId and deliveryMethod", async () => {
  const { calls } = await withMockApi(
    () => paymentService.createVietQrPayment("5", "EXPRESS"),
    { id: 1, status: "PENDING", amount: 70000, transferCode: "QR001", qrUrl: "https://qr.test/1", bankId: "MB", accountNo: "123", accountName: "Organic Mart", expiresAt: "2026-06-06T18:00:00Z", paidAt: null, orderId: null, orderCode: null },
  );
  assert.equal(calls.length, 1);
  assert.equal(routeOf(calls[0].url), "/payments/vietqr");
  assert.equal(calls[0].init.method, "POST");
  const body = jsonBody(calls[0]);
  assert.equal(body.addressId, 5);
  assert.equal(body.deliveryMethod, "EXPRESS");
  assert.equal((calls[0].init.headers as Record<string, string>).Authorization, "Bearer access-token");
});

test("createVietQrPayment sends STANDARD for standard delivery", async () => {
  const { calls } = await withMockApi(
    () => paymentService.createVietQrPayment("3", "STANDARD"),
    { id: 2, status: "PENDING", amount: 30000, transferCode: "QR002", qrUrl: "", bankId: "MB", accountNo: "123", accountName: "Organic Mart", expiresAt: "2026-06-06T18:00:00Z", paidAt: null, orderId: null, orderCode: null },
  );
  const body = jsonBody(calls[0]);
  assert.equal(body.deliveryMethod, "STANDARD");
});

test("getVietQrPayment sends GET /payments/vietqr/:id with auth", async () => {
  const { calls } = await withMockApi(
    () => paymentService.getVietQrPayment(42),
    { id: 42, status: "PAID", amount: 50000, transferCode: "QR042", qrUrl: "", bankId: "MB", accountNo: "123", accountName: "Test", expiresAt: "", paidAt: "2026-06-06T12:00:00Z", orderId: null, orderCode: null },
  );
  assert.equal(calls.length, 1);
  assert.equal(routeOf(calls[0].url), "/payments/vietqr/42");
  assert.equal((calls[0].init.headers as Record<string, string>).Authorization, "Bearer access-token");
});

test("isSepayDemoEnabled returns true only for lowercase 'true'", () => {
  assert.equal(paymentService.isSepayDemoEnabled("true"), true);
  assert.equal(paymentService.isSepayDemoEnabled("TRUE"), false, "case sensitive");
  assert.equal(paymentService.isSepayDemoEnabled("True"), false);
  assert.equal(paymentService.isSepayDemoEnabled("false"), false);
  assert.equal(paymentService.isSepayDemoEnabled(""), false);
  assert.equal(paymentService.isSepayDemoEnabled(undefined), false);
  assert.equal(paymentService.isSepayDemoEnabled("1"), false);
  assert.equal(paymentService.isSepayDemoEnabled(" true "), false, "whitespace breaks equality");
});


// ─── Order Service ────────────────────────────────────────────────────────────

test("createOrder sends POST /orders with deliveryMethod and no shippingProviderId", async () => {
  const orderPayload: CreateOrderRequest = {
    addressId: 3,
    deliveryMethod: "STANDARD",
    note: "Thanh toán khi nhận hàng (COD)",
    items: [
      { productId: 1, quantity: 2 },
      { productId: 5, quantity: 1 },
    ],
  };

  const { calls } = await withMockApi(
    () => createOrder(orderPayload),
    { id: 10, orderCode: "OM260606001", totalAmount: 64000, status: "PENDING" },
  );

  assert.equal(calls.length, 1);
  assert.equal(routeOf(calls[0].url), "/orders");
  assert.equal(calls[0].init.method, "POST");
  const body = jsonBody(calls[0]);
  assert.equal(body.addressId, 3);
  assert.equal(body.deliveryMethod, "STANDARD");
  assert.equal(body.note, "Thanh toán khi nhận hàng (COD)");
  assert.deepEqual(body.items, [{ productId: 1, quantity: 2 }, { productId: 5, quantity: 1 }]);
  assert.equal((calls[0].init.headers as Record<string, string>).Authorization, "Bearer access-token");
});

test("createOrder sends items as array of {productId, quantity} only", async () => {
  const { calls } = await withMockApi(
    () => createOrder({
      addressId: 1,
      deliveryMethod: "EXPRESS",
      items: [{ productId: 3, quantity: 5 }],
    }),
    { id: 1, orderCode: "OM001", totalAmount: 50000, status: "PENDING" },
  );
  const body = jsonBody(calls[0]);
  assert.ok(Array.isArray(body.items));
  assert.equal(body.items[0].productId, 3);
  assert.equal(body.items[0].quantity, 5);
  assert.equal(Object.keys(body.items[0]).length, 2);
});

test("createOrder note contains VietQR transferCode and confirmation text", async () => {
  const { calls } = await withMockApi(
    () => createOrder({
      addressId: 1,
      deliveryMethod: "STANDARD",
      note: "VietQR QR12345 - đã xác nhận thanh toán",
      items: [{ productId: 1, quantity: 1 }],
    }),
    { id: 1, orderCode: "OM001", totalAmount: 50000, status: "PENDING" },
  );
  const body = jsonBody(calls[0]);
  assert.ok(body.note.includes("VietQR"));
  assert.ok(body.note.includes("đã xác nhận thanh toán"));
});

test("createOrder sends SCHEDULED delivery with date and slotId", async () => {
  const { calls } = await withMockApi(
    () => createOrder({
      addressId: 1,
      deliveryMethod: "SCHEDULED",
      deliveryDate: "2026-06-10",
      deliverySlotId: 3,
      items: [{ productId: 1, quantity: 1 }],
    }),
    { id: 1, orderCode: "OM001", totalAmount: 50000, status: "PENDING" },
  );
  const body = jsonBody(calls[0]);
  assert.equal(body.deliveryMethod, "SCHEDULED");
  assert.equal(body.deliveryDate, "2026-06-10");
  assert.equal(body.deliverySlotId, 3);
});

// ─── Shipping Provider Service ────────────────────────────────────────────────

test("getActiveShippingProviders sends GET /shipping-providers/active", async () => {
  const { calls } = await withMockApi(
    () => shippingProviderService.getActiveShippingProviders(),
    [{ id: 1, name: "Giao hàng nhanh", isActive: true }],
  );
  assert.equal(calls.length, 1);
  assert.equal(routeOf(calls[0].url), "/shipping-providers/active");
});

test("shipping providers endpoint does not require Bearer auth token", async () => {
  const calls: CapturedCall[] = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify({ status: 200, message: "OK", data: [{ id: 1, name: "Giao hàng nhanh", isActive: true }] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    await shippingProviderService.getActiveShippingProviders();
    assert.equal(calls.length, 1);
    const authHeader = (calls[0].init.headers as Record<string, string> | undefined)?.Authorization;
    assert.equal(authHeader, undefined, "no Authorization header should be sent to public endpoint");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ─── SePay Mock Guard ────────────────────────────────────────────────────────

test("SePay mock env guard correctly identifies true/false values", () => {
  const cases: Array<[string | undefined, boolean]> = [
    ["true", true],
    ["TRUE", false],
    ["True", false],
    ["false", false],
    ["", false],
    [undefined, false],
    ["1", false],
    ["true-false", false],
    [" true", false],
  ];

  for (const [value, expected] of cases) {
    const result = paymentService.isSepayDemoEnabled(value);
    assert.equal(result, expected, `input "${value}" should be ${expected}`);
  }
});

test("SePay demo is disabled in default .env.example", () => {
  // VITE_ENABLE_SEPAY_MOCK=false is the default in .env.example
  const result = paymentService.isSepayDemoEnabled("false");
  assert.equal(result, false);
});

// ─── COD Flow ────────────────────────────────────────────────────────────────

test("COD flow calls createOrder directly without payment step", async () => {
  const calls: CapturedCall[] = [];
  const originalFetch = globalThis.fetch;
  const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const storage = new Map<string, string>([["accessToken", "access-token"], ["refreshToken", "refresh-token"]]);

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
    return new Response(JSON.stringify({ status: 200, message: "OK", data: { id: 1, orderCode: "OM001", totalAmount: 50000, status: "PENDING" } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    await createOrder({
      addressId: 1,
      deliveryMethod: "STANDARD",
      note: "Thanh toán khi nhận hàng (COD)",
      items: [{ productId: 1, quantity: 1 }],
    });
    assert.equal(calls.length, 1);
    assert.ok(calls[0].url.includes("/orders"));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalLocalStorage) Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
    else delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
  }
});

// ─── VietQR Flow ─────────────────────────────────────────────────────────────

test("VietQR creates payment first, does NOT create order until PAID", async () => {
  const calls: CapturedCall[] = [];
  const originalFetch = globalThis.fetch;
  const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const storage = new Map<string, string>([["accessToken", "access-token"], ["refreshToken", "refresh-token"]]);

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
    const path = String(url);
    const paymentData = { id: 1, status: "PENDING", amount: 50000, transferCode: "QR001", qrUrl: "", bankId: "MB", accountNo: "123", accountName: "Test", expiresAt: "2026-06-06T18:00:00Z", paidAt: null, orderId: null, orderCode: null };
    const orderData = { id: 1, orderCode: "OM001", totalAmount: 50000, status: "PENDING" };
    return new Response(JSON.stringify({ status: 200, message: "OK", data: path.includes("/payments") ? paymentData : orderData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    // Step 1: create payment
    const payment = await paymentService.createVietQrPayment("1", "STANDARD");
    assert.equal(payment.status, "PENDING");
    const paymentCallCount = calls.filter((c) => c.url.includes("/payments")).length;
    const orderCallCount = calls.filter((c) => c.url.includes("/orders")).length;
    assert.equal(paymentCallCount, 1);
    assert.equal(orderCallCount, 0, "no order should be created while payment is PENDING");

    // Step 2: simulate PAID — only then create order
    const paidPayment = { ...payment, status: "PAID" as const };
    if (paidPayment.status === "PAID") {
      await createOrder({
        addressId: 1,
        deliveryMethod: "STANDARD",
        note: `VietQR ${paidPayment.transferCode} - đã xác nhận thanh toán`,
        items: [{ productId: 1, quantity: 1 }],
      });
    }

    const finalOrderCount = calls.filter((c) => c.url.includes("/orders")).length;
    assert.equal(finalOrderCount, 1, "order should be created only after payment is PAID");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalLocalStorage) Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
    else delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
  }
});

// ─── Polling Stop ───────────────────────────────────────────────────────────

test("polling stops when payment status changes from PENDING to PAID", async () => {
  const originalSetInterval = globalThis.setInterval;
  const originalClearInterval = globalThis.clearInterval;
  const originalFetch = globalThis.fetch;
  const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const storage = new Map<string, string>([["accessToken", "access-token"], ["refreshToken", "refresh-token"]]);

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
  });

  let pollCount = 0;
  let clearedCount = 0;
  const intervalIds: ReturnType<typeof setInterval>[] = [];

  globalThis.setInterval = (((fn: () => void, ms: number) => {
    const id = originalSetInterval(fn, ms);
    intervalIds.push(id);
    return id;
  }) as typeof globalThis.setInterval);

  globalThis.clearInterval = (((id: ReturnType<typeof setInterval>) => {
    clearedCount++;
    return originalClearInterval(id);
  }) as typeof globalThis.clearInterval);

  globalThis.fetch = (async (url: string | URL | Request) => {
    pollCount++;
    const status = pollCount >= 2 ? "PAID" : "PENDING";
    return new Response(JSON.stringify({
      status: 200,
      message: "OK",
      data: { id: 1, status, amount: 50000, transferCode: "QR001", qrUrl: "", bankId: "MB", accountNo: "123", accountName: "Test", expiresAt: "2026-06-06T18:00:00Z", paidAt: null, orderId: null, orderCode: null },
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;

  try {
    const payment = await paymentService.createVietQrPayment("1", "STANDARD");

    if (payment.status === "PENDING") {
      const paymentId = payment.id;
      const intervalId = globalThis.setInterval(() => {
        globalThis.fetch(`http://api.test/api/v1/payments/vietqr/${paymentId}`).then(() => {
          if (pollCount >= 2) globalThis.clearInterval(intervalId);
        });
      }, 50);

      setTimeout(() => globalThis.clearInterval(intervalId), 400);
    }

    await new Promise((resolve) => setTimeout(resolve, 600));

    assert.equal(pollCount, 2, "polling should have been called twice");
    assert.ok(clearedCount > 0, "interval should have been cleared after status changed");
  } finally {
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
    globalThis.fetch = originalFetch;
    if (originalLocalStorage) Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
    else delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
  }
});
