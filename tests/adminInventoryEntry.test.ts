import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import {
  buildInventoryProductStock,
  createInventoryBatchPayload,
} from "../src/admin/utils/inventoryEntry.ts";

test("inventory includes products that do not have a batch yet", () => {
  const stock = buildInventoryProductStock(
    [
      { id: "1", name: "Rau cai" },
      { id: "2", name: "Ca chua" },
    ],
    [
      {
        id: 10,
        productId: 1,
        productName: "Rau cai",
        farmId: 3,
        farmName: "Green Farm",
        batchCode: "BATCH-001",
        quantityInitial: 20,
        quantityRemaining: 12,
        importDate: "2026-06-08",
        expiryDate: "2026-06-15",
        expired: false,
      },
    ],
  );

  assert.deepEqual(stock.map(({ productId, quantity }) => ({ productId, quantity })), [
    { productId: 2, quantity: 0 },
    { productId: 1, quantity: 12 },
  ]);
});

test("new inventory batch starts with all received quantity remaining", () => {
  const payload = createInventoryBatchPayload({
    productId: "2",
    farmId: "3",
    batchCode: "  LOT-20260608  ",
    quantity: "25",
    importDate: "2026-06-08",
    expiryDate: "2026-06-15",
    costPrice: "12000",
  });

  assert.deepEqual(payload, {
    productId: 2,
    farmId: 3,
    batchCode: "LOT-20260608",
    quantityInitial: 25,
    quantityRemaining: 25,
    importDate: "2026-06-08",
    expiryDate: "2026-06-15",
    costPrice: 12000,
  });
});

test("admin inventory page exposes the stock entry flow", () => {
  const page = readFileSync(new URL("../src/admin/pages/Inventory.tsx", import.meta.url), "utf8");
  const productsPage = readFileSync(new URL("../src/admin/pages/Products.tsx", import.meta.url), "utf8");
  const productModal = readFileSync(new URL("../src/admin/components/ProductFormModal.tsx", import.meta.url), "utf8");
  const modalUrl = new URL("../src/admin/components/InventoryBatchFormModal.tsx", import.meta.url);

  assert.equal(existsSync(modalUrl), true);
  assert.match(page, /createInventoryBatch/);
  assert.match(page, /InventoryBatchFormModal/);
  assert.match(page, /Nhập kho/);
  assert.match(productsPage, /\/admin\/inventory\?productId=/);
  assert.match(productModal, /Số lượng được quản lý theo từng lô nhập kho/);
});
