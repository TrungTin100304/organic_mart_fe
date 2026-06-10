import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const cartPage = readFileSync(new URL("../src/pages/Cart.tsx", import.meta.url), "utf8");

test("cart does not add a hard-coded shipping fee before checkout", () => {
  assert.doesNotMatch(cartPage, /totalPrice\s*>\s*0\s*\?\s*20000/);
  assert.match(cartPage, /Tính tại bước thanh toán/);
  assert.match(cartPage, /const total = \(cart\?\.totalPrice \|\| 0\) - discount/);
});

