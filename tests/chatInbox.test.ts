import test from "node:test";
import assert from "node:assert/strict";

import { getMessageTimestamp, sortMessagesChronologically } from "../src/admin/pages/ChatInbox.tsx";
import type { ChatMessage } from "../src/services/chatService.ts";

const baseMessage: Omit<ChatMessage, "createdAt" | "content"> = {
  id: 1,
  conversationId: 1,
  senderId: null,
  senderEmail: null,
  senderRole: "USER",
  status: "SENT",
  clientMessageId: null,
};

const buildMessages = (
  spec: Array<{ id: number; role: ChatMessage["senderRole"]; createdAt: string }>
): ChatMessage[] =>
  spec.map(({ id, role, createdAt }) => ({
    ...baseMessage,
    id,
    senderRole: role,
    content: `message-${id}`,
    createdAt,
  }));

test("sortMessagesChronologically keeps ascending order returned by the backend", () => {
  const input = buildMessages([
    { id: 1, role: "USER", createdAt: "2026-07-18T10:00:00.000Z" },
    { id: 2, role: "ADMIN", createdAt: "2026-07-18T10:01:00.000Z" },
    { id: 3, role: "USER", createdAt: "2026-07-18T10:02:00.000Z" },
  ]);

  const sorted = sortMessagesChronologically(input);

  assert.deepEqual(sorted.map((m) => m.id), [1, 2, 3]);
});

test("sortMessagesChronologically fixes descending order (newest-first) so chat reads old -> new", () => {
  const input = buildMessages([
    { id: 3, role: "USER", createdAt: "2026-07-18T10:02:00.000Z" },
    { id: 2, role: "ADMIN", createdAt: "2026-07-18T10:01:00.000Z" },
    { id: 1, role: "USER", createdAt: "2026-07-18T10:00:00.000Z" },
  ]);

  const sorted = sortMessagesChronologically(input);

  assert.deepEqual(sorted.map((m) => m.id), [1, 2, 3]);
});

test("sortMessagesChronologically does not mutate the input array", () => {
  const input = buildMessages([
    { id: 3, role: "USER", createdAt: "2026-07-18T10:02:00.000Z" },
    { id: 2, role: "ADMIN", createdAt: "2026-07-18T10:01:00.000Z" },
    { id: 1, role: "USER", createdAt: "2026-07-18T10:00:00.000Z" },
  ]);

  sortMessagesChronologically(input);

  assert.deepEqual(input.map((m) => m.id), [3, 2, 1]);
});

test("sortMessagesChronologically handles messages with the same timestamp without reordering", () => {
  const input = buildMessages([
    { id: 1, role: "USER", createdAt: "2026-07-18T10:00:00.000Z" },
    { id: 2, role: "ADMIN", createdAt: "2026-07-18T10:00:00.000Z" },
  ]);

  const sorted = sortMessagesChronologically(input);

  assert.deepEqual(sorted.map((m) => m.id), [1, 2]);
});

test("sortMessagesChronologically falls back to epoch when createdAt is missing or invalid", () => {
  const input: ChatMessage[] = [
    { ...baseMessage, id: 1, senderRole: "USER", content: "a", createdAt: "" },
    { ...baseMessage, id: 2, senderRole: "ADMIN", content: "b", createdAt: "1970-01-01T00:00:00.000Z" },
    { ...baseMessage, id: 3, senderRole: "USER", content: "c", createdAt: "2026-07-18T10:00:00.000Z" },
  ];

  const sorted = sortMessagesChronologically(input);

  const epochMessages = sorted.filter(
    (m) => getMessageTimestamp(m) === 0
  );
  assert.deepEqual(
    epochMessages.map((m) => m.id),
    [1, 2],
    "messages with missing or epoch timestamps sort to the beginning"
  );
  assert.equal(sorted[sorted.length - 1].id, 3, "valid timestamp sorts last");
});