import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("admin delivery settings sends complete validated settings and is the shared checkout source", async () => {
  const page = await readFile(new URL("../src/admin/pages/Settings.tsx", import.meta.url), "utf8");
  assert.match(page, /const current = settings\.find/);
  assert.match(page, /\{ \.\.\.current, \.\.\.updates \}/);
  assert.match(page, /freeShippingThreshold/);

  const orderService = await readFile(new URL("../../../BE/organic_mart_be/src/main/java/com/bryan/service/impl/OrderServiceImpl.java", import.meta.url), "utf8");
  const paymentService = await readFile(new URL("../../../BE/organic_mart_be/src/main/java/com/bryan/service/impl/VietQrPaymentServiceImpl.java", import.meta.url), "utf8");
  const deliveryController = await readFile(new URL("../../../BE/organic_mart_be/src/main/java/com/bryan/controller/DeliveryController.java", import.meta.url), "utf8");
  assert.match(orderService, /deliverySettingService\.calculateFee/);
  assert.match(paymentService, /deliverySettingService\.calculateFee/);
  assert.match(deliveryController, /deliverySettingService\.getAllSettings/);
});
