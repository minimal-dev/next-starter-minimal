# AGENTS.md — next-starter-minimal

> Canonical rules for **Cursor**, Claude Code, and Codex.
> `CLAUDE.md` at the repo root is a single `@AGENTS.md` import — never edit it. Edit this file.
> Part 1 covers behavioral guidelines; Part 2 covers the stack; Part 3 indexes repo-local rules and skills.

---

# Part 1 — Working principles

These apply to every change in this repo. Read them before the stack notes below.

**Tradeoff:** these guidelines bias toward caution over speed. For trivial tasks, use judgment.

## Think before coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.
- Every question ships a recommended default. A bare "recommended" / "go" reply means: adopt the defaults and proceed.
- **Annotated screenshots** (arrows, drawn lines, circles, highlights): restate your interpretation of the requested change in one plain sentence _before_ editing. If two readings are possible, ask.

## Simplicity first

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.
- **No one-element component files.** Don't extract a trivial presentational fragment into its own component. Inline it where it's used. Extract a child only when it earns it: reused in 2+ places, owns local state/hooks/effects, or is genuinely complex.

Self-check: would a senior engineer call this overcomplicated? If yes, simplify.

## Surgical changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you spot unrelated dead code, mention it — don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that **your** changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line traces directly to the user's request.

**A reported bug is usually one instance of a class.** Grep for sibling instances before calling it fixed, and either fix them in the same change or list them for the user.

## Comments — Constraint, Not Story

**A comment states a live constraint the code can't show — in 1–2 lines. Everything else is noise.**

Never write narrative essays, personalized "we/our", history, tombstones, obvious restatements, type-echo JSDoc, apology comments, AI-slop markers, or Figma node ids / Figma URLs. Git holds history.

Keep: concise JSDoc on exported APIs, condensed browser-quirk warnings, TODO/keep-in-sync notes, lint-directive explanations.

## Goal-driven execution

**Define success criteria. Loop until verified.**

For multi-step tasks, state a brief plan (`step → verify`). Deliver each phase's status report before starting the next. **"No code / plan only" is sticky** until an explicit "go" / "implement". Plan progress is file-driven: tick `.claude/prompts/**/PLAN.md` as each verify passes.

**Review 🔴 on an active feature branch = fix in the same turn.**

## Performance review on every request

Surface Core Web Vitals cost before or while implementing. Prefer CSS transitions over JS; explicit image sizes; deferred third-party scripts. Server components until interactivity demands otherwise.

## Fresh state before editing

The user edits files mid-session. Re-Read affected files before the next Edit after a hand-edit, compaction, formatter, or git operation. Never retry an identical failed Edit.

---

# Part 2 — Project-specific notes

## What this is

A minimal Next.js starter: App Router, TypeScript, SCSS modules, SVGR icons and a strict lint/format/commit toolchain. It ships two example routes (`/`, `/page-2`), one route handler (`/api/hello`) and three components (`Header`, `Footer`, `Menu`). New projects are cloned from it.

## Stack

- **Node 26 LTS** (`.nvmrc`; `engines.node` is `26.x`, which Vercel reads).
- **Next.js 16** (App Router) with **Turbopack** as the default bundler for both `next dev` and `next build`. Webpack is opt-in via `--webpack`.
- **React 19**, **TypeScript 6** (strict).
- **SCSS modules**, compiled via **`sass-embedded`** (configured in `next.config.js` `sassOptions.implementation`).
- **`modern-normalize`** as the cross-browser reset (imported once in `src/app/layout.tsx`).
- **`classnames`** (as `cn`) for class composition, **`gsap`** for the menu smooth-scroll.
- **SVG handling** lives in `next.config.js` `turbopack.rules` (see SVG section below).
- **Sharp** for image optimization. `next` installs it as an optional dependency; it is also a devDependency because `scripts/optimize-assets.mjs` imports it. Keep its range in step with `next`'s.
- **SVGO 4** (`svgo.config.mjs`) optimizes committed SVGs. SVGR still runs its own bundled SVGO 3 at build time.

## Current layout

| Path                                              | Role                                                          |
| ------------------------------------------------- | ------------------------------------------------------------- |
| `src/app/`                                        | Routes, root `layout.tsx`, metadata images, `api/hello`       |
| `src/components/<Name>/`                          | `index.tsx` + `<Name>.module.scss`                            |
| `src/styles/settings.scss`                        | Design tokens (CSS custom properties, Sass mirrors, map)      |
| `src/styles/mixins.scss`                          | `b-up` / `b-d` / `b-btw` / `b-o`, `clamp-builder()`           |
| `src/styles/app.scss` + `components/*.scss`       | Global base, container, button reset, typography              |
| `src/assets/{img,icons,fonts}/`                   | Static assets behind the `~img` / `~icons` / `~fonts` aliases |
| `globals.d.ts`                                    | `*.svg?url` module type                                       |
| `scripts/optimize-assets.mjs` + `svgo.config.mjs` | Image gate: SVGO for SVG, sharp for PNG/JPG                   |

