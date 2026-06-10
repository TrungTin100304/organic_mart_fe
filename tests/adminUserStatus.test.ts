import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const usersPage = readFileSync(new URL("../src/admin/pages/Users.tsx", import.meta.url), "utf8");
const userService = readFileSync(new URL("../src/services/adminUserService.ts", import.meta.url), "utf8");

test("admin users page wires active and inactive actions to the backend service", () => {
  assert.match(usersPage, /updateUserStatus/);
  assert.match(usersPage, /handleToggleStatus/);
  assert.match(usersPage, /statusFilter/);
});

test("admin users page uses the web confirm modal instead of browser confirm", () => {
  assert.match(usersPage, /AdminConfirmModal/);
  assert.doesNotMatch(usersPage, /window\.confirm/);
});

test("admin users page protects the current account from status changes", () => {
  assert.match(usersPage, /isCurrentUser\(user\)/);
  assert.match(usersPage, /disabled=\{isStatusUpdating \|\| isCurrentUser\(user\)\}/);
});

test("admin users use the protected paginated admin endpoint", () => {
  assert.match(userService, /\/admin\/users/);
  assert.match(userService, /PageResponse/);
  assert.match(usersPage, /totalPages/);
  assert.match(usersPage, /currentPage/);
});
