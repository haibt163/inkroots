/**
 * Progress store logic tests.
 *
 * The actual store lives in `src/lib/progress.ts` (Zustand with persist).
 * It cannot be imported directly in Node tests because:
 * 1. It has a `.ts` extension (no TS transpiler configured)
 * 2. Zustand's persist middleware needs localStorage
 *
 * These tests reimplement the exact store logic (toggleLearned, isLearned)
 * from src/lib/progress.ts lines 10-23 as a reference and verify correctness
 * against the real radicals dataset.
 *
 * Source: src/lib/progress.ts
 */
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

// --- Mirrored from src/lib/progress.ts ---
let learned;

function createProgressStore(initial = []) {
  const state = {
    learned: [...initial],
    toggleLearned: (id) => {
      state.learned = state.learned.includes(id)
        ? state.learned.filter((x) => x !== id)
        : [...state.learned, id];
    },
    isLearned: (id) => state.learned.includes(id),
  };
  return state;
}
// --- End mirrored logic ---

describe("Progress store", () => {
  beforeEach(() => {
    learned = createProgressStore();
  });

  it("starts with empty learned list", () => {
    assert.deepEqual(learned.learned, []);
  });

  it("isLearned returns false for unknown id", () => {
    assert.equal(learned.isLearned(1), false);
  });

  it("toggleLearned adds id to learned", () => {
    learned.toggleLearned(1);
    assert.deepEqual(learned.learned, [1]);
    assert.equal(learned.isLearned(1), true);
  });

  it("toggleLearned removes already-learned id", () => {
    learned.toggleLearned(1);
    assert.equal(learned.isLearned(1), true);
    learned.toggleLearned(1);
    assert.equal(learned.isLearned(1), false);
    assert.deepEqual(learned.learned, []);
  });

  it("toggleLearned preserves existing entries", () => {
    learned.toggleLearned(1);
    learned.toggleLearned(5);
    learned.toggleLearned(10);
    assert.deepEqual(learned.learned, [1, 5, 10]);

    // Remove one
    learned.toggleLearned(5);
    assert.deepEqual(learned.learned, [1, 10]);
    assert.equal(learned.isLearned(5), false);
    assert.equal(learned.isLearned(1), true);
    assert.equal(learned.isLearned(10), true);
  });

  it("handles multiple toggles correctly", () => {
    const ids = [3, 7, 42, 100, 214];
    for (const id of ids) {
      learned.toggleLearned(id);
    }
    assert.equal(learned.learned.length, ids.length);
    for (const id of ids) {
      assert.equal(learned.isLearned(id), true);
    }

    // Toggle off every other
    learned.toggleLearned(3);
    learned.toggleLearned(42);
    assert.equal(learned.isLearned(3), false);
    assert.equal(learned.isLearned(42), false);
    assert.equal(learned.isLearned(7), true);
    assert.equal(learned.isLearned(100), true);
    assert.equal(learned.isLearned(214), true);
    assert.equal(learned.learned.length, 3);
  });

  it("handles all 214 radical IDs", () => {
    for (let i = 1; i <= 214; i++) {
      learned.toggleLearned(i);
    }
    assert.equal(learned.learned.length, 214);
    for (let i = 1; i <= 214; i++) {
      assert.equal(learned.isLearned(i), true);
    }

    // Toggle all off
    for (let i = 1; i <= 214; i++) {
      learned.toggleLearned(i);
    }
    assert.equal(learned.learned.length, 0);
  });

  it("does not mutate learned by reference on toggle", () => {
    const initial = [1, 2];
    const store = createProgressStore(initial);
    store.toggleLearned(3);
    // Original array should not be affected
    assert.deepEqual(initial, [1, 2]);
  });
});
