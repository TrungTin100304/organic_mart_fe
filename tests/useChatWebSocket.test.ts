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
      handshakeEstablished: true,
    }),
    false,
  );
});

test("chat websocket reconnects only while enabled, after the handshake established, and below the retry limit", async () => {
  const socketModule = await import("../src/hooks/useChatWebSocket.ts");

  assert.equal(
    socketModule.shouldReconnectChatSocket({
      enabled: true,
      intentionallyClosed: false,
      attempts: 4,
      maxAttempts: 5,
      handshakeEstablished: true,
    }),
    true,
  );
  assert.equal(
    socketModule.shouldReconnectChatSocket({
      enabled: false,
      intentionallyClosed: false,
      attempts: 0,
      maxAttempts: 5,
      handshakeEstablished: true,
    }),
    false,
  );
  assert.equal(
    socketModule.shouldReconnectChatSocket({
      enabled: true,
      intentionallyClosed: false,
      attempts: 5,
      maxAttempts: 5,
      handshakeEstablished: true,
    }),
    false,
  );
});

test("chat websocket does not reconnect when the handshake never established", async () => {
  const socketModule = await import("../src/hooks/useChatWebSocket.ts");

  assert.equal(
    socketModule.shouldReconnectChatSocket({
      enabled: true,
      intentionallyClosed: false,
      attempts: 0,
      maxAttempts: 5,
      handshakeEstablished: false,
    }),
    false,
    "should refuse to retry when onopen never fired"
  );
  assert.equal(
    socketModule.shouldReconnectChatSocket({
      enabled: true,
      intentionallyClosed: false,
      attempts: 4,
      maxAttempts: 5,
      handshakeEstablished: false,
    }),
    false,
    "handshake failure should not consume retry budget"
  );
});
