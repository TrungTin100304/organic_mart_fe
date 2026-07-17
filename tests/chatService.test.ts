import test from "node:test";
import assert from "node:assert/strict";

const conversation = {
  id: 12,
  userId: 1,
  userEmail: "user@test.dev",
  userFullName: "Test User",
  status: "OPEN",
  lastMessageAt: null,
  createdAt: "2026-07-17T00:00:00.000Z",
  updatedAt: "2026-07-17T00:00:00.000Z",
};

const installAuthStorage = () => {
  const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => (key === "accessToken" ? "access-token" : null),
      removeItem: () => undefined,
    },
  });

  return () => {
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
    } else {
      delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
    }
  };
};

const routeOf = (url: string) => {
  const parsed = new URL(url);
  return parsed.pathname.replace("/api/v1", "");
};

test("resolveWsUrl uses the Vite dev server websocket proxy when a proxy target is configured", async () => {
  const chatModule = await import("../src/services/chatService.ts");

  assert.equal(typeof chatModule.resolveWsUrl, "function");
  assert.equal(
    chatModule.resolveWsUrl({
      appOrigin: "http://localhost:3000",
      isDev: true,
      proxyTarget: "https://organic-mart-be-yilq.onrender.com",
    }),
    "ws://localhost:3000/ws/chat",
  );
});

test("getOrCreateConversation reuses the current conversation before posting a new one", async () => {
  const restoreStorage = installAuthStorage();
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; init: RequestInit }> = [];

  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify({ status: 200, message: "OK", data: conversation }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const chatModule = await import("../src/services/chatService.ts");
    const result = await chatModule.chatService.getOrCreateConversation();

    assert.deepEqual(result, conversation);
    assert.equal(calls.length, 1);
    assert.equal(routeOf(calls[0].url), "/chat/conversations/me");
    assert.equal(calls[0].init.method ?? "GET", "GET");
  } finally {
    globalThis.fetch = originalFetch;
    restoreStorage();
  }
});

test("getOrCreateConversation creates a conversation when none exists yet", async () => {
  const restoreStorage = installAuthStorage();
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; init: RequestInit }> = [];

  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    if (String(url).endsWith("/chat/conversations/me")) {
      return new Response(JSON.stringify({ status: 404, message: "Not found", data: null }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ status: 200, message: "OK", data: conversation }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const chatModule = await import("../src/services/chatService.ts");
    const result = await chatModule.chatService.getOrCreateConversation();

    assert.deepEqual(result, conversation);
    assert.equal(calls.length, 2);
    assert.equal(routeOf(calls[0].url), "/chat/conversations/me");
    assert.equal(routeOf(calls[1].url), "/chat/conversations");
    assert.equal(calls[1].init.method, "POST");
  } finally {
    globalThis.fetch = originalFetch;
    restoreStorage();
  }
});

test("getOrCreateConversation falls back to POST when GET /me returns a transient server error", async () => {
  const restoreStorage = installAuthStorage();
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; init: RequestInit }> = [];

  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    const requestUrl = String(url);
    if (requestUrl.endsWith("/chat/conversations/me")) {
      return new Response(JSON.stringify({
        status: 500,
        message: "Da xay ra loi tren he thong: cannot execute INSERT in a read-only transaction",
        data: null,
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ status: 200, message: "OK", data: conversation }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const chatModule = await import("../src/services/chatService.ts");
    const result = await chatModule.chatService.getOrCreateConversation();

    assert.deepEqual(result, conversation);
    assert.equal(calls.length, 2);
    assert.equal(routeOf(calls[0].url), "/chat/conversations/me");
    assert.equal(routeOf(calls[1].url), "/chat/conversations");
    assert.equal(calls[1].init.method, "POST");
  } finally {
    globalThis.fetch = originalFetch;
    restoreStorage();
  }
});

test("getOrCreateConversation falls back to POST on 503 and 502 transient gateway errors", async () => {
  for (const transientStatus of [502, 503, 504]) {
    const restoreStorage = installAuthStorage();
    const originalFetch = globalThis.fetch;
    const calls: Array<{ url: string; init: RequestInit }> = [];

    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init: init ?? {} });
      const requestUrl = String(url);
      if (requestUrl.endsWith("/chat/conversations/me")) {
        return new Response(JSON.stringify({
          status: transientStatus,
          message: "upstream unavailable",
          data: null,
        }), {
          status: transientStatus,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ status: 200, message: "OK", data: conversation }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    try {
      const chatModule = await import("../src/services/chatService.ts");
      const result = await chatModule.chatService.getOrCreateConversation();

      assert.deepEqual(result, conversation, `status ${transientStatus}`);
      assert.equal(calls.length, 2, `status ${transientStatus}`);
      assert.equal(calls[1].init.method, "POST", `status ${transientStatus}`);
    } finally {
      globalThis.fetch = originalFetch;
      restoreStorage();
    }
  }
});

test("getOrCreateConversation does not fall back when GET /me returns a client error", async () => {
  for (const clientStatus of [400, 401, 403]) {
    const restoreStorage = installAuthStorage();
    const originalFetch = globalThis.fetch;
    const calls: Array<{ url: string; init: RequestInit }> = [];

    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init: init ?? {} });
      return new Response(JSON.stringify({
        status: clientStatus,
        message: "client error",
        data: null,
      }), {
        status: clientStatus,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    try {
      const chatModule = await import("../src/services/chatService.ts");

      await assert.rejects(
        () => chatModule.chatService.getOrCreateConversation(),
        /client error/,
      );

      assert.equal(calls.length, 1, `status ${clientStatus}`);
      assert.equal(routeOf(calls[0].url), "/chat/conversations/me");
    } finally {
      globalThis.fetch = originalFetch;
      restoreStorage();
    }
  }
});

test("shouldFallbackToCreateConversation returns true for non-ApiRequestError network failures", () => {
  const chatModulePromise = import("../src/services/chatService.ts");
  return chatModulePromise.then(({ shouldFallbackToCreateConversation }) => {
    assert.equal(shouldFallbackToCreateConversation(new Error("Network error")), true);
    assert.equal(shouldFallbackToCreateConversation(new TypeError("Failed to fetch")), true);
  });
});
