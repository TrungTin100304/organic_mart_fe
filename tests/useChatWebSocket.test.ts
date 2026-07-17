import test from "node:test";
import assert from "node:assert/strict";

test("chat websocket does not reconnect after an intentional close", async () => {
  const socketModule = await import("../src/hooks/useChatWebSocket.ts");

  assert.equal(typeof socketModule.shouldReconnectChatSocket, "function");
  assert.equal(
    socketModule.shouldReconnectChatSocket({
      enabled: true,
      intentionallyClosed: true,
      attempts: 0,
      maxAttempts: 5,
    }),
    false,
  );
});

test("chat websocket reconnects only while enabled and below the retry limit", async () => {
  const socketModule = await import("../src/hooks/useChatWebSocket.ts");

  assert.equal(
    socketModule.shouldReconnectChatSocket({
      enabled: true,
      intentionallyClosed: false,
      attempts: 4,
      maxAttempts: 5,
    }),
    true,
  );
  assert.equal(
    socketModule.shouldReconnectChatSocket({
      enabled: false,
      intentionallyClosed: false,
      attempts: 0,
      maxAttempts: 5,
    }),
    false,
  );
  assert.equal(
    socketModule.shouldReconnectChatSocket({
      enabled: true,
      intentionallyClosed: false,
      attempts: 5,
      maxAttempts: 5,
    }),
    false,
  );
});
