/**
 * Regression tests for the local stroke-data corpus gate.
 *
 * Fixtures live in temporary project roots so these tests never mutate the
 * checked-in public/stroke-data corpus.
 */
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import {
  strokeDataFilename,
  validateProject,
} from "../scripts/validate-radicals.mjs";

const TEMPLATE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VALIDATOR = join(TEMPLATE_ROOT, "scripts/validate-radicals.mjs");

let projectRoot;

after(() => {
  if (projectRoot) {
    rmSync(projectRoot, { recursive: true, force: true });
  }
});

function makeDataset(writerChars) {
  return Array.from({ length: 214 }, (_, index) => {
    const id = index + 1;
    return {
      id,
      character: String.fromCodePoint(0x4e00 + index),
      pinyin: "test",
      english: "test",
      vietnamese: "test",
      strokes: 1,
      frequency: "rare",
      icon: "test",
      writerChar: writerChars[index % writerChars.length],
      story: { en: "test", vi: "test" },
      examples: [
        {
          character: "甲",
          pinyin: "jiǎ",
          english: "first",
          vietnamese: "nhất",
        },
        {
          character: "由",
          pinyin: "yóu",
          english: "from",
          vietnamese: "từ",
        },
      ],
      illustration: null,
    };
  });
}

function makeProject({ writerChars = ["一", "中"], files = new Map() } = {}) {
  projectRoot = mkdtempSync(join(tmpdir(), "inkroots-stroke-corpus-"));
  mkdirSync(join(projectRoot, "src/data"), { recursive: true });
  mkdirSync(join(projectRoot, "public/stroke-data"), { recursive: true });
  writeFileSync(
    join(projectRoot, "src/data/radicals.json"),
    JSON.stringify(makeDataset(writerChars)),
    "utf-8",
  );

  for (const [filename, contents] of files) {
    writeFileSync(
      join(projectRoot, "public/stroke-data", filename),
      contents,
      "utf-8",
    );
  }

  return projectRoot;
}

describe("stroke-data filename mapping", () => {
  it("uses the literal character filename that the runtime URL resolves to", () => {
    assert.equal(strokeDataFilename("中"), "中.json");
    assert.notEqual(strokeDataFilename("中"), `${encodeURIComponent("中")}.json`);
  });
});

describe("local stroke-data corpus validation", () => {
  it("passes when every unique writerChar has a readable JSON file", async () => {
    const root = makeProject({
      files: new Map([
        ["一.json", "{}"],
        ["中.json", "{}"],
      ]),
    });

    const report = await validateProject({ projectRoot: root });

    assert.equal(report.errors.length, 0, report.errors.join("\n"));
  });

  it("fails when an expected stroke-data file is missing", async () => {
    const root = makeProject({ files: new Map([["一.json", "{}"]]) });

    const report = await validateProject({ projectRoot: root });

    assert.ok(
      report.errors.some((error) =>
        error.includes(
          "Missing local stroke-data file: public/stroke-data/中.json",
        ),
      ),
      report.errors.join("\n"),
    );
  });

  it("fails when an expected stroke-data file contains malformed JSON", async () => {
    const root = makeProject({
      files: new Map([
        ["一.json", "{}"],
        ["中.json", "{not-json"],
      ]),
    });

    const report = await validateProject({ projectRoot: root });

    assert.ok(
      report.errors.some((error) =>
        error.includes("Invalid JSON in public/stroke-data/中.json"),
      ),
      report.errors.join("\n"),
    );
  });

  it("fails when an unexpected JSON file remains in the corpus", async () => {
    const root = makeProject({
      files: new Map([
        ["一.json", "{}"],
        ["中.json", "{}"],
        ["unexpected.json", "{}"],
      ]),
    });

    const report = await validateProject({ projectRoot: root });

    assert.ok(
      report.errors.some((error) =>
        error.includes(
          "Unexpected local stroke-data file: public/stroke-data/unexpected.json",
        ),
      ),
      report.errors.join("\n"),
    );
  });

  it("fails when the stroke-data directory is missing", async () => {
    const root = makeProject({
      files: new Map([
        ["一.json", "{}"],
        ["中.json", "{}"],
      ]),
    });
    rmSync(join(root, "public/stroke-data"), { recursive: true, force: true });

    const report = await validateProject({ projectRoot: root });

    assert.ok(
      report.errors.some((error) =>
        error.includes("Stroke-data directory is missing: public/stroke-data"),
      ),
      report.errors.join("\n"),
    );
  });
});

describe("validator CLI", () => {
  it("exits non-zero for a malformed expected stroke-data file", async () => {
    const root = makeProject({
      files: new Map([
        ["一.json", "{}"],
        ["中.json", "{not-json"],
      ]),
    });

    const result = spawnSync(process.execPath, [VALIDATOR, "--root", root], {
      encoding: "utf8",
      windowsHide: true,
    });

    assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /Invalid JSON in public\/stroke-data\/中\.json/,
    );
  });

  it("exits zero for a valid corpus", async () => {
    const root = makeProject({
      files: new Map([
        ["一.json", "{}"],
        ["中.json", "{}"],
      ]),
    });

    const result = spawnSync(process.execPath, [VALIDATOR, "--root", root], {
      encoding: "utf8",
      windowsHide: true,
    });

    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  });
});
