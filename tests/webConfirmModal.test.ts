import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const collectSourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(path);
    return /\.(tsx?|jsx?)$/.test(entry.name) ? [path] : [];
  });

test("frontend uses app modals instead of browser confirm dialogs", () => {
  const offenders = collectSourceFiles("src").filter((file) => readFileSync(file, "utf8").includes("window.confirm"));

  assert.deepEqual(offenders, []);
});
