/**
 * ElevenLabs Sound Effects batch (animal noises).
 *
 *   node scripts/elevenlabs-sfx-batch.mjs --all
 *   node scripts/elevenlabs-sfx-batch.mjs --limit 4
 *   node scripts/elevenlabs-sfx-batch.mjs --dry-run --all
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PROGRESS_PATH = path.join(ROOT, "data", "sfx_generation_progress.json");

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) throw new Error("Missing .env");
  const out = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

function loadProgress() {
  if (!fs.existsSync(PROGRESS_PATH)) {
    return { completed: [], failed: {}, startedAt: null };
  }
  return JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf8"));
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2) + "\n");
}

function parseArgs(argv) {
  const opts = {
    limit: 4,
    dryRun: false,
    all: false,
    batchPauseMs: 30000,
    itemPauseMs: 800,
    only: null,
  };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--dry-run") opts.dryRun = true;
    else if (argv[i] === "--all") opts.all = true;
    else if (argv[i] === "--limit" && argv[i + 1]) opts.limit = Number(argv[++i]);
    else if (argv[i] === "--batch-pause" && argv[i + 1])
      opts.batchPauseMs = Number(argv[++i]);
    else if (argv[i] === "--only" && argv[i + 1]) opts.only = new Set(argv[++i].split(","));
  }
  return opts;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateSfx(apiKey, prompt, duration, influence) {
  const url = new URL("https://api.elevenlabs.io/v1/sound-generation");
  url.searchParams.set("output_format", "mp3_44100_128");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: prompt,
      duration_seconds: duration,
      prompt_influence: influence,
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

function buildQueue() {
  const queuePath = path.join(ROOT, "data", "animals_need_sounds.json");
  const data = JSON.parse(fs.readFileSync(queuePath, "utf8"));
  return data.animals.filter((a) => a.priority === "generate");
}

async function runBatch(batch, opts, env, apiKey, progress) {
  const outDir = path.join(ROOT, "animals", "Sounds");
  const duration = Number(env.ELEVENLABS_SFX_DURATION || "2");
  const influence = Number(env.ELEVENLABS_SFX_PROMPT_INFLUENCE || "0.55");

  for (const item of batch) {
    const outFile = path.join(outDir, `${item.id}.mp3`);
    const stamp = new Date().toISOString();
    console.log(`[${stamp}] → ${item.id} (${duration}s)`);
    if (opts.dryRun) continue;
    try {
      const buf = await generateSfx(apiKey, item.prompt, duration, influence);
      fs.writeFileSync(outFile, buf);
      progress.completed.push(item.id);
      delete progress.failed[item.id];
      saveProgress(progress);
      console.log(`  ok ${buf.length} bytes`);
    } catch (e) {
      progress.failed[item.id] = e.message;
      saveProgress(progress);
      console.error(`  FAIL: ${e.message}`);
    }
    await sleep(opts.itemPauseMs);
  }
}

async function main() {
  const opts = parseArgs(process.argv);
  const env = loadEnv();
  const apiKey = env.ELEVENLABS_API_KEY || env.VITE_ELEVENLABS_API_KEY;
  if (!apiKey && !opts.dryRun) throw new Error("Set ELEVENLABS_API_KEY in .env");

  const progress = loadProgress();
  const doneSet = new Set(progress.completed);

  let queue = buildQueue().filter((a) => !doneSet.has(a.id));
  if (opts.only) queue = queue.filter((a) => opts.only.has(a.id));

  if (!progress.startedAt && !opts.dryRun) {
    progress.startedAt = new Date().toISOString();
    saveProgress(progress);
  }

  console.log(
    `SFX batch | remaining: ${queue.length} | per round: ${opts.limit} | pause: ${opts.batchPauseMs}ms | duration: ${env.ELEVENLABS_SFX_DURATION || "2"}s | all: ${opts.all}`
  );

  let round = 0;
  while (queue.length > 0) {
    round++;
    const batch = queue.slice(0, opts.limit);
    console.log(`\n=== Round ${round} (${batch.length} animals) ===`);
    await runBatch(batch, opts, env, apiKey, progress);
    queue = queue.slice(opts.limit);
    if (opts.dryRun) break;
    if (!opts.all || queue.length === 0) break;
    console.log(`Waiting ${opts.batchPauseMs / 1000}s before next round…`);
    await sleep(opts.batchPauseMs);
  }

  console.log(`\nFinished. Completed: ${progress.completed.length} | Failed: ${Object.keys(progress.failed).length}`);
  if (!opts.dryRun) console.log("Run: npm run build");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
