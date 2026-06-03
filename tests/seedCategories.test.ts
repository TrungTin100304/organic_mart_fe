import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { CATEGORIES } from "../src/admin/mocks/catalog.ts";

test("database seeds include the default admin categories", () => {
  const seedDir = join(process.cwd(), "db", "seed");
  const seedSql = readdirSync(seedDir)
    .filter((file) => /^V\d+__.*\.sql$/.test(file))
    .map((file) => readFileSync(join(seedDir, file), "utf8"))
    .join("\n");

  for (const category of CATEGORIES) {
    assert.match(seedSql, new RegExp(`'${category.slug}'`), category.slug);
  }
});
