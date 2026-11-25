/**
 * Asset optimizer / gate for images under the scan roots.
 *
 *   npm run assets:check      # report only, exit 1 if anything is unoptimized
 *   npm run assets:optimize   # rewrite the unoptimized files in place
 *   npm run assets:dupes      # report duplicate / near-duplicate images, never writes
 *   node scripts/optimize-assets.mjs --check <file> <file> …   # subset
 *   node scripts/optimize-assets.mjs --check --staged <file> … # index blobs (pre-commit)
 *
 * SVG  → SVGO (config: svgo.config.mjs). Unoptimized ⇔ SVGO output differs.
 * JPG/PNG → sharp. Unoptimized ⇔ oversized (> MAX_DIMENSION px on the long
 *           edge) or re-encodable below the savings thresholds below.
 *
 * If a file breaks visually after optimization, add its path to EXCLUDED — it
 * is then left byte-identical and never reported.
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfig, optimize } from 'svgo'
import sharp from 'sharp'

// Files that must stay verbatim, repo-relative, forward slashes.
const EXCLUDED = []

const MIN_SAVED_RATIO = 0.15
const MIN_SAVED_BYTES = 8 * 1024
const MAX_DIMENSION = 3000
const JPEG_QUALITY = 80
const DUPE_SIGNATURE_PX = 64
const DUPE_MEAN_DIFF = 8

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Missing folders are skipped.
const SCAN_DIRS = ['src', 'public'].map((d) => path.join(ROOT, d))
const RASTER_EXT = ['.jpg', '.jpeg', '.png']

const args = process.argv.slice(2)
const checkOnly = args.includes('--check')
const dupesOnly = args.includes('--dupes')
const stagedOnly = args.includes('--staged')
const explicit = args.filter((a) => !a.startsWith('--'))

if (stagedOnly && !checkOnly) {
  console.error('--staged works with --check only.')
  process.exit(2)
}

const svgoConfig = await loadConfig(path.join(ROOT, 'svgo.config.mjs'))

const rel = (file) => path.relative(ROOT, file).split(path.sep).join('/')

// --staged reads the index blob: the working-tree file may differ from what is committed.
const readSource = (file) =>
  stagedOnly
    ? execFileSync('git', ['show', `:${rel(file)}`], {
        cwd: ROOT,
        maxBuffer: 256 * 1024 * 1024,
      })
    : readFile(file)

const isImage = (file) => {
  const ext = path.extname(file).toLowerCase()
  return ext === '.svg' || RASTER_EXT.includes(ext)
}

async function walk(dir) {
  const out = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else out.push(full)
  }
  return out
}

async function collectRootImages() {
  const out = []
  const entries = await readdir(ROOT, { withFileTypes: true })
  for (const entry of entries) {
    // Root-level folders other than SCAN_DIRS are intentionally not collected.
    if (entry.isDirectory()) continue
    const full = path.join(ROOT, entry.name)
    if (isImage(full)) out.push(full)
  }
  return out
}

async function collect() {
  if (explicit.length) {
    return explicit
      .map((f) => path.resolve(ROOT, f))
      .filter((f) => isImage(f))
      .filter((f) => !EXCLUDED.includes(rel(f)))
      .sort()
  }

  const nested = (
    await Promise.all(SCAN_DIRS.map((d) => walk(d).catch(() => [])))
  ).flat()
  const root = await collectRootImages()
  const files = [...root, ...nested].filter(isImage)

  return files.filter((f) => !EXCLUDED.includes(rel(f))).sort()
}

/** @returns {{ before: number, after: number, note: string, write?: () => Promise<void> }} */
async function inspectSvg(file) {
  const input = (await readSource(file)).toString('utf8')
  const { data } = optimize(input, { ...svgoConfig, path: file })
  const before = Buffer.byteLength(input)
  const after = Buffer.byteLength(data)

  if (data === input) return { before, after, note: '' }

  return {
    before,
    after,
    note: 'svgo',
    write: () => writeFile(file, data, 'utf8'),
  }
}

async function inspectRaster(file) {
  const source = await readSource(file)
  const before = source.length
  const meta = await sharp(source).metadata()
  // EXIF orientations 5–8 swap the displayed width and height.
  const swapped = (meta.orientation ?? 1) >= 5
  const width = swapped ? meta.height : meta.width
  const height = swapped ? meta.width : meta.height
  const long = Math.max(width ?? 0, height ?? 0)
  const oversized = long > MAX_DIMENSION

  // Bake the EXIF orientation into the pixels: re-encoding strips metadata.
  let pipeline = sharp(source).rotate()
  if (oversized) {
    pipeline = pipeline.resize({
      width: width >= height ? MAX_DIMENSION : undefined,
      height: height > width ? MAX_DIMENSION : undefined,
      withoutEnlargement: true,
    })
  }
  pipeline =
    path.extname(file).toLowerCase() === '.png'
      ? pipeline.png({ palette: true, compressionLevel: 9, effort: 10 })
      : pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true })

  const buffer = await pipeline.toBuffer()
  const after = buffer.length
  const saved = before - after
  const recompressible =
    saved >= MIN_SAVED_BYTES && saved / before >= MIN_SAVED_RATIO

  if (!oversized && !recompressible) return { before, after: before, note: '' }
  if (!oversized && after >= before) return { before, after: before, note: '' }

  const notes = []
  if (oversized) notes.push(`${width}×${height} → ≤${MAX_DIMENSION}px`)
  if (recompressible) notes.push('recompress')

  return {
    before,
    after,
    note: notes.join(', '),
    write: () => writeFile(file, buffer),
  }
}

