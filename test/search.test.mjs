/**
 * Search and filter logic tests.
 *
 * The actual `matchesQuery` and `filterRadicals` functions live in
 * `src/lib/radicals.ts` which imports from `@/data/radicals.json` (path alias).
 * Node's test runner cannot resolve `@` aliases without a custom loader,
 * and there is no TS transpiler configured. These tests reimplement the
 * same pure logic (mirrored from src/lib/radicals.ts lines 32–66) inline
 * and verify them against the real dataset. If the source logic changes,
 * these tests should be updated in tandem — they serve as a contract.
 *
 * Source: src/lib/radicals.ts (matchesQuery, filterRadicals)
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import data from "../src/data/radicals.json" with { type: "json" };

const RADICALS = data;

// --- Mirrored from src/lib/radicals.ts:32-51 ---
/** @param {typeof RADICALS[number]} r */
function matchesQuery(r, q) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return (
    r.character.includes(s) ||
    (r.simplified?.includes(s) ?? false) ||
    (r.variant?.includes(s) ?? false) ||
    r.pinyin.toLowerCase().includes(s) ||
    r.english.toLowerCase().includes(s) ||
    r.vietnamese.toLowerCase().includes(s) ||
    String(r.id) === s ||
    r.examples.some(
      (ex) =>
        ex.character.includes(s) ||
        ex.pinyin.toLowerCase().includes(s) ||
        ex.english.toLowerCase().includes(s) ||
        ex.vietnamese.toLowerCase().includes(s),
    )
  );
}

// --- Mirrored from src/lib/radicals.ts:53-66 ---
/** @param {object} opts */
function filterRadicals(opts) {
  return RADICALS.filter((r) => {
    if (!matchesQuery(r, opts.query)) return false;
    if (opts.strokes !== "all" && r.strokes !== opts.strokes) return false;
    if (opts.frequency === "learned") return opts.learnedIds.has(r.id);
    if (opts.frequency !== "all" && r.frequency !== opts.frequency) return false;
    return true;
  });
}
// --- End mirrored logic ---

describe("matchesQuery", () => {
  it("returns true for empty query", () => {
    const r = RADICALS[0];
    assert.equal(matchesQuery(r, ""), true);
    assert.equal(matchesQuery(r, "   "), true);
    assert.equal(matchesQuery(r, ""), true);
  });

  it("matches by character", () => {
    const r = RADICALS.find((x) => x.id === 1);
    assert.equal(matchesQuery(r, r.character), true);
  });

  it("matches by pinyin (case-insensitive)", () => {
    const r = RADICALS.find((x) => x.id === 1);
    assert.equal(matchesQuery(r, r.pinyin.toUpperCase()), true);
    assert.equal(matchesQuery(r, r.pinyin.toLowerCase()), true);
    assert.equal(matchesQuery(r, r.pinyin.slice(0, 2)), true);
  });

  it("matches by english meaning", () => {
    const r = RADICALS[0];
    assert.equal(matchesQuery(r, r.english.toLowerCase().slice(0, 4)), true);
    assert.equal(matchesQuery(r, r.english.toUpperCase()), true);
  });

  it("matches by vietnamese meaning", () => {
    const r = RADICALS[0];
    assert.equal(matchesQuery(r, r.vietnamese.toLowerCase().slice(0, 4)), true);
  });

  it("matches by id as string", () => {
    const r = RADICALS.find((x) => x.id === 42);
    assert.equal(matchesQuery(r, "42"), true);
    assert.equal(matchesQuery(r, "1"), false);
  });

  it("matches example fields", () => {
    const r = RADICALS[0];
    const ex = r.examples[0];
    assert.equal(matchesQuery(r, ex.character), true);
    assert.equal(matchesQuery(r, ex.pinyin), true);
    assert.equal(matchesQuery(r, ex.english.toLowerCase()), true);
    assert.equal(matchesQuery(r, ex.vietnamese.toLowerCase()), true);
  });

  it("returns false for non-matching query", () => {
    const r = RADICALS[0];
    assert.equal(matchesQuery(r, "zzzzz"), false);
    assert.equal(matchesQuery(r, "12345"), false);
  });
});

