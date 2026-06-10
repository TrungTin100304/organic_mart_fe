import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const allergensPage = readFileSync(new URL("../src/admin/pages/Allergens.tsx", import.meta.url), "utf8");
const modalUrl = new URL("../src/admin/components/AllergenFormModal.tsx", import.meta.url);

test("admin allergens page uses a form modal instead of window.prompt", () => {
  assert.match(allergensPage, /AllergenFormModal/);
  assert.doesNotMatch(allergensPage, /window\.prompt/);
});

test("admin allergens page exposes edit and delete actions", () => {
  assert.match(allergensPage, /updateAllergen/);
  assert.match(allergensPage, /deleteAllergen/);
  assert.match(allergensPage, /Edit2/);
  assert.match(allergensPage, /Trash2/);
});

test("admin allergens page uses project confirm modal instead of browser confirm", () => {
  assert.match(allergensPage, /AdminConfirmModal/);
  assert.doesNotMatch(allergensPage, /window\.confirm/);
});

test("allergen form modal exposes a submit input for the allergen name", () => {
  assert.equal(existsSync(modalUrl), true);
  const modal = readFileSync(modalUrl, "utf8");
  assert.match(modal, /name:/);
  assert.match(modal, /onSubmit/);
  assert.match(modal, /required/);
  assert.match(modal, /initialName/);
});
