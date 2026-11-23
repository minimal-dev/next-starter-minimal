---
name: branch-review
description: Reviews the current branch's own commits locally — baseline scripts, severity-bucketed findings, mandatory web-performance pass — then stops and waits. Invoke on "pull review", "review this branch", "review the last N commits", "review my PR" (local review, no GitHub). Never auto-fixes and never commits.
---

# Branch Review — local, severity-bucketed, then stop

Goal: review what this branch changed, report it in one pass the user can act
on, and **wait**. No fixing, no committing, no pushing until the user says so.

## Step 1 — Range

Default range: `git merge-base main HEAD`..`HEAD` (use `origin/main` if the
local `main` is stale). If the user said "last N commits", use `HEAD~N..HEAD`.
State the resolved range and the file count in one line before reviewing.

```bash
git log --oneline <range>
git diff --stat <range>
```

## Step 2 — Baseline first

```bash
npm run typecheck
npm run lint
npx stylelint "src/**/*.scss" --allow-empty-input
npm run build
```

Report any failure **before** the findings — a broken baseline outranks every
style opinion. If the pre-commit hook (typecheck + nano-staged) would block,
say so here.

## Step 3 — Findings

Read the diff. Above ~15 changed files, fan out sub-agents by area (routes /
components / styles / config) and merge their findings.

Report as four severity buckets — **Critical / High / Medium / Low** — each
entry one line:

```
path/to/File.tsx:42 — problem. fix.
```

No praise, no restating what the diff does. Empty buckets are omitted. Check
at least: AGENTS.md violations (hardcoded colors instead of the CSS custom
properties / `$`-mirrors in `src/styles/settings.scss`, raw `@media` in
component SCSS instead of `b-up`/`b-d`/`b-btw`/`b-o`, className composed with
template literals instead of `cn`, function-declaration components, `import
React` for JSX), missing `alt` / keyboard access (no a11y linter runs here),
dead imports, README staleness, and unhandled empty/loading/error states.

## Step 4 — Performance pass (mandatory section)

Always present, even when empty. Reason about Core Web Vitals and bundle cost:

- `'use client'` creep — client components that could stay server components;
  heavy dependencies (e.g. `gsap` plugins) pulled into client bundles
- Layout thrash / CLS: images without `next/image` or explicit dimensions,
  `<Image fill>` without `sizes`, fonts without a `display` strategy, content
  injected above the fold
- Animations on layout properties (`width`/`height`/`top`) instead of
  `transform`/`opacity`; scroll listeners running per frame
- Unbounded lists without virtualization or pagination
- Oversized images shipped from `src/assets` or `public`
- Blocking third-party scripts without a `next/script` strategy
- A route that lost its static prerender (`○` became `ƒ` in the build output)
  without a reason

## Step 5 — Stop

End with the findings and nothing else. Then branch on the user's word:

- **"fix"** → apply in severity order, Critical first, re-run the baseline
- **"plan"** → write `.claude/prompts/<feature>/PLAN.md` (plan only, no code)
- **"commit"** → commit per AGENTS.md commit rules (never push)

Never auto-fix, never commit unasked, never push.
