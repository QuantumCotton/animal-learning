/**
 * Generate animal name pronunciation TTS in EN/TL/ES using the same voice as facts.
 * Usage:
 *   node scripts/generate-name-tts.mjs --dry-run
 *   node scripts/generate-name-tts.mjs --all
 *   node scripts/generate-name-tts.mjs --limit 5
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOUNDS_DIR = path.join(ROOT, "animals", "Sounds");

const API_KEY = process.env.ELEVENLABS_API_KEY || (() => {
  const envPath = path.join(ROOT, ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const l of lines) {
      const m = l.match(/^ELEVENLABS_API_KEY\s*=\s*(.+)/);
      if (m) return m[1].trim();
    }
  }
  return null;
})();

const VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // same as fact voice (Adam)
const MODEL = "eleven_multilingual_v2";
const LANGS = ["en", "tl", "es"];

function loadManifest() {
  const p = path.join(ROOT, "web", "data", "manifest.json");
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

async function tts(text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: {
        stability: 0.30,
        similarity_boost: 0.78,
        style: 0.55,
        speed: 0.92,
        use_speaker_boost: true,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${err}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function parseArgs() {
  const args = process.argv.slice(2);
  let dryRun = false, all = false, limit = 5;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dry-run") dryRun = true;
    else if (args[i] === "--all") all = true;
    else if (args[i] === "--limit" && args[i+1]) limit = parseInt(args[++i]);
  }
  return { dryRun, all, limit };
}

async function main() {
  if (!API_KEY) { console.error("No ELEVENLABS_API_KEY"); process.exit(1); }
  const { dryRun, all, limit } = parseArgs();
  const manifest = loadManifest();
  
  // Collect unique animals with their names
  const animals = [];
  for (const cat of manifest.categories || []) {
    for (const page of cat.pages || []) {
      for (const a of page.animals || []) {
        if (!a || !a.id) continue;
        animals.push({ id: a.id, name: a.name || {} });
      }
    }
  }
  
  // Dedupe by id
  const seen = new Set();
  const unique = animals.filter(a => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
  
  const toProcess = all ? unique : unique.slice(0, limit);
  console.log(`Animals: ${unique.length}, processing: ${toProcess.length}, dryRun: ${dryRun}`);
  
  let done = 0, skipped = 0, failed = 0;
  
  for (const animal of toProcess) {
    for (const lang of LANGS) {
      const displayName = animal.name[lang] || animal.name.en || animal.id.replace(/_/g, " ");
      const filename = `${animal.id}_name_${lang}.mp3`;
      const filepath = path.join(SOUNDS_DIR, filename);
      
      // Skip if already exists
      if (fs.existsSync(filepath)) {
        skipped++;
        continue;
      }
      
      if (dryRun) {
        console.log(`[DRY] ${displayName} (${lang}) → ${filename}`);
        continue;
      }
      
      try {
        console.log(`[${done+1}/${toProcess.length * LANGS.length}] Generating: ${displayName} (${lang})...`);
        const audio = await tts(displayName);
        fs.writeFileSync(filepath, audio);
        done++;
        // Rate limit: 200ms between calls
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        console.error(`  FAILED: ${animal.id} (${lang}): ${err.message}`);
        failed++;
        if (err.message.includes("429")) {
          console.log("Rate limited, waiting 5s...");
          await new Promise(r => setTimeout(r, 5000));
        }
      }
    }
  }
  
  console.log(`\nDone: ${done} generated, ${skipped} skipped (exist), ${failed} failed`);
}

main().catch(console.error);
