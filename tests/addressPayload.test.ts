import assert from "node:assert/strict";
import test from "node:test";
import { prepareAddressRequest } from "../src/services/addressService.ts";

test("prepareAddressRequest builds full address for internal delivery", () => {
  const payload = prepareAddressRequest({
    label: "HOME",
    recipientName: "Nguyen Van A",
    recipientPhone: "0909000000",
    fullAddress: "",
    isDefault: true,
    buildingId: 12,
    buildingCode: "S1.01",
    buildingName: "Tòa S1.01 - The Rainbow",
    floor: " 5 ",
    apartmentNumber: " 501 ",
  });

  assert.equal(payload.floor, "5");
  assert.equal(payload.apartmentNumber, "501");
  assert.equal(payload.fullAddress, "Căn hộ 501, tầng 5, tòa S1.01");
});
