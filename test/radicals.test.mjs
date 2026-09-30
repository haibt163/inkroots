/**
 * Dataset integrity tests for radicals.json.
 *
 * These tests verify the raw JSON data structure directly — no TypeScript
 * transpilation required. The data is imported using Node's native JSON
 * module support (`with { type: 'json' }`).
 *
 * Source: src/data/radicals.json
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import data from "../src/data/radicals.json" with { type: "json" };

const RADICALS = data; // JSON imported as array directly

describe("Dataset integrity", () => {
  it("has exactly 214 records", () => {
    assert.equal(RADICALS.length, 214, "Expected 214 radicals in dataset");
  });

  it("has sequential IDs from 1 to 214", () => {
    for (let i = 0; i < RADICALS.length; i++) {
      assert.equal(
        RADICALS[i].id,
        i + 1,
        `Radical at index ${i} has id ${RADICALS[i].id}, expected ${i + 1}`,
      );
    }
  });

  it("has no duplicate IDs", () => {
    const ids = RADICALS.map((r) => r.id);
    const unique = new Set(ids);
    assert.equal(unique.size, ids.length, "Duplicate IDs found");
  });

  it("has unique characters", () => {
    const chars = RADICALS.map((r) => r.character);
    const unique = new Set(chars);
    assert.equal(unique.size, chars.length, "Duplicate characters found");
  });

  it("has no duplicate writerChar values that should be unique", () => {
    // writerChar may be shared if two radicals use the same substitute
    // glyph, so we only check for presence, not uniqueness
    const writerChars = RADICALS.map((r) => r.writerChar);
    const empty = writerChars.filter((w) => !w || w.length === 0);
    assert.equal(empty.length, 0, "Some radicals have empty writerChar");
  });
});

describe("Required fields", () => {
  const REQUIRED = [
    "id", "character", "pinyin", "english", "vietnamese",
    "strokes", "frequency", "icon", "writerChar", "story", "examples",
  ];

  it("all records have required fields", () => {
    for (const r of RADICALS) {
      for (const field of REQUIRED) {
        assert.ok(
          field in r && r[field] !== undefined && r[field] !== null,
          `Radical id=${r.id} missing field: ${field}`,
        );
      }
    }
  });

  it("all ids are positive integers", () => {
    for (const r of RADICALS) {
      assert.equal(
        typeof r.id, "number",
        `Radical character=${r.character}: id must be number, got ${typeof r.id}`,
      );
      assert.ok(
        Number.isInteger(r.id) && r.id > 0,
        `Radical id=${r.id}: must be positive integer`,
      );
    }
  });

  it("all strokes are positive integers", () => {
    for (const r of RADICALS) {
      assert.equal(
        typeof r.strokes, "number",
        `Radical id=${r.id}: strokes must be number`,
      );
      assert.ok(
        Number.isInteger(r.strokes) && r.strokes > 0 && r.strokes <= 30,
        `Radical id=${r.id}: strokes must be 1–30, got ${r.strokes}`,
      );
    }
  });

  it("all frequency values are valid", () => {
    const valid = new Set(["core", "common", "rare"]);
    for (const r of RADICALS) {
      assert.ok(
        valid.has(r.frequency),
        `Radical id=${r.id}: invalid frequency '${r.frequency}'`,
      );
    }
  });

  it("all pinyin, english, vietnamese are non-empty strings", () => {
    for (const r of RADICALS) {
      assert.ok(
        typeof r.pinyin === "string" && r.pinyin.trim().length > 0,
        `Radical id=${r.id}: pinyin must be non-empty string`,
      );
      assert.ok(
        typeof r.english === "string" && r.english.trim().length > 0,
        `Radical id=${r.id}: english must be non-empty string`,
      );
      assert.ok(
        typeof r.vietnamese === "string" && r.vietnamese.trim().length > 0,
        `Radical id=${r.id}: vietnamese must be non-empty string`,
      );
    }
  });
});

describe("Story structure", () => {
  it("all stories have en and vi properties", () => {
    for (const r of RADICALS) {
      assert.ok(
        typeof r.story === "object" && r.story !== null,
        `Radical id=${r.id}: story must be object`,
      );
      assert.ok(
        typeof r.story.en === "string" && r.story.en.trim().length > 0,
        `Radical id=${r.id}: story.en must be non-empty`,
      );
      assert.ok(
        typeof r.story.vi === "string" && r.story.vi.trim().length > 0,
        `Radical id=${r.id}: story.vi must be non-empty`,
      );
    }
  });

  it("at least some stories are custom (not generic templates)", () => {
    const templatePrefix = "This radical pictures";
    const custom = RADICALS.filter(
      (r) => !r.story.en.startsWith(templatePrefix),
    );
    assert.ok(
      custom.length > 0,
      "Expected at least some custom stories, found none",
    );
  });
});

describe("Examples structure", () => {
  it("all radicals have at least 2 examples", () => {
    for (const r of RADICALS) {
      assert.ok(
        Array.isArray(r.examples) && r.examples.length >= 2,
        `Radical id=${r.id}: must have >= 2 examples`,
      );
    }
  });

  it("all examples have required fields", () => {
    const REQUIRED_EX = ["character", "pinyin", "english", "vietnamese"];
    for (const r of RADICALS) {
      for (let i = 0; i < r.examples.length; i++) {
        const ex = r.examples[i];
        for (const field of REQUIRED_EX) {
          assert.ok(
            typeof ex[field] === "string" && ex[field].trim().length > 0,
            `Radical id=${r.id} example[${i}]: missing/empty field ${field}`,
          );
        }
      }
    }
  });

  it("example characters are non-empty strings", () => {
    for (const r of RADICALS) {
      for (const ex of r.examples) {
        assert.ok(
          typeof ex.character === "string" && ex.character.length > 0,
          `Radical id=${r.id}: example character must be non-empty`,
        );
      }
    }
  });
});

describe("Icon field", () => {
  it("all icons are non-empty strings", () => {
    for (const r of RADICALS) {
      assert.ok(
        typeof r.icon === "string" && r.icon.trim().length > 0,
        `Radical id=${r.id}: icon must be non-empty string`,
      );
    }
  });
});
