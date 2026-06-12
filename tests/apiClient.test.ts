import test from "node:test";
import assert from "node:assert/strict";

import { apiRequest, getApiBaseUrl, normalizeRole, resolveApiBaseUrl } from "../src/services/apiClient.ts";

test("resolveApiBaseUrl keeps the relative API path in development so Vite can proxy it", () => {
  assert.equal(resolveApiBaseUrl({ baseUrl: "/api/v1", isDev: true }), "/api/v1");
});

test("resolveApiBaseUrl does not use a relative API path in production", () => {
  assert.equal(
    resolveApiBaseUrl({ baseUrl: "/api/v1", isDev: false }),
    "https://organic-mart-be.onrender.com/api/v1",
  );
});

test("resolveApiBaseUrl accepts an explicit absolute API URL", () => {
  assert.equal(
    resolveApiBaseUrl({ baseUrl: "http://localhost:8080/api/v1/", isDev: false }),
    "http://localhost:8080/api/v1",
  );
});

test("getApiBaseUrl removes trailing slashes and keeps the api version path", () => {
  assert.equal(getApiBaseUrl("http://localhost:8080/api/v1/"), "http://localhost:8080/api/v1");
});

test("getApiBaseUrl defaults to the deployed backend api path", () => {
  assert.equal(getApiBaseUrl(), "https://organic-mart-be.onrender.com/api/v1");
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

test("apiRequest reports a clear message when the Render backend is suspended", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () =>
    new Response(
      "<!DOCTYPE html><html><body>This service has been suspended by its owner.</body></html>",
      {
        status: 503,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    )) as typeof fetch;

  try {
    await assert.rejects(
      () => apiRequest("/auth/login", { method: "POST" }, "http://api.test/api/v1"),
      /Backend Render đang bị tạm ngưng/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("apiRequest hides Gemini quota details behind a helpful message", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({
      status: 500,
      message: 'Đã xảy ra lỗi trên hệ thống: Failed to call Gemini API: 429 Too Many Requests. Quota exceeded for metric: generate_content_free_tier_requests',
      data: null,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;

  try {
    await assert.rejects(
      () => apiRequest("/meal-plans/generate", { method: "POST" }, "http://api.test/api/v1"),
      {
        message: "Dịch vụ tạo thực đơn AI đã hết hạn mức sử dụng. Vui lòng thử lại sau hoặc liên hệ quản trị viên.",
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
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

test("concurrent expired admin requests share one refresh and keep the new session", async () => {
  const storage = new Map<string, string>([
    ["accessToken", "expired-token"],
    ["refreshToken", "single-use-refresh-token"],
    ["userRole", "ROLE_ADMIN"],
  ]);
  const originalFetch = globalThis.fetch;
  const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  let refreshCalls = 0;

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
  });

  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const requestUrl = String(url);
    const authorization = (init?.headers as Record<string, string> | undefined)?.Authorization;

    if (requestUrl.endsWith("/auth/refresh")) {
      refreshCalls += 1;
      if (refreshCalls > 1) {
        return new Response(JSON.stringify({ status: 400, message: "Invalid refresh token" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
      return new Response(JSON.stringify({
        status: 200,
        message: "OK",
        data: {
          accessToken: "fresh-admin-token",
          refreshToken: "fresh-admin-refresh",
          email: "admin@test.dev",
          role: "ROLE_ADMIN",
        },
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (authorization === "Bearer expired-token") {
      return new Response(JSON.stringify({ status: 401, message: "Expired", data: null }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ status: 200, message: "OK", data: { ok: true } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const results = await Promise.all([
      apiRequest<{ ok: boolean }>("/admin/users", { requireAuth: true }, "http://api.test/api/v1"),
      apiRequest<{ ok: boolean }>("/users/me", { requireAuth: true }, "http://api.test/api/v1"),
    ]);

    assert.deepEqual(results, [{ ok: true }, { ok: true }]);
    assert.equal(refreshCalls, 1);
    assert.equal(storage.get("accessToken"), "fresh-admin-token");
    assert.equal(storage.get("refreshToken"), "fresh-admin-refresh");
    assert.equal(storage.get("userRole"), "ROLE_ADMIN");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
    } else {
      delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
    }
  }
});

test("a stale refresh failure does not clear a newer session from another tab", async () => {
  const storage = new Map<string, string>([
    ["accessToken", "expired-token"],
    ["refreshToken", "stale-refresh-token"],
    ["userRole", "ROLE_ADMIN"],
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
    const requestUrl = String(url);
    const authorization = (init?.headers as Record<string, string> | undefined)?.Authorization;

    if (requestUrl.endsWith("/auth/refresh")) {
      storage.set("accessToken", "newer-tab-token");
      storage.set("refreshToken", "newer-tab-refresh");
      return new Response(JSON.stringify({ status: 400, message: "Invalid refresh token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (authorization === "Bearer expired-token") {
      return new Response(JSON.stringify({ status: 401, message: "Expired", data: null }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ status: 200, message: "OK", data: { ok: true } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const result = await apiRequest<{ ok: boolean }>(
      "/admin/users",
      { requireAuth: true },
      "http://api.test/api/v1",
    );

    assert.deepEqual(result, { ok: true });
    assert.equal(storage.get("accessToken"), "newer-tab-token");
    assert.equal(storage.get("refreshToken"), "newer-tab-refresh");
    assert.equal(storage.get("userRole"), "ROLE_ADMIN");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
    } else {
      delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
    }
  }
});
