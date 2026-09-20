# Local cleanup audit

This package is the application extracted from the Grok Build Beta workspace and prepared for normal local development.

## Removed

- `.grok/` project metadata, skills, references, preview state, and app environment files
- `.vercel/` generated deployment output
- `.tanstack/` temporary build data
- Grok preview/PWA bridge and branding middleware
- Grok-specific helper scripts (`with-app-env`, app-env plugin, PWA plugin, preview/smoke/brand checks, auth invariant checks, etc.)
- Grok-only `server/` files
- Better Auth, Postgres, PGlite, Kysely, JWT/OAuth support, and related auth/app-data template code
- Template-only dependencies that are not used by the app
- Grok-generated screenshot QA artifacts and workspace metadata

## Kept

- The actual Ink Roots React/TanStack Start application
- `src/data/radicals.json` with all 214 radicals
- Styling, icons, stroke-order UI, quiz, bilingual UI, and local progress storage
- `scripts/generate-radicals.py` for data regeneration
- `public/` application assets, including the share card and reference data files
- Original project brief and Grok response under `docs/` for provenance/reference only

## Runtime model

The cleaned app has no required environment variables, accounts, database, API keys, or Grok services. Learner progress and language selection remain in browser `localStorage`.
