/**
 * Copies mapped ElevenLabs SFX from animals/Sounds/animal sounds/ to animals/Sounds/{id}.mp3
 * so build-manifest.js picks them up as animalSound.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SOUNDS_DIR = path.join(ROOT, "animals", "Sounds");
const MAP_PATH = path.join(ROOT, "data", "animal_sound_imports.json");

function main() {
  const map = JSON.parse(fs.readFileSync(MAP_PATH, "utf8"));
  let ok = 0;
  let skip = 0;

  for (const [id, rel] of Object.entries(map)) {
    if (id.startsWith("_")) continue; // _readme, _unused_*
    const src = path.join(SOUNDS_DIR, rel);
    const dest = path.join(SOUNDS_DIR, `${id}.mp3`);
    if (!fs.existsSync(src)) {
      console.warn(`MISSING source for ${id}: ${rel}`);
      skip++;
      continue;
    }
    fs.copyFileSync(src, dest);
    console.log(`  ${id} ← ${path.basename(rel)}`);
    ok++;
  }

  console.log(`\nLinked ${ok} animal sounds (${skip} skipped). Run: npm run build`);
}

main();
