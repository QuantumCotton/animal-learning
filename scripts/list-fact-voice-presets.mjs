/**
 * Print kid-friendly fact-voice presets for copying into .env
 *
 *   node scripts/list-fact-voice-presets.mjs
 *   node scripts/list-fact-voice-presets.mjs --env
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const presetsPath = path.join(ROOT, "data", "fact_voice_presets.json");

const presets = JSON.parse(fs.readFileSync(presetsPath, "utf8"));
const asEnv = process.argv.includes("--env");

console.log("Fun fact voice presets (data/fact_voice_presets.json)\n");
console.log("Pick one, paste into .env as ELEVENLABS_VOICE_ID=...\n");

for (const p of presets) {
  if (asEnv) {
    if (p.voiceId) {
      console.log(`# ${p.label}`);
      console.log(`ELEVENLABS_VOICE_ID=${p.voiceId}`);
      console.log("");
    }
    continue;
  }

  const id = p.voiceId ? p.voiceId : "(search in ElevenLabs — no fixed public ID)";
  const name = p.elevenlabsName ? p.elevenlabsName : "—";
  console.log(`${p.label}`);
  console.log(`  Search name: ${name}`);
  console.log(`  Voice ID:    ${id}`);
  console.log(`  Notes:       ${p.notes}`);
  console.log("");
}

console.log("After choosing, test one animal:");
console.log("  npm run sounds:fact-test -- reindeer");
console.log("  npm run build");
console.log("");
console.log("Full guide: data/FACT_VOICE_GUIDE.md");
