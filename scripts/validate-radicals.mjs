#!/usr/bin/env node
/**
 * Validates the Ink Roots radical dataset for structural integrity.
 *
 * Usage: node scripts/validate-radicals.mjs
 *
 * Exits 0 if all validations pass, non-zero on any critical violation.
 * This script is intentionally standalone (no project dependencies)
 * so it can run in CI or on any machine with Node.js 20+.
 */
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const RADICALS_PATH = join(projectRoot, "src/data/radicals.json");

/** @typedef {'core' | 'common' | 'rare'} Frequency */

const VALID_FREQUENCIES = new Set(["core", "common", "rare"]);
const REQUIRED_FIELDS = [
  "id",
  "character",
  "pinyin",
  "english",
  "vietnamese",
  "strokes",
  "frequency",
  "icon",
  "writerChar",
  "story",
  "examples",
  "illustration",
];
const REQUIRED_EXAMPLE_FIELDS = [
  "character",
  "pinyin",
  "english",
  "vietnamese",
];

let errors = 0;
let warnings = 0;

function fail(msg) {
  console.error(`  FAIL: ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`  WARN: ${msg}`);
  warnings++;
}

function pass(msg) {
  console.log(`  OK: ${msg}`);
}

/**
 * @param {unknown} val
 * @returns {val is string}
 */
function isNonEmptyString(val) {
  return typeof val === "string" && val.trim().length > 0;
}

/**
 * @param {unknown} val
 * @returns {val is number}
 */
function isPositiveInteger(val) {
  return typeof val === "number" && Number.isInteger(val) && val > 0;
}

async function main() {
  console.log("Ink Roots Dataset Validator");
  console.log("===========================\n");
  console.log(`Loading dataset from ${RADICALS_PATH}`);

  let raw;
  try {
    raw = await readFile(RADICALS_PATH, "utf-8");
  } catch (e) {
    console.error(`Cannot read dataset file: ${e.message}`);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`Cannot parse JSON: ${e.message}`);
    process.exit(1);
  }

  console.log(`Loaded ${Array.isArray(data) ? data.length : "non-array"} records.\n`);

  // --- Top-level structure ---
  if (!Array.isArray(data)) {
    fail("Dataset root must be an array");
    process.exit(1);
  }

  // --- Count ---
  console.log("[1] Record count");
  if (data.length !== 214) {
    fail(`Expected exactly 214 records, found ${data.length}`);
  } else {
    pass(`Exactly 214 records present`);
  }

  // --- IDs ---
  console.log("\n[2] ID sequence");
  const ids = data.map((r) => r?.id);
  const expectedIds = Array.from({ length: 214 }, (_, i) => i + 1);

  if (ids.length !== 214) {
    fail("Some records are missing an id field");
  }

  for (let i = 0; i < 214; i++) {
    if (ids[i] !== expectedIds[i]) {
      fail(`Expected id ${expectedIds[i]} at position ${i}, got ${ids[i]}`);
      break;
    }
  }

  if (ids.length === 214) {
    pass("All IDs are sequential 1–214");
  }

  // Duplicate IDs
  const idCounts = new Map();
  for (const id of ids) {
    idCounts.set(id, (idCounts.get(id) || 0) + 1);
  }
  const dupIds = [...idCounts.entries()].filter(([_, c]) => c > 1).map(([id]) => id);
  if (dupIds.length > 0) {
    fail(`Duplicate IDs found: ${dupIds.join(", ")}`);
  } else {
    pass("No duplicate IDs");
  }

  // --- Character uniqueness ---
  console.log("\n[3] Character uniqueness");
  const chars = data.map((r) => r?.character).filter((c) => isNonEmptyString(c));
  const charCounts = new Map();
  for (const c of chars) {
    charCounts.set(c, (charCounts.get(c) || 0) + 1);
  }
  const dupChars = [...charCounts.entries()].filter(([_, c]) => c > 1).map(([c]) => c);
  if (dupChars.length > 0) {
    fail(`Duplicate characters found: ${dupChars.join(", ")}`);
  } else if (chars.length === 214) {
    pass("All 214 characters are unique");
  }

  // --- Required fields ---
  console.log("\n[4] Required fields");
  for (const r of data) {
    const missing = REQUIRED_FIELDS.filter((f) => !(f in r) || r[f] === undefined);
    if (missing.length > 0) {
      fail(`Radical id=${r.id}: missing fields: ${missing.join(", ")}`);
    }
  }
  if (errors === 0) {
    pass("All required fields present across all 214 records");
  }

  // --- writerChar ---
  console.log("\n[5] writerChar");
  for (const r of data) {
    if (!isNonEmptyString(r.writerChar) || r.writerChar.length !== 1) {
      fail(`Radical id=${r.id}: writerChar must be a single character, got "${r.writerChar}"`);
    }
  }
  if (errors === 0) {
    pass("All writerChar values are single characters");
  }

  // --- stroke counts ---
  console.log("\n[6] Stroke counts");
  for (const r of data) {
    if (!isPositiveInteger(r.strokes) || r.strokes > 30) {
      fail(`Radical id=${r.id}: strokes must be positive integer ≤ 30, got ${r.strokes}`);
    }
  }
  if (errors === 0) {
    const strokeHistogram = new Map();
    for (const r of data) {
      strokeHistogram.set(r.strokes, (strokeHistogram.get(r.strokes) || 0) + 1);
    }
    const histStr = [...strokeHistogram.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${v}`).join(", ");
    pass(`All stroke counts valid. Distribution: ${histStr}`);
  }

  // --- frequency ---
  console.log("\n[7] Frequency values");
  for (const r of data) {
    if (!VALID_FREQUENCIES.has(r.frequency)) {
      fail(`Radical id=${r.id}: frequency must be 'core' | 'common' | 'rare', got '${r.frequency}'`);
    }
  }
  if (errors === 0) {
    const freqCounts = { core: 0, common: 0, rare: 0 };
    for (const r of data) freqCounts[r.frequency]++;
    pass(`All frequency values valid. core=${freqCounts.core}, common=${freqCounts.common}, rare=${freqCounts.rare}`);
  }

  // --- pinyin ---
  console.log("\n[8] Pinyin");
  for (const r of data) {
    if (!isNonEmptyString(r.pinyin)) {
      fail(`Radical id=${r.id}: pinyin must be a non-empty string`);
    }
  }
  if (errors === 0) {
    pass("All pinyin values non-empty");
  }

  // --- english / vietnamese ---
  console.log("\n[9] English and Vietnamese meanings");
  for (const r of data) {
    if (!isNonEmptyString(r.english)) {
      fail(`Radical id=${r.id}: english meaning must be non-empty`);
    }
    if (!isNonEmptyString(r.vietnamese)) {
      fail(`Radical id=${r.id}: vietnamese meaning must be non-empty`);
    }
  }
  if (errors === 0) {
    pass("All English and Vietnamese meanings present");
  }

  // --- story structure ---
  console.log("\n[10] Story structure");
  for (const r of data) {
    if (!r.story || typeof r.story !== "object") {
      fail(`Radical id=${r.id}: story must be an object`);
      continue;
    }
    if (!isNonEmptyString(r.story.en)) {
      fail(`Radical id=${r.id}: story.en must be non-empty string`);
    }
    if (!isNonEmptyString(r.story.vi)) {
      fail(`Radical id=${r.id}: story.vi must be non-empty string`);
    }
  }
  if (errors === 0) {
    const templateCount = data.filter((r) => r.story.en.startsWith("This radical pictures")).length;
    const customCount = 214 - templateCount;
    pass(`All story objects have en+vi. Custom stories: ${customCount}, template stories: ${templateCount}`);
    if (templateCount > 0) {
      warn(`${templateCount} radicals use generic template stories — not a structural error`);
    }
  }

  // --- examples structure ---
  console.log("\n[11] Examples structure");
  for (const r of data) {
    if (!Array.isArray(r.examples)) {
      fail(`Radical id=${r.id}: examples must be an array`);
      continue;
    }
    if (r.examples.length < 2) {
      fail(`Radical id=${r.id}: must have at least 2 examples, got ${r.examples.length}`);
    }
    for (let i = 0; i < r.examples.length; i++) {
      const ex = r.examples[i];
      const missing = REQUIRED_EXAMPLE_FIELDS.filter((f) => !isNonEmptyString(ex[f]));
      if (missing.length > 0) {
        fail(`Radical id=${r.id} example[${i}]: missing/empty fields: ${missing.join(", ")}`);
      }
    }
    // Check for duplicate example characters within a radical
    const exChars = r.examples.map((e) => e.character);
    if (new Set(exChars).size !== exChars.length) {
      warn(`Radical id=${r.id}: duplicate example characters found`);
    }
  }
  if (errors === 0) {
    pass("All examples have valid structure with >= 2 entries each");
  }

  // --- illustration ---
  console.log("\n[12] Illustration field");
  const illCount = data.filter((r) => r.illustration !== null && r.illustration !== undefined && r.illustration !== "").length;
  if (illCount === 0) {
    warn("All illustration fields are null/empty — icons are used as visual anchors instead");
  } else {
    pass(`${illCount} radicals have illustration data`);
  }

  // --- icon ---
  console.log("\n[13] Icon field");
  const emptyIcons = data.filter((r) => !isNonEmptyString(r.icon));
  if (emptyIcons.length > 0) {
    fail(`${emptyIcons.length} radicals have empty icon field`);
  } else {
    pass("All icons are non-empty strings");
  }

  // --- Summary ---
  console.log("\n===========================================");
  console.log(`Results: ${data.length} records validated.`);
  console.log(`  Errors:   ${errors}`);
  console.log(`  Warnings: ${warnings}`);
  console.log("===========================================");

  if (errors > 0) {
    console.error("\nDataset validation FAILED.");
    process.exit(1);
  } else {
    console.log("\nDataset validation PASSED.");
    process.exit(0);
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
