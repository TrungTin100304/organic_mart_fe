import test from "node:test";
import assert from "node:assert/strict";

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
