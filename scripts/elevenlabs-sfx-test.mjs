/**
 * Test ElevenLabs Sound Effects API (same feature as the web UI "Sound Effects").
 * Generates one SFX from a text prompt — e.g. white-tailed deer.
 *
 * Usage (from project root):
 *   node scripts/elevenlabs-sfx-test.mjs
 *   node scripts/elevenlabs-sfx-test.mjs white_tailed_deer "white tailed deer snort in quiet forest"
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env — copy .env.example and add ELEVENLABS_API_KEY");
    process.exit(1);
  }
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

const env = loadEnv();
const apiKey = env.ELEVENLABS_API_KEY || env.VITE_ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("Set ELEVENLABS_API_KEY in .env");
  process.exit(1);
}

const animalId = process.argv[2] || "white_tailed_deer";
const prompt =
  process.argv[3] ||
  "A white-tailed deer snorting and stomping softly in autumn woods, realistic wildlife sound effect, single animal, no music";

const duration = Number(env.ELEVENLABS_SFX_DURATION || "4");
const influence = Number(env.ELEVENLABS_SFX_PROMPT_INFLUENCE || "0.55");

console.log("Animal:", animalId);
console.log("Prompt:", prompt);
console.log("Duration (s):", duration, "| prompt_influence:", influence);

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

if (!res.ok) {
  const errText = await res.text();
  console.error("ElevenLabs error", res.status, errText);
  process.exit(1);
}

const buf = Buffer.from(await res.arrayBuffer());
const outDir = path.join(ROOT, "animals", "Sounds");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `${animalId}.mp3`);
fs.writeFileSync(outFile, buf);

console.log(`\nSaved: ${outFile}`);
console.log("Next: npm run build   then test Sound button or tap the big photo in the app.");
