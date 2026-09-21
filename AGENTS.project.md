# Ink Roots — Project Instructions

## 1. Project

**Ink Roots — 214 Chinese Radicals Learning App**

Repository:

`haibt163/inkroots`

Primary development branch:

`laguna`

Historical baseline:

`main`

---

## 2. Project Mission

Ink Roots is an interactive learning application for the 214 Kangxi Chinese
radicals.

The application is designed for learners who benefit from:

- visual radical recognition
- stroke-order learning
- Mandarin pronunciation
- example characters
- English explanations
- Vietnamese explanations
- short mnemonic/story support
- interactive practice

The original product specification is:

`docs/build-brief.md`

Treat that document as the historical product brief and preserve it.

---

## 3. Historical Baselines

### `main`

`main` represents the preserved **Grok Original** project.

It exists so that the original generated application can always be recovered
and compared against later engineering work.

Do not "improve" `main` as part of normal development.

### `laguna`

`laguna` represents:

**Grok Original + Laguna engineering hardening**

Laguna introduced substantial engineering work including:

- local stroke-data bundling
- dataset validation
- automated tests
- stronger type safety
- improved tooling portability
- engineering documentation
- build configuration improvements

Treat those changes as existing project infrastructure.

Do not repeat them unless verification demonstrates that they are incomplete
or defective.

---

## 4. Important Historical Documentation

The following documents remain relevant:

### `docs/build-brief.md`

Original product/build specification.

Use it to understand intended product behavior and acceptance criteria.

### `docs/grok-original-response.md`

Historical record of the original Grok Build implementation and its reported
features.

Do not treat its claims as stronger than current executable verification.

### `docs/agent-audits/`

Historical engineering investigation and implementation records.

These documents explain what earlier agents investigated, discovered, changed,
and deferred.

Preserve them as project history.

---

## 5. Current Architecture

The project is a Vite + React application using:

- React
- TypeScript
- Vite
- TanStack Start / Router
- Tailwind CSS
- Zustand
- Hanzi Writer
- Lucide icons
- Nitro/Vercel integration

The canonical package scripts are defined in `package.json`.

Do not introduce a new framework merely to solve a local engineering problem.

---

## 6. Radical Dataset

Canonical dataset:

`src/data/radicals.json`

Expected records:

**214**

The dataset contains fields including:

- `id`
- `character`
- `pinyin`
- `english`
- `vietnamese`
- `strokes`
- `frequency`
- `icon`
- `writerChar`
- `story`
- `examples`
- `illustration`

The dataset validator is:

`scripts/validate-radicals.mjs`

Do not mass-edit stories, translations, meanings, or illustrations during
engineering hardening unless explicitly requested.

---

## 7. Stroke Data Architecture

Local stroke data lives at:

`public/stroke-data/`

The runtime component is:

`src/components/stroke-writer.tsx`

The intended runtime order is:

```text
local stroke data
      ↓
CDN fallback where currently implemented
      ↓
static glyph fallback

The local corpus is generated/maintained using:

scripts/fetch-stroke-data.mjs

The dataset's unique writerChar values are the source of truth for the
required local stroke-data set.

A valid project state requires the dataset and local stroke-data corpus to
remain consistent.

8. Current Engineering CR

The current outstanding engineering requirement is:

CR-2 — Validate the Local Stroke-Data Corpus

The dataset validator must verify that:

public/stroke-data/ exists
every unique writerChar has a corresponding JSON file
every expected file contains valid JSON
unexpected JSON files are detected
filename mapping agrees with the runtime loader
critical violations cause a non-zero exit status

The validator must remain standalone and runnable with:

node scripts/validate-radicals.mjs

Tests should cover meaningful failure cases where practical.

9. Explicitly Deferred Work

The following are not part of CR-2:

rewriting the 198 generic/template stories
generating 214 custom illustrations
replacing the Web Speech API
redesigning the UI
replacing Hanzi Writer
removing the CDN fallback
introducing virtualization
adding a PWA
adding dark mode
broad accessibility redesign
broad dependency upgrades

Do not expand the CR into these areas without explicit authorization.

10. Build and Verification Gates

Before declaring the CR complete:

npm test
npm run typecheck
npm run lint
npm run build
node scripts/validate-radicals.mjs

If a command fails, investigate the actual failure.

Do not hide, downgrade, or bypass the failure simply to obtain a green result.

11. Git Rules

Work on:

laguna

Do not modify main.

Do not force-push.

Do not merge automatically.

Keep the CR commit focused.

Preferred commit style:

Validate local stroke-data corpus

or an equivalent concise description.

12. Definition of Done

CR-2 is complete when:

validator checks the local stroke corpus
negative cases are meaningfully covered by tests
all existing tests pass
typecheck passes
lint passes or documented pre-existing exceptions remain
production build passes
validator passes
no unrelated project behavior was changed
Git diff is focused and reviewable
documentation accurately describes the resulting architecture