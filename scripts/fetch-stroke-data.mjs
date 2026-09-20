#!/usr/bin/env node
/**
 * Downloads Hanzi Writer stroke data for all radicals in the dataset.
 * Data is fetched from the hanzi-writer-data CDN and stored locally
 * in public/stroke-data/ for offline-first stroke animation.
 *
 * Usage: node scripts/fetch-stroke-data.mjs
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

// Source of truth: the radicals dataset
const radicalsPath = join(projectRoot, "src/data/radicals.json");
const outputDir = join(projectRoot, "public/stroke-data");

// CDN source (fallback path)
const CDN_BASE = "https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1";

/**
 * @param {string} char - The Hanzi character to fetch stroke data for.
 * @returns {Promise<object|null>} The stroke data object, or null if fetch failed.
 */
async function fetchStrokeData(char) {
  const url = `${CDN_BASE}/${encodeURIComponent(char)}.json`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      console.error(`  HTTP ${res.status} for ${char}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") {
      console.error(`  Timeout fetching ${char}`);
    } else {
      console.error(`  Fetch error for ${char}: ${err.message}`);
    }
    return null;
  }
}

async function main() {
  console.log("Reading radicals dataset...");
  const raw = await readFile(radicalsPath, "utf-8");
  const data = JSON.parse(raw);

  // Collect unique writerChar values — these are the characters
  // that Hanzi Writer will attempt to render.
  const writerChars = [...new Set(data.map((r) => r.writerChar))].sort();
  console.log(`Found ${writerChars.length} unique writerChar values to fetch.`);

  await mkdir(outputDir, { recursive: true });

  let successCount = 0;
  let missingCount = 0;
  const missing = [];

  for (const char of writerChars) {
    const data = await fetchStrokeData(char);
    if (data) {
      // Save using the actual character as filename — Vite (and most HTTP
      // servers) decode %XX sequences before serving static files, so the
      // file must be named with the literal character, not the encoded form.
      const filename = char + ".json";
      const outPath = join(outputDir, filename);
      await writeFile(outPath, JSON.stringify(data), "utf-8");
      successCount++;
      // Brief progress indicator
      if (successCount % 20 === 0) {
        console.log(`  ...${successCount}/${writerChars.length} downloaded`);
      }
    } else {
      missingCount++;
      missing.push(char);
      console.warn(`  MISSING: ${char} (no stroke data available)`);
    }
  }

  console.log(`\nDone: ${successCount} downloaded, ${missingCount} missing.`);
  if (missing.length > 0) {
    console.warn(`\nCharacters without stroke data (${missing.length}):`);
    console.warn(missing.join(" "));
    console.warn(
      "\nThese characters will fall back to static glyph display in the app."
    );
  } else {
    console.log(
      "\nAll characters have local stroke data — fully local-first."
    );
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
