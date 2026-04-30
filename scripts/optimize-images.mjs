#!/usr/bin/env node
import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import sharp from "sharp";

const ROOT = "public/images";
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 82;
const SKIP_THRESHOLD_BYTES = 250 * 1024;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return walk(path);
      return [path];
    })
  );
  return files.flat();
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function optimize(file) {
  const ext = extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return null;

  const before = (await stat(file)).size;
  if (before < SKIP_THRESHOLD_BYTES) {
    return { file, before, after: before, skipped: true };
  }

  const buf = await readFile(file);
  const image = sharp(buf, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const resize =
    meta.width && meta.width > MAX_WIDTH
      ? image.resize({ width: MAX_WIDTH, withoutEnlargement: true })
      : image;

  let out;
  if (ext === ".png") {
    if (meta.hasAlpha) {
      out = await resize.png({ quality: 85, compressionLevel: 9, palette: true }).toBuffer();
    } else {
      out = await resize.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    }
  } else if (ext === ".webp") {
    out = await resize.webp({ quality: JPEG_QUALITY }).toBuffer();
  } else {
    out = await resize.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
  }

  if (out.length >= before) {
    return { file, before, after: before, skipped: true };
  }

  await writeFile(file, out);
  return { file, before, after: out.length, skipped: false };
}

const all = await walk(ROOT);
const results = [];
for (const f of all) {
  try {
    const r = await optimize(f);
    if (r) results.push(r);
  } catch (e) {
    console.error(`Error on ${f}:`, e.message);
  }
}

const optimized = results.filter((r) => !r.skipped);
const totalBefore = optimized.reduce((s, r) => s + r.before, 0);
const totalAfter = optimized.reduce((s, r) => s + r.after, 0);

for (const r of optimized) {
  console.log(`  ${r.file.padEnd(50)} ${fmt(r.before)} -> ${fmt(r.after)}`);
}
if (optimized.length === 0) {
  console.log("Aucune image à optimiser (toutes déjà compactes).");
} else {
  console.log(
    `\n${optimized.length} image(s) optimisée(s) — ${fmt(totalBefore)} -> ${fmt(totalAfter)} (-${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(0)}%)`
  );
}
