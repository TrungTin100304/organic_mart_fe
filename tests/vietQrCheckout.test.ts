import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const checkoutPage = readFileSync(new URL("../src/pages/Checkout.tsx", import.meta.url), "utf8");
const paymentService = readFileSync(new URL("../src/services/paymentService.ts", import.meta.url), "utf8");
const paymentModal = readFileSync(new URL("../src/components/VietQrPaymentModal.tsx", import.meta.url), "utf8");
const orderService = readFileSync(new URL("../src/services/orderService.ts", import.meta.url), "utf8");

test("checkout offers VietQR and creates a backend payment request", () => {
  assert.match(checkoutPage, /VIETQR/);
  assert.match(checkoutPage, /createVietQrPayment/);
  assert.match(checkoutPage, /VietQrPaymentModal/);
  assert.match(paymentModal, /payment\.qrUrl/);
  assert.match(checkoutPage, /setInterval/);
});

test("payment service calls the authenticated VietQR endpoint", () => {
  assert.match(paymentService, /\/payments\/vietqr/);
  assert.match(paymentService, /requireAuth:\s*true/);
});

test("checkout completes both COD and paid VietQR orders through internal delivery", () => {
  assert.match(checkoutPage, /createOrder/);
  assert.match(checkoutPage, /paymentMethod === "COD"/);
  assert.match(checkoutPage, /vietQrPayment\.status !== "PAID"/);
  assert.match(orderService, /\/orders/);
  assert.doesNotMatch(orderService, /shippingProviderId/);
  assert.match(orderService, /deliveryMethod/);
});

test("checkout exposes complete-order flow without legacy shipping providers", () => {
  assert.doesNotMatch(checkoutPage, /getActiveShippingProviders/);
  assert.match(paymentService, /completeVietQrOrder/);
  assert.match(paymentModal, /onCompleteOrder/);
});
