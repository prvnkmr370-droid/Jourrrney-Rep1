#!/usr/bin/env node
/**
 * Runs find-commons-images.mjs over every planned chunk, a few at a time.
 *   node scripts/image-campaign/run-search-pool.mjs <jobdir> [concurrency]
 * Chunks that already have a candidates file are skipped, so it can be
 * re-run after an interruption.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";

const jobdir = process.argv[2];
const concurrency = Number(process.argv[3] ?? 5);
const manifestPath = join(jobdir, "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const queue = manifest.filter((m) => !existsSync(m.candidatesFile));
console.log(`chunks to search: ${queue.length} of ${manifest.length}, concurrency ${concurrency}`);

function run(m) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const p = spawn("node", ["scripts/find-commons-images.mjs", m.cardsFile, m.candidatesFile], { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => {
      const ok = code === 0 && existsSync(m.candidatesFile);
      console.log(`${ok ? "done " : "FAIL "} ${m.slug}-${m.chunk} (${m.cards} cards, ${Math.round((Date.now() - t0) / 1000)}s)`);
      m.status = ok ? "searched" : "search-failed";
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
      resolve();
    });
  });
}

let next = 0;
async function worker() {
  while (next < queue.length) await run(queue[next++]);
}
await Promise.all(Array.from({ length: concurrency }, worker));
console.log("search pool finished");
