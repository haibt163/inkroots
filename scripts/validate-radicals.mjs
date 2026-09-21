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
import { realpathSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_PROJECT_ROOT = join(__dirname, "..");
const validatorArgs = parseValidatorArgs(process.argv.slice(2));
const projectRoot = validatorArgs.root ?? DEFAULT_PROJECT_ROOT;
const RADICALS_PATH = join(projectRoot, "src/data/radicals.json");
const STROKE_DATA_REL_PATH = "public/stroke-data";

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

function isPositiveInteger(val) {
  return typeof val === "number" && Number.isInteger(val) && val > 0;
}

/**
 * The runtime requests an encoded URL, while static servers decode that URL
 * before resolving the filename. The on-disk corpus therefore uses the literal
 * writerChar in each filename.
 *
 * @param {string} writerChar
 * @returns {string}
 */
export function strokeDataFilename(writerChar) {
  return `${writerChar}.json`;
}

/**
 * @param {string} filename
 * @returns {boolean}
 */
function isSafeStrokeDataFilename(filename) {
  return (
    filename !== "." &&
    filename !== ".." &&
    !filename.includes("/") &&
    !filename.includes("\\") &&
    !filename.includes("\0")
  );
}

/**
 * @param {unknown[]} data
 * @returns {Set<string>}
 */
export function expectedStrokeDataFiles(data) {
  const expected = new Set();
  for (const record of data) {
    const writerChar = record?.writerChar;
    if (!isNonEmptyString(writerChar) || writerChar.length !== 1) continue;
    const filename = strokeDataFilename(writerChar);
    if (isSafeStrokeDataFilename(filename)) expected.add(filename);
  }
  return expected;
}

/**
 * @param {string} directory
 * @param {string} baseDirectory
 * @returns {Promise<Map<string, string>>}
 */
async function collectJsonFiles(directory, baseDirectory) {
  const files = new Map();
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = await collectJsonFiles(entryPath, baseDirectory);
      for (const [relativePath, filePath] of nested) {
        files.set(relativePath, filePath);
      }
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      const relativePath = relative(baseDirectory, entryPath).split(/[\\/]/).join("/");
      files.set(relativePath, entryPath);
    }
  }

  return files;
}

/**
 * Validate the local corpus without changing the structural dataset checks.
 *
 * @param {object} options
 * @param {string} options.projectRoot
 * @param {unknown[]} options.data
 * @param {(message: string) => void} options.fail
 * @returns {Promise<void>}
 */
export async function validateStrokeDataCorpus({ projectRoot, data, fail }) {
  const strokeDataDir = join(projectRoot, STROKE_DATA_REL_PATH);
  try {
    // A readdir here doubles as the directory-existence / not-a-file check;
    // collectJsonFiles below performs the real enumeration.
    await readdir(strokeDataDir, { withFileTypes: true });
  } catch (e) {
    if (e.code === "ENOENT") {
      fail(`Stroke-data directory is missing: ${STROKE_DATA_REL_PATH}`);
    } else if (e.code === "ENOTDIR") {
      fail(`Stroke-data path is not a directory: ${STROKE_DATA_REL_PATH}`);
    } else {
      fail(`Cannot inspect stroke-data directory: ${e.message}`);
    }
    return;
  }

  // Keep the initial listing above as the directory-type check, then recurse
  // so stray JSON files cannot hide in a nested corpus directory.
  const actualFiles = await collectJsonFiles(strokeDataDir, strokeDataDir);
  const expectedFiles = expectedStrokeDataFiles(data);
  const missingFiles = [...expectedFiles]
    .filter((filename) => !actualFiles.has(filename))
    .sort();
  const unexpectedFiles = [...actualFiles.keys()]
    .filter((filename) => !expectedFiles.has(filename))
    .sort();

  for (const filename of missingFiles) {
    fail(`Missing local stroke-data file: ${STROKE_DATA_REL_PATH}/${filename}`);
  }
  for (const filename of unexpectedFiles) {
    fail(`Unexpected local stroke-data file: ${STROKE_DATA_REL_PATH}/${filename}`);
  }

  let invalidCount = 0;
  for (const filename of expectedFiles) {
    const filePath = actualFiles.get(filename);
    if (!filePath) continue;
    let raw;
    try {
      raw = await readFile(filePath, "utf-8");
    } catch (e) {
      invalidCount++;
      fail(`Cannot read local stroke-data file: ${STROKE_DATA_REL_PATH}/${filename}: ${e.message}`);
      continue;
    }

    try {
      JSON.parse(raw);
    } catch (e) {
      invalidCount++;
      fail(`Invalid JSON in ${STROKE_DATA_REL_PATH}/${filename}: ${e.message}`);
    }
  }

  if (missingFiles.length === 0 && unexpectedFiles.length === 0 && invalidCount === 0) {
    console.log(
      `  OK: Local stroke-data corpus matches ${expectedFiles.size} unique writerChar values`,
    );
  }
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
  // --- Local stroke-data corpus ---
  console.log("\n[14] Local stroke-data corpus");
  await validateStrokeDataCorpus({ projectRoot, data, fail });

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
/**
 * @param {string[]} argv
 * @returns {{ root: string | null, error?: string }}
 */
export function parseValidatorArgs(argv) {
  const usage =
    "usage: node scripts/validate-radicals.mjs [--root <dir>]";
  const args = { root: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--root") {
      args.root = argv[i + 1];
      if (args.root === undefined) {
        args.error = `--root needs a directory — ${usage}`;
      }
      i += 1;
    } else {
      args.error = `unexpected argument: ${argv[i]} — ${usage}`;
      break;
    }
  }
  return args;
}
/**
 * Run only the local stroke-data corpus gate against a project root, reading
 * the radical dataset itself so tests can point at a fixture without
 * duplicating the dataset checks.
 *
 * @param {{ projectRoot?: string, data?: unknown[] }} [options]
 * @returns {Promise<{ errors: string[]; warnings: string[] }>}
 */
export async function validateProject({
  projectRoot = DEFAULT_PROJECT_ROOT,
  data,
} = {}) {
  const errors = [];
  const dataset =
    data ?? JSON.parse(await readFile(join(projectRoot, "src/data/radicals.json"), "utf-8"));
  await validateStrokeDataCorpus({
    projectRoot,
    data: dataset,
    fail: (message) => {
      errors.push(message);
    },
  });
  return { errors, warnings: [] };
}

function isMainModule(moduleUrl) {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === fileURLToPath(moduleUrl);
  } catch {
    return import.meta.url === pathToFileURL(entry).href;
  }
}

if (isMainModule(import.meta.url)) {
  const args = parseValidatorArgs(process.argv.slice(2));
  if (args.error) {
    console.error(args.error);
    process.exitCode = 1;
  } else {
    main().catch((e) => {
      console.error("Fatal error:", e);
      process.exitCode = 1;
    });
  }
}