const kb = (n) => `${(n / 1024).toFixed(1)}KB`

const densityBase = (file) => file.replace(/@\d+x(\.[a-z]+)$/i, '$1')

async function reportDupes(all) {
  const byHash = new Map()
  const signatures = []

  for (const file of all) {
    const source = await readFile(file)
    const hash = createHash('sha1').update(source).digest('hex')
    if (!byHash.has(hash)) byHash.set(hash, [])
    byHash.get(hash).push(file)

    if (path.extname(file).toLowerCase() === '.svg') continue
    try {
      const meta = await sharp(source).metadata()
      const data = await sharp(source)
        .resize(DUPE_SIGNATURE_PX, DUPE_SIGNATURE_PX, { fit: 'fill' })
        .greyscale()
        .raw()
        .toBuffer()
      signatures.push({ file, hash, data, meta })
    } catch {
      // Unreadable raster — the optimize pass reports it, the dupe pass skips it.
    }
  }

  const exact = [...byHash.values()].filter((group) => group.length > 1)
  const near = []
  for (let i = 0; i < signatures.length; i++) {
    for (let j = i + 1; j < signatures.length; j++) {
      const a = signatures[i]
      const b = signatures[j]
      if (a.hash === b.hash) continue
      if (densityBase(a.file) === densityBase(b.file)) continue
      let sum = 0
      for (let px = 0; px < a.data.length; px++) {
        sum += Math.abs(a.data[px] - b.data[px])
      }
      const diff = sum / a.data.length
      if (diff < DUPE_MEAN_DIFF) near.push({ a, b, diff })
    }
  }

  if (!exact.length && !near.length) {
    console.log(`✓ ${all.length} asset(s) scanned — no duplicates found.`)
    return
  }

  if (exact.length) {
    console.log(`\n${exact.length} byte-identical group(s):\n`)
    for (const group of exact) console.log(`  ${group.map(rel).join('\n  ')}\n`)
  }

  if (near.length) {
    console.log(`\n${near.length} likely same shot, different crop/encode:\n`)
    for (const { a, b, diff } of near.sort((x, y) => x.diff - y.diff)) {
      console.log(
        `  ${rel(a.file)} (${a.meta.width}×${a.meta.height})\n` +
          `  ${rel(b.file)} (${b.meta.width}×${b.meta.height})\n` +
          `      mean diff ${diff.toFixed(1)}\n`
      )
    }
  }

  console.log(
    'Report only — decide which to keep yourself, then delete and re-point includes.'
  )
}

const files = await collect()

if (dupesOnly) {
  await reportDupes(files)
  process.exit(0)
}

const dirty = []

for (const file of files) {
  const result =
    path.extname(file).toLowerCase() === '.svg'
      ? await inspectSvg(file)
      : await inspectRaster(file)

  if (result.write) dirty.push({ file, ...result })
}

if (dirty.length === 0) {
  console.log(`✓ ${files.length} asset(s) checked — all optimized.`)
  process.exit(0)
}

const totalBefore = dirty.reduce((s, d) => s + d.before, 0)
const totalAfter = dirty.reduce((s, d) => s + d.after, 0)
const saved = totalBefore - totalAfter
const pct = ((saved / totalBefore) * 100).toFixed(0)

if (checkOnly) {
  console.log(`\n✖ ${dirty.length} unoptimized asset(s):\n`)
  for (const d of dirty) {
    console.log(
      `  ${rel(d.file)}\n      ${kb(d.before)} → ${kb(d.after)}  (${d.note})`
    )
  }
  console.log(
    `\n  Total: ${kb(totalBefore)} → ${kb(totalAfter)} (−${pct}%, ${kb(saved)} saved)`
  )
  console.log(`\n  Fix:  npm run assets:optimize`)
  console.log(
    `  Then re-check the images render correctly, and re-stage them.\n`
  )
  process.exit(1)
}

for (const d of dirty) {
  await d.write()
  console.log(`✓ ${rel(d.file)}: ${kb(d.before)} → ${kb(d.after)} (${d.note})`)
}
console.log(
  `\n${dirty.length}/${files.length} optimized, ${kb(saved)} saved (${pct}%), ${EXCLUDED.length} excluded.`
)
console.log('Visually verify the touched assets before committing.')
