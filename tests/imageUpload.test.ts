import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { IMAGE_ACCEPT, MAX_IMAGE_SIZE_BYTES, validateImageFile } from "../src/utils/imageUpload.ts";

test("image validation accepts JPEG, PNG and WEBP up to 5MB", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"]) {
    const file = new File(["image"], `photo.${type.split("/")[1]}`, { type });
    assert.equal(validateImageFile(file), null);
  }
  assert.equal(IMAGE_ACCEPT, "image/jpeg,image/png,image/webp");
});

test("image validation rejects unsupported formats and files larger than 5MB", () => {
  const svg = new File(["<svg/>"], "photo.svg", { type: "image/svg+xml" });
  const oversized = new File([new Uint8Array(MAX_IMAGE_SIZE_BYTES + 1)], "photo.png", { type: "image/png" });

  assert.equal(validateImageFile(svg), "Chỉ chấp nhận ảnh JPEG, PNG hoặc WEBP.");
  assert.equal(validateImageFile(oversized), "Ảnh không được vượt quá 5MB.");
});

test("product and avatar upload UIs expose preview and explicit image controls", () => {
  const productModal = readFileSync(new URL("../src/admin/components/ProductFormModal.tsx", import.meta.url), "utf8");
  const profileCard = readFileSync(new URL("../src/components/ProfileCard.tsx", import.meta.url), "utf8");

  assert.match(productModal, /URL\.createObjectURL/);
  assert.match(productModal, /Đổi ảnh/);
  assert.match(productModal, /Xóa ảnh đã chọn/);
  assert.match(productModal, /validateImageFile/);
  assert.match(profileCard, /URL\.createObjectURL/);
  assert.match(profileCard, /validateImageFile/);
});
