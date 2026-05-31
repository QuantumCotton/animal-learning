/**
 * Builds web/data/manifest.json — merges categories + animal_schema contract.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const IMAGES_DIR = path.join(ROOT, "animals", "Images");
const SOUNDS_DIR = path.join(ROOT, "animals", "Sounds");
const SOUND_IMPORTS_PATH = path.join(ROOT, "data", "animal_sound_imports.json");

let soundImports = {};
if (fs.existsSync(SOUND_IMPORTS_PATH)) {
  try {
    soundImports = JSON.parse(fs.readFileSync(SOUND_IMPORTS_PATH, "utf8"));
  } catch {
    soundImports = {};
  }
}
const CATEGORIES_PATH = path.join(ROOT, "data", "categories.json");
const SCHEMA_PATH = path.join(ROOT, "data", "animal_schema.json");
const OVERRIDES_PATH = path.join(ROOT, "data", "animal_records.json");
const OUT_PATH = path.join(ROOT, "web", "data", "manifest.json");

const CATEGORY_DEFAULTS = {
  farm: { habitat: "Farm and barnyard", region: "Worldwide", diet: "Varies by species" },
  forest: { habitat: "Forests and woodlands", region: "Northern hemisphere", diet: "Omnivore or herbivore" },
  jungle: { habitat: "Tropical rainforest", region: "Near the equator", diet: "Varies by species" },
  savannah: { habitat: "Grasslands and savannah", region: "Africa and plains", diet: "Herbivore or carnivore" },
  desert: { habitat: "Deserts and dry scrub", region: "Hot dry regions", diet: "Adapted to scarce food" },
  arctic: { habitat: "Arctic and tundra", region: "Far north and south", diet: "Cold-climate diet" },
  ocean: { habitat: "Oceans and seas", region: "Worldwide waters", diet: "Marine diet" },
  deep_sea: {
    habitat: "Deep ocean and abyss",
    region: "Open ocean trenches",
    diet: "Marine scavengers and hunters",
  },
  freshwater: { habitat: "Rivers, lakes, wetlands", region: "Freshwater worldwide", diet: "Aquatic or riparian" },
  birds: { habitat: "Sky, trees, and shores", region: "Worldwide", diet: "Seeds, fish, or insects" },
  dogs: { habitat: "With people and in the wild", region: "Worldwide", diet: "Omnivore" },
  cats: { habitat: "Many habitats", region: "Worldwide", diet: "Carnivore" },
  reptiles_insects: { habitat: "Land, water, and air", region: "Worldwide", diet: "Varies by species" },
};

function listImages() {
  return new Set(
    fs
      .readdirSync(IMAGES_DIR)
      .filter((f) => f.endsWith(".webp"))
      .map((f) => f.replace(/\.webp$/, ""))
  );
}

function hasNameSound(id) {
  return fs.existsSync(path.join(SOUNDS_DIR, `${id}_name.mp3`));
}

function hasAnimalSound(id) {
  const rel = soundImports[id];
  if (rel && !String(rel).startsWith("_") && fs.existsSync(path.join(SOUNDS_DIR, rel))) {
    return true;
  }
  if (fs.existsSync(path.join(SOUNDS_DIR, `${id}.mp3`)) && !isPlaceholderAnimalMp3(id)) {
    return true;
  }
  return false;
}

function factSoundsFor(id, edu = false) {
  const langs = ["en", "tl", "es"];
  const out = {};
  const namePart = edu ? `_fact_edu_` : `_fact_`;
  for (const lang of langs) {
    const fileName = `${id}${namePart}${lang}.mp3`;
    const main = path.join(SOUNDS_DIR, fileName);
    const inTests = path.join(SOUNDS_DIR, "tests", fileName);
    if (fs.existsSync(main)) out[lang] = `/animals/Sounds/${fileName}`;
    else if (fs.existsSync(inTests)) out[lang] = `/animals/Sounds/tests/${fileName}`;
  }
  return Object.keys(out).length ? out : null;
}

function isPlaceholderAnimalMp3(id) {
  const main = path.join(SOUNDS_DIR, `${id}.mp3`);
  const name = path.join(SOUNDS_DIR, `${id}_name.mp3`);
  if (!fs.existsSync(main) || !fs.existsSync(name)) return false;
  try {
    return fs.statSync(main).size === fs.statSync(name).size;
  } catch {
    return false;
  }
}

function animalSoundPath(id) {
  const rel = soundImports[id];
  if (rel && !String(rel).startsWith("_") && fs.existsSync(path.join(SOUNDS_DIR, rel))) {
    return `/animals/Sounds/${rel.replace(/\\/g, "/")}`;
  }
  if (fs.existsSync(path.join(SOUNDS_DIR, `${id}.mp3`)) && !isPlaceholderAnimalMp3(id)) {
    return `/animals/Sounds/${id}.mp3`;
  }
  return null;
}

function displayName(id) {
  return id
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function tri(en) {
  return { en, tl: en, es: en };
}

function loadFactOverrides() {
  const pathRecords = path.join(ROOT, "data", "animal_records.json");
  if (!fs.existsSync(pathRecords)) return {};
  return JSON.parse(fs.readFileSync(pathRecords, "utf8"));
}

function buildRecord(id, categoryId, overrides) {
  const base = CATEGORY_DEFAULTS[categoryId] || CATEGORY_DEFAULTS.forest;
  const name = displayName(id);
  const record = {
    id,
    name: tri(name),
    heightLength: tri("—"),
    weight: tri("—"),
    facts: {
      basic: tri(`Learn about the ${name.toLowerCase()}!`),
      edu: tri(`Scientists study ${name.toLowerCase()}s to understand life on Earth.`),
    },
    habitat: tri(base.habitat),
    region: tri(base.region),
    diet: tri(base.diet),
    image: `/animals/Images/${id}.webp`,
    nameSound: hasNameSound(id) ? `/animals/Sounds/${id}_name.mp3` : null,
    animalSound: animalSoundPath(id),
    factSounds: factSoundsFor(id, false),
    factSoundsEdu: factSoundsFor(id, true),
  };

  const o = overrides[id];
  if (!o) return record;
  return {
    ...record,
    ...o,
    name: { ...record.name, ...o.name },
    heightLength: { ...record.heightLength, ...o.heightLength },
    weight: { ...record.weight, ...o.weight },
    facts: {
      basic: { ...record.facts.basic, ...o.facts?.basic },
      edu: { ...record.facts.edu, ...o.facts?.edu },
    },
    habitat: { ...record.habitat, ...o.habitat },
    region: { ...record.region, ...o.region },
    diet: { ...record.diet, ...o.diet },
    nameSound: record.nameSound,
    animalSound: record.animalSound,
    factSounds: record.factSounds,
    factSoundsEdu: record.factSoundsEdu,
  };
}

function main() {
  const images = listImages();
  const categories = JSON.parse(fs.readFileSync(CATEGORIES_PATH, "utf8"));
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
  const overrides = loadFactOverrides();

  const used = new Set();
  const warnings = [];

  const manifest = {
    version: 2,
    schema: schema.title,
    grid: { cols: 4, rows: 4, perPage: 16 },
    layout: { columns: "7fr 9fr", gap: "16px" },
    generatedAt: new Date().toISOString(),
    categories: [],
  };

  for (const cat of categories.categories) {
    const pages = [];
    for (const pageDef of cat.pages) {
      const slots = [];
      for (let i = 0; i < 16; i++) {
        const raw = pageDef.animals[i] ?? null;
        if (!raw) {
          slots.push(null);
          continue;
        }
        if (used.has(raw)) {
          warnings.push(`Duplicate skipped: ${raw} in ${cat.id}`);
          slots.push(null);
          continue;
        }
        if (!images.has(raw)) {
          warnings.push(`Missing image: ${raw}`);
          slots.push(null);
          continue;
        }
        used.add(raw);
        slots.push(buildRecord(raw, cat.id, overrides));
      }
      pages.push({
        label: pageDef.label,
        animals: slots,
        filled: slots.filter(Boolean).length,
      });
    }

    manifest.categories.push({
      id: cat.id,
      title: cat.title,
      subtitle: cat.subtitle || "",
      emoji: cat.emoji || "🐾",
      color: cat.color || "#4a7c59",
      tabColor: cat.color || "#4a7c59",
      pages: pages.slice(0, 2),
      totalFilled: pages.reduce((n, p) => n + p.filled, 0),
    });
  }

  manifest.stats = {
    imageCount: images.size,
    assigned: used.size,
    unassigned: [...images].filter((id) => !used.has(id)).length,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Manifest → ${OUT_PATH}`);
  console.log(`Assigned ${used.size} / ${images.size}`);
  if (warnings.length) warnings.slice(0, 10).forEach((w) => console.log(" ", w));
}

main();
