// Downloads the stock photos and videos listed in media.json into public/media.
// Runs automatically before `npm run dev` and `npm run build`; files already present are skipped.
// Photos are saved as WebP (converted with sharp, which Next.js already installs).
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "media");
const media = JSON.parse(await readFile(path.join(root, "media.json"), "utf8"));

const jobs = [];
for (const v of Object.values(media.videos)) {
  jobs.push([v.file, v.url], [v.poster, v.posterUrl]);
}
for (const i of Object.values(media.images)) jobs.push([i.file, i.url]);

// sharp ships with Next.js; resolve it from next's own folder (pnpm doesn't hoist it to the top level).
async function toWebp(buf) {
  try {
    const require = createRequire(import.meta.url);
    const nextDir = path.dirname(require.resolve("next/package.json"));
    const sharp = require(require.resolve("sharp", { paths: [nextDir] }));
    return await sharp(buf).webp({ quality: 78 }).toBuffer();
  } catch (err) {
    console.warn(`  ! couldn't convert to WebP (${err.message}); saving the original`);
    return buf;
  }
}

await mkdir(outDir, { recursive: true });
let failed = 0;
for (const [file, url] of jobs) {
  const dest = path.join(outDir, file);
  try {
    await access(dest);
    continue; // already downloaded
  } catch {}
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let buf = Buffer.from(await res.arrayBuffer());
    if (file.endsWith(".webp") && !/image\/webp/.test(res.headers.get("content-type") ?? "")) buf = await toWebp(buf);
    await writeFile(dest, buf);
    console.log(`  ✓ media/${file}`);
  } catch (err) {
    failed++;
    console.warn(`  ✗ media/${file} — ${err.message} (${url})`);
  }
}
if (failed) console.warn(`\n${failed} media file(s) could not be downloaded. Check your internet connection and run: npm run media\n`);
