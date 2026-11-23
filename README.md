<p align="center">
  <a href="https://min.studio" target="_blank"><img width="100" alt="Minimal" src="https://user-images.githubusercontent.com/4237964/234673176-733e3608-3930-4332-9050-16245272ad6a.svg"></a>&nbsp;&nbsp;
  <a href="https://nextjs.org/" target="_blank"><img alt="Next.js" src="https://user-images.githubusercontent.com/4237964/234674093-ab3f022c-f13e-4ec1-9f04-a6507e70da94.svg" width="100" /></a>
</p>
<h1 align="center">
  Minimal's Next.js starter
</h1>

A minimal Next.js 16 (App Router) starter with TypeScript, SCSS modules, SVG
components and a strict lint/format/commit toolchain.

## Requirements

- Node.js 26 LTS (`.nvmrc`; `engines.node` is `26.x`, which Vercel reads)
- npm

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script             | What it does                                                              |
| ------------------ | ------------------------------------------------------------------------- |
| `npm run dev`      | Turbopack dev server. `npm start` is an alias of `dev`, not `next start`. |
| `npm run build`    | Production build (Turbopack).                                             |
| `npm run serve`    | Serve the production build (`next start`).                                |
| `npm run lint`     | ESLint (flat config in `eslint.config.js`).                               |
| `npm run format`   | Prettier over JS/TS/JSON/MD/CSS/SCSS.                                     |
| `npx tsc --noEmit` | Type-check without building.                                              |

## Path aliases

Defined once in `tsconfig.json` (`compilerOptions.paths`):

| Alias      | Resolves to                         |
| ---------- | ----------------------------------- |
| `~img/*`   | `src/assets/img/*`                  |
| `~icons/*` | `src/assets/icons/*`                |
| `~fonts/*` | `src/assets/fonts/*`                |
| `~*`       | `src/*` (e.g. `~components/Header`) |
| `@/*`      | repository root                     |

## SVG imports

Configured in `next.config.js` under `turbopack.rules['*.svg']`:

```tsx
import Logo from '~icons/logo.svg' // React component via SVGR: <Logo width={60} />
import logoUrl from '~img/logo.svg?url' // static asset URL for <Image> or <img>
```

The `?url` rule relies on Turbopack `condition.query` (Next 16.2+).

## Styles

- Per-component SCSS modules: `src/components/<Name>/<Name>.module.scss`.
- Global styles: `src/styles/app.scss`, imported once in `src/app/layout.tsx`
  after `modern-normalize`.
- Design tokens: `src/styles/settings.scss` — CSS custom properties on
  `:root`, Sass mirrors for colour functions, and the `$breakpoints` map.
- Breakpoint mixins in `src/styles/mixins.scss`: `b-up`, `b-d`, `b-btw`,
  `b-o`, plus `clamp-builder()`. Use them with `@use 'mixins' as *;`.
- Sass runs through `sass-embedded`; `src/styles` is a Sass load path, so
  partials import by bare name.

## Tooling

- **ESLint 9** flat config: `eslint-config-next` (core web vitals),
  `eslint-plugin-react`, `eslint-plugin-json`, Prettier as a rule.
  Components are arrow functions (`react/function-component-definition`).
- **Prettier 3**: single quotes, no semicolons, 2 spaces, ES5 trailing commas.
- **Stylelint 18**: `stylelint-config-standard-scss`,
  `stylelint-config-recess-order`, Prettier plugin.
- **Git hooks** (husky): `pre-commit` runs `nano-staged` (`.nanostagedrc`),
  `commit-msg` runs commitlint with Conventional Commits.
- **Renovate** (`renovate.json`) groups ESLint and Stylelint updates and
  auto-merges minor and patch releases.

## Deploy

Vercel detects Next.js automatically; the Node version comes from
`engines.node`.
