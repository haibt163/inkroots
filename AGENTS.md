# Ink Roots — Repository Agent Instructions

## Purpose

This repository contains **Ink Roots**, a bilingual English/Vietnamese learning
application for the 214 Kangxi Chinese radicals.

These instructions apply to all coding agents working anywhere in this
repository.

The repository is intentionally maintained as an engineering project rather
than as a disposable generated-app workspace.

---

## 1. Source-of-Truth Hierarchy

When sources disagree, use this order:

1. The current source code and executable behavior
2. `AGENTS.project.md`
3. `.omp/AGENTS.md`
4. `.omp/RULES.md`
5. `docs/build-brief.md`
6. Historical engineering documentation under `docs/`
7. Historical agent outputs and audit reports

Historical documents describe what happened at a particular point in time.
Do not silently rewrite history to make an old report agree with the current
implementation.

When changing behavior, update current project documentation where appropriate
while preserving historical audit material.

---

## 2. Project Identity

Project:

**Ink Roots — 214 Chinese Radicals Learning App**

Primary capabilities include:

- 214 Kangxi radicals
- English / Vietnamese bilingual interface
- radical meanings and Pinyin
- example characters / words
- stroke-order animation
- stroke tracing / quiz interaction
- Mandarin pronunciation through the browser speech API
- search and filtering
- local learning state
- responsive UI

The original product requirements are documented in:

`docs/build-brief.md`

Do not replace that document with a rewritten interpretation.

---

## 3. Engineering Principles

### 3.1 Preserve working behavior

Do not make broad architectural changes when a narrow change satisfies the
requirement.

Do not refactor unrelated code merely because it could be cleaner.

### 3.2 Prefer deterministic behavior

Data generation, validation, tests, and build processes should be reproducible.

Avoid machine-specific paths, temporary directories, hidden assumptions, and
environment-specific behavior.

### 3.3 Validate claims

Never claim that a feature, test, build, or migration succeeded unless it was
actually verified.

If verification is unavailable, explicitly state the limitation.

### 3.4 Keep failures meaningful

Validation and tests should fail non-zero when an important invariant is
violated.

Do not convert critical failures into warnings merely to obtain a green run.

### 3.5 Keep runtime fallbacks intentional

If the application contains a fallback path, document it and preserve its
intended ordering.

Do not silently remove a fallback during unrelated engineering work.

---

## 4. Dataset Discipline

The radical dataset is a core project asset.

The expected canonical dataset contains:

- exactly 214 records
- IDs 1–214
- unique radical characters
- valid `writerChar` values
- meanings in English and Vietnamese
- Pinyin
- stroke counts
- stories
- examples
- illustration fields

Do not mass-rewrite educational content during engineering tasks unless the
task explicitly concerns content quality.

Content-quality issues discovered during engineering work should be documented
rather than opportunistically rewritten.

---

## 5. Local Stroke Data

The Laguna engineering branch introduced a local-first stroke-data corpus:

`public/stroke-data/`

The runtime should prefer local stroke data.

The current runtime may retain a CDN fallback where intentionally implemented.
Do not remove that fallback unless the task explicitly calls for an offline-only
architecture.

The dataset and local stroke corpus must remain consistent.

The validator is an engineering gate, not merely an informational report.

---

## 6. Tests and Verification

Before declaring a substantive engineering task complete, use the project's
available verification commands.

At minimum, where applicable:

```text
npm test
npm run typecheck
npm run lint
npm run build
```

For dataset changes:

node scripts/validate-radicals.mjs
```

Tests must test real behavior.

Do not create tests whose only purpose is to make an implementation appear
verified.

7. Git Discipline

The repository contains deliberately preserved historical branches.

main

main is the preserved Grok Original baseline.

Do not modify, rewrite, reset, or force-push main during normal engineering
work.

laguna

laguna contains the Grok + Laguna engineering improvements.

Normal engineering work for the current project should occur on laguna
unless another branch is explicitly designated.

Never force-push.

Never silently merge branches.

Do not create a pull request or merge one unless explicitly requested.

Before committing:

```text
git status
git diff
```

After committing:

git status
git log --oneline --decorate -3
```

Keep commits focused and descriptive.

8. Documentation Discipline

The docs/ directory contains valuable project history.

Do not delete historical audit reports simply because their findings have since
been addressed.

Do not rewrite historical reports to reflect later implementation.

If a historical finding is resolved, document the resolution in a current
engineering document or commit history.

9. Security

Never commit:

API keys
access tokens
passwords
private credentials
.env secrets
personal authentication data

Inspect generated files before committing.

10. Scope Control

For a defined change request:

understand the requested change
inspect the existing implementation
identify the smallest correct change
implement it
test it
inspect the diff
report remaining limitations

Do not turn a narrowly scoped CR into an unsolicited redesign.

11. Agent Reporting

At the end of an engineering task, report:

what changed
why it changed
files changed
tests run
test results
build/typecheck/lint results
remaining limitations
whether a commit was made

Use factual language.

Do not claim production readiness unless the relevant acceptance criteria have
actually been verified.