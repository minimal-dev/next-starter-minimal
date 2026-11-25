---
name: optimize-assets
description: Optimizes every image under src/ and public/ — SVGs with SVGO, PNG/JPG with sharp — and unblocks the pre-commit assets gate. Triggered after adding or updating any SVG/PNG/JPG (icons, Figma exports, photos), when a commit is blocked with "unoptimized assets staged", or when the user asks to optimize icons/images/assets. Handles excluding assets that visually break after optimization.
---

# Optimize image assets

Every `*.svg`, `*.png`, `*.jpg` under `src/` and `public/` (plus repo-root
images) must be optimized before it is committed. The `.husky/pre-commit` hook
**blocks** the commit otherwise. It never rewrites files, because a lossy
re-encode is a human decision.

- SVG → SVGO, config at repo root `svgo.config.mjs` (multipass, `currentColor`
  and `xmlns` preserved, `width`/`height` stripped in favour of `viewBox`,
  ids prefixed per file so inline SVGR icons never collide).
- PNG/JPG → sharp: mozjpeg q80 / palette PNG, metadata stripped, EXIF
  orientation baked in, long edge capped at 3000px.
- Script: `scripts/optimize-assets.mjs`.

`next/image` still re-encodes rasters at request time; the gate keeps the repo
and the optimizer's source small.

## Step 1 — Run

```bash
npm run assets:check      # report only, exits 1 if anything is unoptimized
npm run assets:optimize   # rewrite the unoptimized files in place
npm run assets:dupes      # duplicate / near-duplicate report, never writes
```

Both accept an explicit file list (`node scripts/optimize-assets.mjs --check <paths…>`).
The pre-commit hook passes only the staged images with `--staged`, which reads
the index blob instead of the working-tree file.

An asset counts as unoptimized when:

- **SVG** — SVGO output differs from the file on disk (byte-exact oracle).
- **Raster** — re-encoding saves ≥15% **and** ≥8KB, or the long edge exceeds
  3000px. Files already near-optimal are left alone, so a clean run is quiet.

## Step 2 — Verify

- Re-run `npm run assets:check` → must print `✓ N asset(s) checked — all optimized.`
  (the optimizer is idempotent; a second pass must never find new work).
- Inspect the diff of any heavily-shrunk SVG (`git diff`): `viewBox`, `xmlns`,
  `currentColor` fills/strokes and `stroke-width` must stay.
- **Look at the rasters that shrank a lot.** PNGs are quantized to a 256-colour
  palette: compare a 1:1 crop of smooth gradients and small text against the
  original before committing.
- Re-stage the rewritten files (`git add`) and commit again.

## Step 2b — Near-duplicate check on new images

Run `npm run assets:dupes` after dropping a batch of exports. It reports
byte-identical pairs (sha1) and likely-same-shot pairs (64px grayscale
signatures, mean difference under 8; `@2x` density variants are skipped).
It never deletes anything: report the groups and ask which to keep before
committing the copies.

## Step 3 — If an asset breaks

1. Restore it: `git checkout -- <path>` (if the pre-optimization version was
   never committed, re-export it from Figma).
2. Add its **repo-relative path** to the `EXCLUDED` array at the top of
   `scripts/optimize-assets.mjs` with a one-line comment saying why.
   Excluded assets are left byte-identical and never reported.
3. Re-run `npm run assets:check` and confirm the file is no longer listed.

## Boundaries

- **Never bypass the gate with `git commit --no-verify`.** If an asset genuinely
  must ship as-is, `EXCLUDED` it — that keeps the decision visible in review.
- Never edit `svgo.config.mjs` or the sharp thresholds to unblock one file —
  they affect every asset. Exclude the single file instead.