## Scripts

| Script                    | Purpose                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `npm run dev`             | Start Turbopack dev server (alias: `npm start`, which intentionally runs `next dev`, not `next start`). |
| `npm run build`           | Production build via Turbopack.                                                                         |
| `npm run serve`           | Run the production build (`next start`).                                                                |
| `npm run analyze`         | Turbopack bundle analyzer UI (`next analyze`). Does not produce a build.                                |
| `npm run typecheck`       | `tsc --noEmit`.                                                                                         |
| `npm run lint`            | `eslint .` against the flat config in `eslint.config.js`.                                               |
| `npm run format`          | Prettier write across the repo (reads `.gitignore` and `.prettierignore`).                              |
| `npm run assets:check`    | Report unoptimized SVG/PNG/JPG under `src/`, `public/` and the repo root; exits 1 if any.               |
| `npm run assets:optimize` | Rewrite those files in place (SVGO, mozjpeg q80, palette PNG, long edge ≤ 3000px).                      |
| `npm run assets:dupes`    | Report byte-identical and near-duplicate images; never writes.                                          |

## Path aliases

Defined once, in `tsconfig.json` `compilerOptions.paths`:

- `~img/*` → `src/assets/img/*`
- `~icons/*` → `src/assets/icons/*`
- `~fonts/*` → `src/assets/fonts/*`
- `~*` → `src/*` (e.g. `~components/Header`)
- `@/*` → repo root (TS only)

## SVG imports (Turbopack rules)

Two import styles are supported, defined in `next.config.js` under `turbopack.rules['*.svg']`:

| Import                            | Handling                                          | Use case                                 |
| --------------------------------- | ------------------------------------------------- | ---------------------------------------- |
| `import Foo from './foo.svg'`     | SVGR compiles to a React component (`as: '*.js'`) | Render inline: `<Foo width={60} />`      |
| `import url from './foo.svg?url'` | Emitted as a static asset (`type: 'asset'`)       | Pass the URL to `<Image>` or `<img src>` |

The `?url` opt-out is matched via `condition.query` — a Turbopack feature available **only in Next 16.0+** (and `condition.query` specifically in 16.2+). Do not downgrade Next without rewriting this rule.

## SCSS / Sass setup

Design tokens live in `src/styles/settings.scss`:

- **CSS custom properties** under `:root` for colors (`--color-primary`, `--color-gray-*`, `--color-bg`, `--color-text`) and sizes (`--size-container-*`, `--font-*`). Themable at runtime; readable from JSX.
- **SCSS mirrors** (`$primary`) for places that need real Sass values — color functions like `rgba()`/`darken()` cannot read CSS custom properties.
- **`$breakpoints` SCSS map** — used by the `b-up`/`b-d`/`b-btw`/`b-o` mixins in `mixins.scss`. Cannot be CSS variables because `@media` queries can't reference them.
- Use Sass module functions (`list.nth`, `meta.type-of`, `math.div`), not the deprecated global built-ins; stylelint's `scss/no-global-function-names` enforces it.

Turbopack's bundled sass-loader does not always preserve the source file's directory when handing imports to Sass, which breaks relative loads like `@use 'settings'` from `src/styles/mixins.scss`. The workaround in `next.config.js` is `sassOptions.loadPaths` listing `src/styles`. If you add new SCSS partials in a directory that's referenced via bare `@use 'name'` from outside that directory, you'll likely need to extend `loadPaths` similarly.

## Conventions

- **Components:** `src/components/<Name>/{index.tsx,<Name>.module.scss}`, default export. Arrow-function components only — enforced by ESLint (`react/function-component-definition`). See rule 10.
- **Styles:** per-component `*.module.scss` for scoped styles; global tokens/mixins live in `src/styles/`. Edit tokens in `src/styles/settings.scss`. See rule 12.
- **Class names:** `classnames` imported as `cn`. See rule 14.
- **JSX:** allowed in `.ts`/`.tsx` only (`react/jsx-filename-extension`). No `import React` for JSX; import types by name (`import type { ReactNode } from 'react'`).

## Quality tooling

