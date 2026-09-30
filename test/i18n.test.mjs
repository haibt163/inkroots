/**
 * i18n dictionary parity tests.
 *
 * The `en` and `vi` dictionaries are defined as object literals inside
 * src/lib/i18n.tsx. Since that file contains JSX/TSX and uses `@/` path
 * aliases, it cannot be imported directly in Node tests. Instead, we read
 * the source file as text and extract dictionary keys via regex to verify
 * that `vi` has all keys present in `en` (and vice versa).
 *
 * Source: src/lib/i18n.tsx (lines 14–128)
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const SOURCE_PATH = join(projectRoot, "src/lib/i18n.tsx");

/**
 * Extracts property keys from a dictionary object literal body.
 * Matches `keyName:` at start of a line (indented).
 *
 * @param {string} block - The text between `{` and `}` of a dictionary
 * @returns {string[]} Array of property key names
 */
function extractKeys(block) {
  const keyRegex = /^\s*(\w+):\s*/gm;
  const keys = [];
  let match;
  while ((match = keyRegex.exec(block)) !== null) {
    keys.push(match[1]);
  }
  return keys;
}

/**
 * Extracts the `en` and `vi` dictionary bodies from the i18n source.
 *
 * @param {string} source - Full source text of i18n.tsx
 * @returns {{en: string[], vi: string[]}} Keys for each dictionary
 */
function extractDictionaries(source) {
  // en: from `const en = {` to the closing `};` that precedes `const vi`
  const enMatch = source.match(/const en\s*=\s*\{([\s\S]*?)\n\};/);
  // vi: from `const vi: typeof en = {` to the closing `};` that precedes `const dictionaries`
  const viMatch = source.match(/const vi\s*[:].*=\s*\{([\s\S]*?)\n\};/);

  if (!enMatch) throw new Error("Could not find `en` dictionary in source");
  if (!viMatch) throw new Error("Could not find `vi` dictionary in source");

  return {
    en: extractKeys(enMatch[1]),
    vi: extractKeys(viMatch[1]),
  };
}

let dicts;

before(() => {
  const source = readFileSync(SOURCE_PATH, "utf-8");
  dicts = extractDictionaries(source);
});

describe("i18n dictionary structure", () => {
  it("both dictionaries have keys", () => {
    assert.ok(dicts.en.length > 0, "en dictionary should have keys");
    assert.ok(dicts.vi.length > 0, "vi dictionary should have keys");
  });

  it("dictionaries have similar key counts (parity)", () => {
    assert.ok(
      Math.abs(dicts.en.length - dicts.vi.length) <= 2,
      `Key count mismatch: en=${dicts.en.length}, vi=${dicts.vi.length}`,
    );
  });

  it("vi has all keys that en has", () => {
    const viSet = new Set(dicts.vi);
    const missingInVi = dicts.en.filter((k) => !viSet.has(k));
    assert.deepEqual(
      missingInVi,
      [],
      `Keys missing from vi dictionary: ${missingInVi.join(", ")}`,
    );
  });

  it("en has all keys that vi has", () => {
    const enSet = new Set(dicts.en);
    const missingInEn = dicts.vi.filter((k) => !enSet.has(k));
    assert.deepEqual(
      missingInEn,
      [],
      `Keys missing from en dictionary: ${missingInEn.join(", ")}`,
    );
  });

  it("en and vi have matching keys", () => {
    const enSet = new Set(dicts.en);
    const viSet = new Set(dicts.vi);
    const enOnly = dicts.en.filter((k) => !viSet.has(k));
    const viOnly = dicts.vi.filter((k) => !enSet.has(k));
    assert.deepEqual(enOnly, [], `Keys only in en: ${enOnly.join(", ")}`);
    assert.deepEqual(viOnly, [], `Keys only in vi: ${viOnly.join(", ")}`);
  });

  it("includes core UI keys", () => {
    const enSet = new Set(dicts.en);
    const required = ["appName", "search", "all", "core", "common", "rare",
      "learned", "practice", "radicals", "noResults", "english", "vietnamese"];
    for (const key of required) {
      assert.ok(enSet.has(key), `en dictionary missing key: ${key}`);
    }
  });
});