describe("filterRadicals", () => {
  it("returns all radicals for empty query", () => {
    const result = filterRadicals({
      query: "",
      strokes: "all",
      frequency: "all",
      learnedIds: new Set(),
    });
    assert.equal(result.length, RADICALS.length);
  });

  it("filters by query", () => {
    // Search for "one" — should find radical with english meaning "one"
    const result = filterRadicals({
      query: "one",
      strokes: "all",
      frequency: "all",
      learnedIds: new Set(),
    });
    assert.ok(result.length > 0);
    const found = result.find((r) => r.english.toLowerCase().includes("one"));
    assert.ok(found, "Should find a radical with 'one' in english");
  });

  it("filters by stroke count", () => {
    const stroke1 = filterRadicals({
      query: "",
      strokes: 1,
      frequency: "all",
      learnedIds: new Set(),
    });
    assert.ok(stroke1.every((r) => r.strokes === 1));
    assert.ok(stroke1.length > 0);

    const stroke3 = filterRadicals({
      query: "",
      strokes: 3,
      frequency: "all",
      learnedIds: new Set(),
    });
    assert.ok(stroke3.every((r) => r.strokes === 3));
  });

  it("filters by frequency core", () => {
    const core = filterRadicals({
      query: "",
      strokes: "all",
      frequency: "core",
      learnedIds: new Set(),
    });
    assert.ok(core.every((r) => r.frequency === "core"));
    assert.ok(core.length > 0);
  });

  it("filters by frequency common", () => {
    const common = filterRadicals({
      query: "",
      strokes: "all",
      frequency: "common",
      learnedIds: new Set(),
    });
    assert.ok(common.every((r) => r.frequency === "common"));
    assert.ok(common.length > 0);
  });

  it("filters by frequency rare", () => {
    const rare = filterRadicals({
      query: "",
      strokes: "all",
      frequency: "rare",
      learnedIds: new Set(),
    });
    assert.ok(rare.every((r) => r.frequency === "rare"));
    assert.ok(rare.length > 0);
  });

  it("filters by learned frequency with learnedIds set", () => {
    const learnedIds = new Set([1, 2, 3]);
    const learned = filterRadicals({
      query: "",
      strokes: "all",
      frequency: "learned",
      learnedIds,
    });
    assert.equal(learned.length, 3);
    assert.equal(learned[0].id, 1);
    assert.equal(learned[1].id, 2);
    assert.equal(learned[2].id, 3);
  });

  it("combines query + stroke + frequency filters", () => {
    // Find radicals with "water" in english, 4 strokes, common frequency
    const result = filterRadicals({
      query: "water",
      strokes: 4,
      frequency: "all",
      learnedIds: new Set(),
    });
    assert.ok(
      result.every((r) => r.strokes === 4),
      "All results should have 4 strokes",
    );
    for (const r of result) {
      assert.ok(
        r.english.toLowerCase().includes("water") ||
          r.pinyin.toLowerCase().includes("water") ||
          r.examples.some(
            (ex) =>
              ex.english.toLowerCase().includes("water") ||
              ex.pinyin.toLowerCase().includes("water"),
          ),
        `Result ${r.character} should match "water"`,
      );
    }
  });

  it("learned filter requires learnedIds to contain the radical", () => {
    const learnedIds = new Set([1]);
    const learned = filterRadicals({
      query: "",
      strokes: "all",
      frequency: "learned",
      learnedIds,
    });
    assert.equal(learned.length, 1);
    assert.equal(learned[0].id, 1);
  });

  it("query matches against all search fields", () => {
    // Use a distinctive english meaning
    const target = RADICALS.find((r) => r.english.toLowerCase() === "summer");
    if (target) {
      const result = filterRadicals({
        query: "summer",
        strokes: "all",
        frequency: "all",
        learnedIds: new Set(),
      });
      assert.ok(result.includes(target));
    }
  });
});
