# CLAUDE.md

Notes for AI assistants working in this repo. Section 1 covers behavioral guidelines; section 2 covers project-specific stack details.

---

# Part 1 — Behavioral guidelines

Behavioral guidelines to reduce common LLM coding mistakes.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

# Part 2 — Project-specific notes

## Stack

- **Next.js 16** (App Router) with **Turbopack** as the default bundler for both `next dev` and `next build`. Webpack is opt-in via `--webpack`.
- **React 19**, **TypeScript** (strict).
- **SCSS modules**, compiled via **`sass-embedded`** (configured in `next.config.js` `sassOptions.implementation`).
- **`modern-normalize`** as the cross-browser reset (imported once in `src/app/layout.tsx`).
- **SVG handling** lives in `next.config.js` `turbopack.rules` (see SVG section below).
- **`next-classnames-minifier`** rewrites CSS-module class names in production builds only (gated on `NODE_ENV` and cloud-build env vars).
- **Sharp** for image optimization.

## Scripts

| Script           | Purpose                                                                                                                                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`    | Start Turbopack dev server (alias: `npm start`, which intentionally runs `next dev`, not `next start`).                                                                                                              |
| `npm run build`  | Production build via Turbopack. The `@next/bundle-analyzer` plugin only runs under webpack — under Turbopack it logs a notice and is a no-op. Use `npx next build --webpack` if you need the legacy analyzer report. |
| `npm run serve`  | Run the production build (`next start`).                                                                                                                                                                             |
| `npm run lint`   | `eslint .` against the flat config in `eslint.config.js`.                                                                                                                                                            |
| `npm run format` | Prettier write across the repo.                                                                                                                                                                                      |

## Path aliases

Defined in both `tsconfig.json` and `jsconfig.json` — keep in sync:

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
- **SCSS mirrors** (`$primary`, `$gray-100`) for places that need real Sass values — color functions like `rgba()`/`darken()` cannot read CSS custom properties.
- **`$breakpoints` SCSS map** — used by the `b-up`/`b-d`/`b-btw`/`b-o` mixins in `mixins.scss`. Cannot be CSS variables because `@media` queries can't reference them.

Turbopack's bundled sass-loader does not always preserve the source file's directory when handing imports to Sass, which breaks relative imports like `@import 'settings'` from `src/styles/mixins.scss`. The workaround in `next.config.js` is `sassOptions.loadPaths` listing `src/styles`. If you add new SCSS partials in a directory that's referenced via bare `@import 'name'` from outside that directory, you'll likely need to extend `loadPaths` similarly.

## Conventions

- **Components:** `src/components/<Name>/{index.tsx,Name.module.scss}`. Arrow-function components only — enforced by ESLint (`react/function-component-definition`).
- **Styles:** per-component `*.module.scss` for scoped styles; global tokens/mixins live in `src/styles/`. Edit tokens in `src/styles/settings.scss` (CSS custom properties + SCSS mirrors + `$breakpoints` map).
- **Imports:** ESLint's `react/jsx-filename-extension` allows JSX in `.ts`/`.tsx` only.
- **Commits:** Conventional Commits, enforced by `commitlint` via husky `commit-msg` hook. Pre-commit runs `nano-staged`, configured in `.nanostagedrc` to run `eslint` on staged JS/TS/JSON, `stylelint --allow-empty-input` on staged CSS/SCSS, and `prettier --write` on staged MD/MDX.

## Quality tooling

- **ESLint 9** with **flat config** in `eslint.config.js`. Composes:
  - `eslint-config-next/core-web-vitals` (native flat export)
  - `eslint-plugin-react`'s `configs.flat.recommended`
  - `plugin:json/recommended` via `FlatCompat` (the `eslint-plugin-json` package only ships legacy configs)
  - `eslint-config-prettier` rules + `eslint-plugin-prettier`
- **Stylelint 16** with `stylelint-config-standard-scss` + `stylelint-config-recess-order` + `stylelint-prettier`.
- **Prettier 3**, single quotes, no semicolons, 2-space tabs, ES5 trailing commas.

## Gotchas

- **`npm start` runs `next dev`**, not the production server. Use `npm run serve` for that.
- **`themeColor` lives on the `viewport` export, not `metadata`** (Next 14+). When adding a route that needs its own theme color, export `const viewport = { themeColor: '...' }` rather than putting it on `metadata`.
- **Renovate** auto-merges minor/patch/pin/digest updates (`renovate.json`); ESLint and Stylelint families are grouped. Coordinate manually for major bumps.
