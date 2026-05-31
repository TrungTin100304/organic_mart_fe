import test from "node:test";
import assert from "node:assert/strict";

import { apiRequest, getApiBaseUrl, normalizeRole } from "../src/services/apiClient.ts";

test("getApiBaseUrl removes trailing slashes and keeps the api version path", () => {
  assert.equal(getApiBaseUrl("http://localhost:8080/api/v1/"), "http://localhost:8080/api/v1");
});

test("normalizeRole accepts backend ROLE_* values and legacy admin values", () => {
  assert.equal(normalizeRole("ROLE_ADMIN"), "ROLE_ADMIN");
  assert.equal(normalizeRole("ADMIN"), "ROLE_ADMIN");
  assert.equal(normalizeRole("ROLE_USER"), "ROLE_USER");
  assert.equal(normalizeRole("customer"), "ROLE_USER");
});

test("apiRequest unwraps ApiResponse.data and sends bearer token", async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const originalFetch = globalThis.fetch;
  const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => (key === "accessToken" ? "abc-token" : null),
      removeItem: () => undefined,
    },
  });

  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify({ status: 200, message: "OK", data: { id: 7 } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const result = await apiRequest<{ id: number }>("/users/me", { requireAuth: true }, "http://api.test/api/v1");
    assert.deepEqual(result, { id: 7 });
    assert.equal(calls[0].url, "http://api.test/api/v1/users/me");
    assert.equal((calls[0].init.headers as Record<string, string>).Authorization, "Bearer abc-token");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
    } else {
      delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
    }
  }
});

test("apiRequest refreshes an expired access token once and retries the original request", async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const storage = new Map<string, string>([
    ["accessToken", "expired-token"],
    ["refreshToken", "refresh-token"],
  ]);
  const originalFetch = globalThis.fetch;
  const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

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
    if (String(url).endsWith("/users/me") && calls.length === 1) {
      return new Response(JSON.stringify({ status: 401, message: "Expired", data: null }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (String(url).endsWith("/auth/refresh")) {
      return new Response(JSON.stringify({
        status: 200,
        message: "OK",
        data: {
          accessToken: "fresh-token",
          refreshToken: "fresh-refresh",
          email: "a@test.dev",
          role: "ROLE_USER",
        },
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ status: 200, message: "OK", data: { id: 8 } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const result = await apiRequest<{ id: number }>("/users/me", { requireAuth: true }, "http://api.test/api/v1");
    assert.deepEqual(result, { id: 8 });
    assert.equal(storage.get("accessToken"), "fresh-token");
    assert.equal(calls.length, 3);
    assert.equal((calls[2].init.headers as Record<string, string>).Authorization, "Bearer fresh-token");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
    } else {
      delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
    }
  }
});
