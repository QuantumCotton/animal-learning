/**
 * Batch fun-fact + EDU-fact TTS for manifest animals (categories.json).
 * Same voice settings as elevenlabs-fact-voice-test.mjs (see .env FACT_* vars).
 *
 *   node scripts/elevenlabs-fact-voice-batch.mjs --dry-run
 *   node scripts/elevenlabs-fact-voice-batch.mjs --limit 5
 *   node scripts/elevenlabs-fact-voice-batch.mjs --all
 *   node scripts/elevenlabs-fact-voice-batch.mjs reindeer
 *
 * Progress: data/fact_generation_progress.json (resume-safe)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  loadEnv,
  factVoiceConfig,
  factSpeechText,
  tts,
  DEFAULT_FACT_VOICE_ID,
} from "./elevenlabs-fact-voice-test.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOUNDS_DIR = path.join(ROOT, "animals", "Sounds");
const PROGRESS_PATH = path.join(ROOT, "data", "fact_generation_progress.json");
const CATEGORIES_PATH = path.join(ROOT, "data", "categories.json");
const RECORDS_PATH = path.join(ROOT, "data", "animal_records.json");

const LANGS = ["en", "tl", "es"];
const LEVELS = [
  { key: "basic", suffix: "" },
  { key: "edu", suffix: "_edu" },
];

function parseArgs(argv) {
  const opts = {
    limit: 4,
    dryRun: false,
    all: false,
    only: null,
    callPauseMs: 1500,
    animalPauseMs: 600,
  };
  const positional = [];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--all") opts.all = true;
    else if (a === "--limit" && argv[i + 1]) opts.limit = Number(argv[++i]);
    else if (a === "--pause" && argv[i + 1]) opts.callPauseMs = Number(argv[++i]);
    else if (!a.startsWith("-")) positional.push(a);
  }
  if (positional[0]) opts.only = positional[0];
  return opts;
}

function loadProgress() {
  if (!fs.existsSync(PROGRESS_PATH)) {
    return { startedAt: null, completed: [], failed: {} };
  }
  return JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf8"));
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2) + "\n");
}

function manifestAnimalIds() {
  const categories = JSON.parse(fs.readFileSync(CATEGORIES_PATH, "utf8"));
  const ids = new Set();
  for (const cat of categories.categories) {
    for (const page of cat.pages) {
      for (const id of page.animals) {
        if (id) ids.add(id);
      }
    }
  }
  return [...ids].sort();
}

function fileKey(animalId, level, lang) {
  return `${animalId}:${level}:${lang}`;
}

function outFileName(animalId, levelSuffix, lang) {
  return `${animalId}_fact${levelSuffix}_${lang}.mp3`;
}

function buildQueue(records, animalIds) {
  const items = [];
  for (const animalId of animalIds) {
    const rec = records[animalId];
    if (!rec?.facts) continue;
    for (const { key, suffix } of LEVELS) {
      const factBlock = rec.facts[key];
      if (!factBlock) continue;
      for (const lang of LANGS) {
        const fact = factBlock[lang];
        if (!factSpeechText(fact)) continue;
        items.push({
          key: fileKey(animalId, key, lang),
          animalId,
          level: key,
          levelSuffix: suffix,
          lang,
          fact,
        });
      }
    }
  }
  return items;
}

async function generateItem(apiKey, voiceId, config, item) {
  const text = factSpeechText(item.fact);
  const outFile = path.join(
    SOUNDS_DIR,
    outFileName(item.animalId, item.levelSuffix, item.lang)
  );
  fs.mkdirSync(SOUNDS_DIR, { recursive: true });
  const buf = await tts(apiKey, voiceId, config, text);
  fs.writeFileSync(outFile, buf);
  return { outFile, bytes: buf.length };
}

async function main() {
  const opts = parseArgs(process.argv);
  const env = loadEnv();
  const apiKey = env.ELEVENLABS_API_KEY || env.VITE_ELEVENLABS_API_KEY;
  const voiceId = env.ELEVENLABS_VOICE_ID || DEFAULT_FACT_VOICE_ID;
  const config = factVoiceConfig(env);

  if (!apiKey && !opts.dryRun) throw new Error("Set ELEVENLABS_API_KEY in .env");

  const records = JSON.parse(fs.readFileSync(RECORDS_PATH, "utf8"));
  let animalIds = manifestAnimalIds();
  if (opts.only) animalIds = animalIds.filter((id) => id === opts.only);

  const progress = loadProgress();
  const doneSet = new Set(progress.completed);
  let queue = buildQueue(records, animalIds).filter((item) => !doneSet.has(item.key));

  if (!opts.all) queue = queue.slice(0, opts.limit);

  if (!progress.startedAt && !opts.dryRun && queue.length) {
    progress.startedAt = new Date().toISOString();
    saveProgress(progress);
  }

  const totalNeeded = buildQueue(records, animalIds).length;
  console.log(
    `Fact TTS batch | ${opts.dryRun ? "DRY RUN" : "live"} | voice: ${voiceId} | model: ${config.modelId}`
  );
  console.log(
    `Queue: ${queue.length} files | done: ${progress.completed.length}/${totalNeeded} | failed: ${Object.keys(progress.failed).length}`
  );

  let lastAnimal = null;
  for (const item of queue) {
    const stamp = new Date().toISOString();
    const outName = outFileName(item.animalId, item.levelSuffix, item.lang);
    console.log(`[${stamp}] ${item.key} → ${outName}`);

    if (opts.dryRun) {
      console.log(`  ${factSpeechText(item.fact).slice(0, 90)}…`);
      continue;
    }

    try {
      const { outFile, bytes } = await generateItem(apiKey, voiceId, config, item);
      progress.completed.push(item.key);
      delete progress.failed[item.key];
      saveProgress(progress);
      console.log(`  ok ${outFile} (${bytes} bytes)`);
    } catch (e) {
      progress.failed[item.key] = e.message;
      saveProgress(progress);
      console.error(`  FAIL: ${e.message}`);
    }

    await new Promise((r) => setTimeout(r, opts.callPauseMs));

    if (item.animalId !== lastAnimal) {
      lastAnimal = item.animalId;
      if (opts.animalPauseMs > 0) {
        await new Promise((r) => setTimeout(r, opts.animalPauseMs));
      }
    }
  }

  if (!opts.dryRun) {
    console.log(
      `\nFinished this run. Completed: ${progress.completed.length}/${totalNeeded} | Failed: ${Object.keys(progress.failed).length}`
    );
    console.log("Run: npm run build");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
