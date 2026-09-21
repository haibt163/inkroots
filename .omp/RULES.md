# OMP Rules — Ink Roots

## Mandatory

1. Work on `laguna` unless explicitly instructed otherwise.

2. Treat `main` as the preserved Grok Original baseline.

3. Read:
   - `AGENTS.md`
   - `AGENTS.project.md`
   - `.omp/AGENTS.md`

4. Inspect existing implementation before changing it.

5. Keep CRs narrowly scoped.

6. Verify every claimed result.

7. Run relevant tests after implementation.

8. Inspect `git diff` before committing.

9. Preserve historical documentation under `docs/`.

10. Report limitations honestly.

---

## Never

- never modify `main` for scratch work
- never force-push
- never silently merge branches
- never delete historical audit documents
- never mass-rewrite educational content during engineering CRs
- never claim a test passed without running it
- never claim a build passed without running it
- never turn a critical validation failure into a warning just to obtain green
- never introduce unrelated refactors
- never add secrets or credentials
- never treat an agent report as proof when repository verification is possible

---

## Current CR

CR-2 is the active engineering task:

**Validate the local stroke-data corpus against `writerChar`.**

Required invariant:

```text
radicals.json
    ↓
unique writerChar set
    ↓
public/stroke-data/
    ↓
every expected JSON exists
    ↓
every expected JSON parses
    ↓
no unexpected JSON files
```

Critical violations must produce a non-zero exit status.

Do not expand CR-2 into:

story rewriting
illustration generation
UI redesign
dependency modernization
PWA work
dark mode
broad accessibility work
removal of the CDN fallback
Required Verification

For CR-2:

```text
node scripts/validate-radicals.mjs
npm test
npm run typecheck
npm run lint
npm run build
```

If any command fails, investigate and report the actual result.

Git Completion

Before commit:

```text
git status
git diff
```

After commit:

git status
git log --oneline --decorate -3
```

Keep the CR commit focused.
```
