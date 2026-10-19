// Downloads the stock photos and videos listed in media.json into public/media.
// Runs automatically before `npm run dev` and `npm run build`; files already present are skipped.
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "media");
const media = JSON.parse(await readFile(path.join(root, "media.json"), "utf8"));

const jobs = [];
for (const v of Object.values(media.videos)) {
  jobs.push([v.file, v.url], [v.poster, v.posterUrl]);
}
for (const i of Object.values(media.images)) jobs.push([i.file, i.url]);

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
    await writeFile(dest, Buffer.from(await res.arrayBuffer()));
    console.log(`  ✓ media/${file}`);
  } catch (err) {
    failed++;
    console.warn(`  ✗ media/${file} — ${err.message} (${url})`);
  }
}
if (failed) console.warn(`\n${failed} media file(s) could not be downloaded. Check your internet connection and run: npm run media\n`);
