# Ink Roots

A bilingual (English / Vietnamese) learning app for the **214 Kangxi radicals**. Each radical has stroke-order animation, Mandarin pronunciation, a short mnemonic, and example words.

## Stack

- TanStack Start + React 19
- Vite + Tailwind CSS v4
- Zustand (learned radicals, persisted locally)
- [hanzi-writer](https://github.com/chanind/hanzi-writer) for stroke order
- Web Speech API (`zh-CN`) for pronunciation

The app is **local-first**: no account system, no database, no Grok runtime, and no required environment variables.

## Run locally

Requirements: Node.js 20.19+ (or 22.12+) and npm 10+. Node 22 is recommended.

### Windows CMD / PowerShell

From the project folder:

```text
npm install
npm run dev
```

Open `http://localhost:8080`. Stop the server with `Ctrl+C`.

For a clean reinstall later:

```text
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Production-style local test

```text
npm run build
npm run preview
```

Then open `http://localhost:8081`.

## Data

The 214-radical dataset lives in `src/data/radicals.json` and can be regenerated with:

```bash
python3 scripts/generate-radicals.py
```

## Stroke data architecture

Stroke data for all 212 unique `writerChar` values is bundled locally under `public/stroke-data/`. The `StrokeWriter` component tries the local file first:

```
/stroke-data/{encodeURIComponent(char)}.json
```

If the local file is missing or the fetch fails, it falls back to the CDN URL
`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/{char}.json`.

This makes stroke animation fully local-first: the CDN is a safety net, not a
primary dependency. To re-download all stroke data files:

```bash
node scripts/fetch-stroke-data.mjs
```

## Scripts

All scripts live in `scripts/`.

| Script | Command | Description |
|--------|---------|-------------|
| Dataset validator | `node scripts/validate-radicals.mjs` | Checks dataset integrity: 214 records, sequential IDs, required fields, valid types, examples ≥ 2 each |
| Stroke data fetcher | `node scripts/fetch-stroke-data.mjs` | Downloads all 212 stroke-data JSON files from CDN to `public/stroke-data/` |
| Radical generator | `python3 scripts/generate-radicals.py` | Regenerates `src/data/radicals.json` from source data (default output path is project-relative) |

## Testing

```bash
npm test
```

Runs all `.test.mjs` files under `test/` using Node's built-in test runner. Currently covers:
- Dataset integrity (record count, IDs, required fields, types)
- Search/filter logic (matchesQuery, filterRadicals)
- Progress store (toggle, persistence, edge cases)
- i18n dictionary parity (en and vi have matching keys)

To run the dataset validator separately:

```bash
node scripts/validate-radicals.mjs
```

## Known limitations

- Illustration field (`illustration`) is `null` on all 214 records; icons serve as visual anchors instead.
- Tests cannot import `.ts` source modules directly (no TS transpiler configured); pure-logic tests reimplement the relevant functions inline with source references in comments.

## Features

- Browse, search, and filter all 214 radicals by stroke count and frequency
- Detail pages with stroke-order animation, trace-it interaction, audio, examples, and stories
- Instant English ↔ Vietnamese UI
- Meaning quiz on `/practice`
- Mark radicals as learned; progress is saved in this device's `localStorage`

## Project notes

The original Grok Build Beta workspace and its platform-generated files were removed from this local copy. The original build brief and Grok response are preserved under `docs/` as reference material.
