/**
 * Generate spoken fun facts (Text-to-Speech) in EN / TL / ES for one animal.
 * Uses fact text only (no "Hi I'm a…" intro).
 *
 *   node scripts/elevenlabs-fact-voice-test.mjs
 *   node scripts/elevenlabs-fact-voice-test.mjs reindeer
 *   node scripts/elevenlabs-fact-voice-test.mjs reindeer --test
 *
 * Production files: animals/Sounds/{id}_fact_{en,tl,es}.mp3
 * Preview (--test):  animals/Sounds/tests/{id}_fact_{en,tl,es}.mp3
 *
 * Voice: set ELEVENLABS_VOICE_ID in .env (see data/FACT_VOICE_GUIDE.md).
 * If unset, falls back to premade Adam (US male narrator). Preview voices in
 * ElevenLabs Voice Library with a sample fact before pasting the voice ID.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

/** Premade fallback when ELEVENLABS_VOICE_ID is unset — Adam (US male, narration). */
export const DEFAULT_FACT_VOICE_ID = "pNInz6obpgDQGcFmaJgB";

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

function envNum(env, keys, fallback) {
  for (const key of keys) {
    const v = env[key];
    if (v !== undefined && v !== "") return Number(v);
  }
  return Number(fallback);
}

function envBool(env, keys, fallbackTrue) {
  for (const key of keys) {
    const v = env[key];
    if (v !== undefined && v !== "") return v !== "false" && v !== "0";
  }
  return fallbackTrue;
}

/** Kid-friendly TTS: spoken fact only (matches on-screen basic fact). */
function factSpeechText(fact) {
  return String(fact || "").trim();
}

function factVoiceConfig(env) {
  return {
    // Do not fall back to ELEVENLABS_MODEL (often turbo/English-only for other tools).
    modelId: env.ELEVENLABS_FACT_MODEL || "eleven_multilingual_v2",
    stability: envNum(
      env,
      ["ELEVENLABS_FACT_STABILITY", "ELEVENLABS_STABILITY"],
      "0.30"
    ),
    similarity_boost: envNum(
      env,
      ["ELEVENLABS_FACT_SIMILARITY_BOOST", "ELEVENLABS_SIMILARITY_BOOST"],
      "0.78"
    ),
    style: envNum(env, ["ELEVENLABS_FACT_STYLE", "ELEVENLABS_STYLE"], "0.55"),
    speed: envNum(env, ["ELEVENLABS_FACT_SPEED", "ELEVENLABS_SPEED"], "0.96"),
    use_speaker_boost: envBool(
      env,
      ["ELEVENLABS_FACT_USE_SPEAKER_BOOST", "ELEVENLABS_USE_SPEAKER_BOOST"],
      true
    ),
  };
}

async function tts(apiKey, voiceId, config, text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const body = {
    text,
    model_id: config.modelId,
    voice_settings: {
      stability: config.stability,
      similarity_boost: config.similarity_boost,
      style: config.style,
      speed: config.speed,
      use_speaker_boost: config.use_speaker_boost,
    },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

function parseArgs(argv) {
  const positional = [];
  let testMode = false;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--test") testMode = true;
    else if (!a.startsWith("-")) positional.push(a);
  }
  return { animalId: positional[0] || "reindeer", testMode };
}

async function main() {
  const { animalId, testMode } = parseArgs(process.argv);
  const env = loadEnv();
  const apiKey = env.ELEVENLABS_API_KEY || env.VITE_ELEVENLABS_API_KEY;
  const voiceId = env.ELEVENLABS_VOICE_ID || DEFAULT_FACT_VOICE_ID;
  const config = factVoiceConfig(env);

  if (!apiKey) throw new Error("Set ELEVENLABS_API_KEY in .env");
  if (!voiceId) {
    throw new Error(
      "Set ELEVENLABS_VOICE_ID in .env (ElevenLabs → Voices → copy voice ID)"
    );
  }

  const records = JSON.parse(
    fs.readFileSync(path.join(ROOT, "data", "animal_records.json"), "utf8")
  );
  const rec = records[animalId];
  if (!rec?.facts?.basic) throw new Error(`No record for ${animalId}`);

  const outDir = testMode
    ? path.join(ROOT, "animals", "Sounds", "tests")
    : path.join(ROOT, "animals", "Sounds");
  fs.mkdirSync(outDir, { recursive: true });

  const langs = [
    { code: "en", fact: rec.facts.basic.en },
    { code: "tl", fact: rec.facts.basic.tl },
    { code: "es", fact: rec.facts.basic.es },
  ];

  console.log(`Animal: ${animalId}`);
  console.log(`Voice: ${voiceId}`);
  console.log(
    `Model: ${config.modelId} | stability: ${config.stability} | style: ${config.style} | speed: ${config.speed} | speaker_boost: ${config.use_speaker_boost}`
  );
  console.log(`Output: ${outDir}\n`);

  for (const { code, fact } of langs) {
    const line = factSpeechText(fact);
    const outFile = path.join(outDir, `${animalId}_fact_${code}.mp3`);
    console.log(`[${code}] ${line}`);
    const buf = await tts(apiKey, voiceId, config, line);
    fs.writeFileSync(outFile, buf);
    console.log(`  → ${outFile} (${buf.length} bytes)\n`);
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(
    testMode
      ? "Preview files in animals/Sounds/tests/. Re-run without --test to write production MP3s."
      : "Done. Run npm run build if the app was already open (browser may cache old MP3s)."
  );
}

export { loadEnv, factVoiceConfig, factSpeechText, tts };

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
