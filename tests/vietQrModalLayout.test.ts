import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import VietQrPaymentModal from "../src/components/VietQrPaymentModal.tsx";
import type { VietQrPayment } from "../src/services/paymentService.ts";

const payment: VietQrPayment = {
  id: 1,
  status: "PENDING",
  amount: 220000,
  transferCode: "OMABC123XYZDEF",
  qrUrl: "https://qr.test/payment.png",
  bankId: "TPB",
  accountNo: "00003981468",
  accountName: "ORGANIC MART",
  expiresAt: "2026-06-08T20:00:00Z",
  paidAt: null,
  orderId: null,
  orderCode: null,
};

test("VietQR modal prioritizes a large responsive QR and explicit copy actions", () => {
  const markup = renderToStaticMarkup(
    React.createElement(VietQrPaymentModal, {
      payment,
      onClose: () => undefined,
      onRefresh: () => undefined,
      onCompleteOrder: () => undefined,
    }),
  );

  assert.match(markup, /w-\[280px\]/);
  assert.match(markup, /sm:w-\[320px\]/);
  assert.match(markup, /aspect-square/);
  assert.match(markup, /object-contain/);
  assert.match(markup, /max-w-2xl/);
  assert.match(markup, /max-h-\[calc\(100vh-2rem\)\]/);
  assert.match(markup, /overflow-y-auto/);
  assert.match(markup, /aria-label="Sao chép nội dung chuyển khoản"/);
  assert.match(markup, /aria-label="Sao chép số tài khoản"/);
  assert.match(markup, /Ngân hàng/);
  assert.match(markup, /Tên tài khoản/);
});
