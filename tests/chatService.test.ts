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

test("getOrCreateConversation does not post when checking the current conversation fails", async () => {
  const restoreStorage = installAuthStorage();
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; init: RequestInit }> = [];

  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify({
      status: 500,
      message: "Da xay ra loi tren he thong: cannot execute INSERT in a read-only transaction",
      data: null,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const chatModule = await import("../src/services/chatService.ts");

    await assert.rejects(
      () => chatModule.chatService.getOrCreateConversation(),
      /read-only transaction/,
    );

    assert.equal(calls.length, 1);
    assert.equal(routeOf(calls[0].url), "/chat/conversations/me");
    assert.equal(calls[0].init.method ?? "GET", "GET");
  } finally {
    globalThis.fetch = originalFetch;
    restoreStorage();
  }
});
