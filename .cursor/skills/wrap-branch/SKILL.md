---
name: wrap-branch
description: Generates a PR title, squash-commit subject, and PR description from the current branch's commits vs main. Invoke when the user asks "how should I name my PR", "generate PR name/description", "squash title", or "wrap up this branch". Output is copy-paste text only — never pushes, never opens a PR.
---

# Wrap Branch — PR Title + Description

Goal: turn the branch's commit history into a ready-to-paste PR title,
squash subject, and description. Text output only. **Never push. Never
create the PR** — the user does that themselves.

## Step 1 — Collect

```bash
git fetch origin main
git merge-base HEAD origin/main
git log --oneline <merge-base>..HEAD
git diff --stat <merge-base>..HEAD
```

If `origin/main` doesn't exist or fetch fails, use local `main`. If the log
is empty, say so and stop.

## Step 2 — Generate

From the commit subjects + diff stat, produce:

1. **PR title** — Conventional-Commit style, imperative, lowercase subject, ≤72 chars, covering the dominant concern.
2. **Squash subject** — same string.
3. **PR description** — short markdown:
   - 3–8 bullet summary grouped by concern (features / fixes / refactors / deps / docs), not one bullet per commit.
   - A "Notable decisions" line only if something non-obvious happened (a held major, a pin, a removed plugin).
   - No filler sections, no test-plan boilerplate unless tests actually exist.
4. **Docs staleness check** — flag a changed script, alias, SVG rule or tooling choice that `README.md` or `AGENTS.md` Part 2 still describes the old way, and any component `README.md` whose API changed without an update.

## Step 3 — Deliver

Print title + description in one fenced block for copy-paste. English by
default; Ukrainian on request. Do not run `gh`, do not push, do not amend commits.