- **ESLint 10** with **flat config** in `eslint.config.js`. `eslint-config-next` is not used: it hard-depends on `eslint-plugin-jsx-a11y` and `eslint-plugin-import`, which only support ESLint 9. The config composes its parts directly:
  - `@next/eslint-plugin-next` `core-web-vitals`
  - `eslint-plugin-react` `flat.recommended` + `flat['jsx-runtime']`, wrapped in `@eslint/compat` `fixupPluginRules` (7.x calls `context.getFilename()`, removed in ESLint 10)
  - `eslint-plugin-react-hooks` `flat.recommended`
  - `typescript-eslint` parser only (no type-aware or `recommended` rules)
  - `eslint-plugin-import-x` for `import-x/no-anonymous-default-export` only (the one import rule `eslint-config-next` enabled)
  - `eslint-plugin-prettier/recommended`
  - `@eslint/json` `recommended` for `**/*.json` (`package-lock.json` ignored)
- No accessibility linting (`jsx-a11y` removed on purpose).
- **Stylelint 18** with `stylelint-config-standard-scss` + `stylelint-config-recess-order` + `stylelint-prettier`.
- **Prettier 3**, single quotes, no semicolons, 2-space tabs, ES5 trailing commas.
- **Git hooks** (husky): `pre-commit` runs `npm run typecheck`, then blocks the commit if a staged SVG/PNG/JPG is unoptimized (`optimize-assets.mjs --check --staged`; fix with `npm run assets:optimize`), then `nano-staged` (`.nanostagedrc`: `eslint` on staged JS/TS/JSON, `stylelint --allow-empty-input` on staged CSS/SCSS, `prettier --write` on staged MD/MDX). `commit-msg` runs commitlint.

## Gotchas

- **`npm start` runs `next dev`**, not the production server. Use `npm run serve` for that.
- **`themeColor` lives on the `viewport` export, not `metadata`** (Next 14+). When adding a route that needs its own theme color, export `const viewport = { themeColor: '...' }` rather than putting it on `metadata`.
- **`metadataBase`** reads `SITE_URL`, then Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, then `http://localhost:3000`. Set `SITE_URL` when deploying outside Vercel or behind a custom domain Vercel does not report.
- **Renovate** auto-merges minor/patch/pin/digest updates (`renovate.json`); `next`, ESLint and Stylelint families are grouped. Coordinate manually for major bumps.

## Commit rules

- **No `Co-Authored-By` trailer.** Ever.
- **Conventional Commits**, enforced by commitlint — `type(scope): subject`. Imperative, lowercase, ≤72 chars, no trailing period.
- **1–2 commits per work session.** Commit only when asked. **Never push.**
- A failing hook is a bug report. Fix the cause. Never `--no-verify`.

## Dependency policy

Latest stable (`npm view` first). Pins go under **Known pins** as `pkg@version (date) — reason`.

### Known pins

- `typescript@~6.0.3` (2026-11-23) — `typescript-eslint` supports `typescript <6.1.0` only; Renovate holds it at `<6.1`.
- `eslint-plugin-react@7.37.5` (2026-11-23) — declares `eslint ^9.7`; `package.json` `overrides` maps its `eslint` to the root ESLint 10. Drop the override and the `fixupPluginRules` wrapper once a release supports ESLint 10.

---

# Part 3 — Rules & Skills index

Project-specific rules and skills live under `.cursor/`. They are **normative for every agent**.

**Skills are duplicated** in `.cursor/skills/` and `.claude/skills/`. Both copies must stay byte-identical.

## Rules — `.cursor/rules/`

| Rule                                 | Applies to          | What it covers                                                     |
| ------------------------------------ | ------------------- | ------------------------------------------------------------------ |
| `05-quality-checks.mdc`              | `src/components/**` | Tokens, state completeness, text flexibility, a11y, props naming   |
| `08-git-rebase-workflow.mdc`         | always              | Rebase onto `origin/main`, never merge                             |
| `09-new-branch-from-main.mdc`        | always              | Cut new branches from `origin/main`                                |
| `10-add-simple-component.mdc`        | `src/components/**` | Folder shape, props, SCSS module, arrow component                  |
| `12-scss-mixins-and-breakpoints.mdc` | `src/**/*.scss`     | `b-up` / `b-d` / `b-btw` / `b-o`, `clamp-builder`, no raw `@media` |
| `14-classnames-cn-alias.mdc`         | `src/**/*.{ts,tsx}` | `cn` for every class composition                                   |

## Skills — `.cursor/skills/` (+ `.claude/skills/` mirror)

| Skill             | Invoke on                                                  | Output                                                  |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| `branch-review`   | "review this branch", "review the last N commits"          | Baseline + severity-bucketed findings, then stops       |
| `wrap-branch`     | "PR title/description", "squash title", "wrap this branch" | Copy-paste PR text; never pushes, never opens a PR      |
| `optimize-assets` | New/updated SVG/PNG/JPG, "unoptimized assets staged"       | Optimized assets, visual check, `EXCLUDED` for breakage |

## Maintenance rule

Whenever a new file is added under `.cursor/rules/` or `.cursor/skills/`, append a row to the matching table. For skills, update the `.claude/skills/` mirror in the same change.
