# OMP Agent Instructions — Ink Roots

## Purpose

This file defines how OMP agents should operate when working on the Ink Roots
repository.

OMP is the coding harness.

The model is the implementation agent.

Git remains the project version-control authority.

---

## 1. Establish Context Before Editing

Before modifying code:

1. read `AGENTS.md`
2. read `AGENTS.project.md`
3. read `.omp/RULES.md`
4. inspect the relevant source files
5. inspect relevant historical documentation when the task references prior
   implementation work

Do not assume that a previous agent's report is equivalent to the current
filesystem state.

Verify important claims against the repository.

---

## 2. Preserve the Historical Baseline

The repository deliberately preserves:

```text
main   = Grok Original
laguna = Grok + Laguna engineering work

Agents working on the current engineering project operate on laguna.

Never use main as a scratch branch.

Never reset main to make a local test convenient.
```

3. Inspect Before Implementing

For every non-trivial task:

Understand
    ↓
Inspect current implementation
    ↓
Identify exact gap
    ↓
Plan smallest correct change
    ↓
Implement
    ↓
Test
    ↓
Review diff

Do not implement from the task description alone when repository evidence is
available.

4. No False Completion

An agent must never report:

"implemented" without checking the resulting files
"tested" without actually running the test
"build passes" without running the build
"all data exists" without validating the data
"offline" when a network fallback remains
"production ready" without satisfying the relevant acceptance criteria

If an environment limitation prevents verification, report it explicitly.

5. Narrow Change Rule

When given a CR:

implement the CR
fix defects directly caused by the CR
avoid unrelated refactors
avoid aesthetic rewrites
avoid dependency upgrades unless required
avoid changing historical content

The goal is a reviewable engineering patch.

6. Tests Are Part of the Implementation

If the CR introduces a new invariant, add executable verification for that
invariant.

Prefer tests that can demonstrate both:

valid state → passes
invalid state → fails
```

Do not create tests that merely inspect source-code strings unless that is the
actual behavior being tested.

7. Documentation

Preserve historical documents.

If current behavior changes:

update current documentation where useful
do not rewrite historical agent reports
do not delete old audit findings

Historical documentation is evidence of project evolution.

8. Git

Agents may prepare a commit when explicitly authorized by the user.

Before commit:

```text
git status
git diff
```

After commit:

git status
git log --oneline --decorate -3
```

Never force-push.

Never rewrite historical commits unless explicitly authorized.

Never merge laguna into main automatically.

9. Completion Report

Every substantive task should finish with:

Implementation
Tests
Verification
Files changed
Remaining limitations
Git status

Keep the report factual and concise.