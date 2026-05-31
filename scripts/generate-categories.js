/**
 * Assigns animal images into 12 Liora book categories by habitat (no cross-biome dumping).
 * Target: 30 animals per category (2 pages × 16 grid, up to 2 empty slots OK).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const IMAGES_DIR = path.join(ROOT, "animals", "Images");
const OUT = path.join(ROOT, "data", "categories.json");
const MISSING_OUT = path.join(ROOT, "data", "MISSING_ANIMAL_IMAGES.md");

const TARGET_PER_CATEGORY = 30;
const SLOTS_PER_CATEGORY = 32;

const all = fs
  .readdirSync(IMAGES_DIR)
  .filter((f) => f.endsWith(".webp"))
  .map((f) => f.replace(/\.webp$/, ""))
  .sort();

const CATEGORIES = [
  { id: "farm", title: "Farm & Domestic", subtitle: "Barnyard & home", emoji: "🚜", color: "#c4a35a" },
  { id: "forest", title: "Forest & Woods", subtitle: "Woodland life", emoji: "🌲", color: "#2d6a4f" },
  { id: "jungle", title: "Jungle & Rainforest", subtitle: "Tropical wild", emoji: "🌴", color: "#1b7a4e" },
  { id: "savannah", title: "Savannah & Grasslands", subtitle: "Open plains", emoji: "🦁", color: "#e9c46a" },
  { id: "desert", title: "Desert Ecosystems", subtitle: "Dry lands", emoji: "🏜️", color: "#d4a574" },
  { id: "arctic", title: "Arctic & Tundra", subtitle: "Ice & snow", emoji: "❄️", color: "#90c8e8" },
  { id: "ocean", title: "Ocean & Marine", subtitle: "Reefs & open sea", emoji: "🌊", color: "#219ebc" },
  {
    id: "deep_sea",
    title: "Deep Sea",
    subtitle: "Abyss & midnight zone",
    emoji: "🦑",
    color: "#1d3557",
  },
  { id: "freshwater", title: "Freshwater & Wetlands", subtitle: "Rivers & lakes", emoji: "💧", color: "#4895ef" },
  { id: "birds", title: "Avian Species", subtitle: "Birds of the world", emoji: "🦜", color: "#5c7cfa" },
  { id: "dogs", title: "Canine Breeds", subtitle: "Dogs & canines", emoji: "🐕", color: "#a66b3f" },
  { id: "cats", title: "Feline Breeds", subtitle: "Cats big & small", emoji: "🐈", color: "#7c5cbf" },
  { id: "reptiles_insects", title: "Reptiles & Insects", subtitle: "Crawl & slither", emoji: "🦎", color: "#84a059" },
];

/** Curated priority order within each biome (first = most important for the book). */
const PRIORITY = {
  farm: [
    "cow", "pig", "chicken", "horse", "goat", "sheep", "duck", "turkey", "rooster", "donkey",
    "llama", "alpaca", "rabbit", "goose", "guinea_pig", "hamster", "ferret", "mule", "pony",
    "pot_bellied_pig", "mouse", "rat", "goldfish", "hedgehog", "wild_boar", "opossum",
    "sugar_glider", "vampire_bat",
  ],
  forest: [
    "black_bear", "brown_bear", "white_tailed_deer", "red_fox", "raccoon", "squirrel",
    "moose", "elk", "beaver", "porcupine", "skunk", "badger", "chipmunk", "mole", "stoat",
    "ermine", "wolverine", "river_otter", "woodpecker", "hawk", "falcon", "bobcat", "lynx",
    "cacomistle", "genet", "civet",
  ],
  jungle: [
    "gorilla", "chimpanzee", "orangutan", "jaguar", "leopard", "sloth", "howler_monkey",
    "capuchin_monkey", "spider_monkey", "lemur", "tapir", "okapi", "chameleon", "green_iguana",
    "boa_constrictor", "python", "poison_dart_frog", "red_eyed_tree_frog", "anteater", "armadillo",
    "kinkajou", "aye_aye", "tarsier", "fruit_bat", "pangolin", "bush_baby", "anaconda",
    "koala", "wombat", "tasmanian_devil",
  ],
  savannah: ["lion", "elephant", "hyena", "aardvark"],
  desert: ["fennec_fox", "jerboa", "scorpion", "gecko"],
  arctic: [
    "polar_bear", "arctic_fox", "arctic_hare", "arctic_wolf", "reindeer", "caribou", "musk_ox",
    "lemming", "walrus", "harp_seal", "harbor_seal", "beluga_whale", "narwhal", "bowhead_whale",
    "sperm_whale", "elephant_seal", "leopard_seal", "weddell_seal", "emperor_penguin",
    "adelie_penguin", "rockhopper_penguin", "krill_antarctic", "snow_goose", "ptarmigan", "puffin",
  ],
  ocean: [
    "clownfish", "angelfish", "jellyfish", "starfish", "seahorse", "sea_turtle", "lobster",
    "hermit_crab", "brain_coral", "sea_anemone", "butterflyfish", "blue_tang", "mandarinfish",
    "moorish_idol", "parrotfish", "triggerfish", "lionfish", "manta_ray", "stingray", "reef_shark",
    "hammerhead_shark", "great_white_shark", "tiger_shark", "sea_urchin", "octopus", "cuttlefish",
    "moray_eel", "pufferfish", "bottlenose_dolphin", "orca", "sea_lion", "sea_otter", "manatee",
    "barracuda", "anglerfish", "blobfish", "vampire_squid", "giant_squid", "dumbo_octopus",
    "goblin_shark", "frilled_shark", "dragonfish", "viperfish", "fangtooth", "gulper_eel",
    "hatchetfish", "lanternfish", "barreleye", "coffinfish", "oarfish", "colossal_squid",
    "cookiecutter_shark", "six_gill_shark", "grenadier_fish", "lizardfish", "snipe_eel", "cusk_eel",
    "chimaera", "ghost_shark", "spookfish", "wolffish", "mariana_snailfish", "faceless_cusk",
    "black_swallower", "deep_sea_jellyfish", "comb_jelly", "abyssal_spiderfish", "beaked_whale",
    "big_red_jelly", "boxfish", "brisingid_starfish", "flashlight_fish", "stonefish", "tripod_fish",
    "trumpetfish", "cleaner_shrimp", "conch_snail", "monophore", "mussel", "napoleon_wrasse",
    "nautilus", "nudibranch", "oyster", "ping_pong_tree_sponge", "plankton", "glass_sponge",
    "deep_sea_cucumber", "deep_sea_amphipod", "stoplight_loosejaw", "siphonophore", "sea_sponge",
    "sea_pig", "sea_pen", "sea_fan", "sea_angel", "sand_dollar", "scallop", "barnacle",
    "fiddler_crab", "giant_clam", "giant_tube_worm", "zombie_worm", "acorn_worm", "krill",
    "japanese_spider_crab", "horseshoe_crab",
  ],
  deep_sea: [
    "anglerfish", "blobfish", "vampire_squid", "dumbo_octopus", "goblin_shark", "frilled_shark",
    "dragonfish", "viperfish", "fangtooth", "gulper_eel", "hatchetfish", "lanternfish", "barreleye",
    "coffinfish", "oarfish", "colossal_squid", "cookiecutter_shark", "six_gill_shark", "grenadier_fish",
    "lizardfish", "snipe_eel", "cusk_eel", "chimaera", "ghost_shark", "spookfish", "wolffish",
    "mariana_snailfish", "faceless_cusk", "black_swallower", "deep_sea_jellyfish", "comb_jelly",
    "abyssal_spiderfish", "beaked_whale", "big_red_jelly", "boxfish", "brisingid_starfish",
    "flashlight_fish", "stonefish", "tripod_fish", "trumpetfish", "conch_snail", "monophore",
    "ping_pong_tree_sponge", "plankton", "glass_sponge", "deep_sea_cucumber", "deep_sea_amphipod",
    "stoplight_loosejaw", "siphonophore", "sea_sponge", "sea_pig", "acorn_worm", "zombie_worm",
    "giant_tube_worm",
  ],
  freshwater: [
    "beaver", "river_otter", "turtle", "salamander", "goldfish", "duck", "goose", "flounder",
  ],
  birds: [
    "eagle", "falcon", "hawk", "hummingbird", "cockatiel", "parakeet", "cardinal", "blue_jay",
    "pelican", "seagull", "albatross", "turkey_vulture", "penguin", "snowy_owl", "parrot",
    "macaw", "toucan", "barn_owl", "great_horned_owl", "woodpecker",
  ],
  dogs: ["border_collie", "golden_retriever", "coyote", "arctic_wolf", "wolf"],
  cats: ["siamese_cat", "tabby_cat", "bengal_tiger", "bobcat", "lynx", "lion", "leopard", "jaguar"],
  reptiles_insects: [
    "moth", "tarantula", "firefly", "leafcutter_ant", "chameleon", "python", "boa_constrictor",
    "green_iguana", "turtle", "sea_turtle", "scorpion", "gecko",
  ],
};

/** Suggested new animals to illustrate (slug = filename without .webp). */
const SUGGESTED_NEW = {
  savannah: [
    "zebra", "giraffe", "cheetah", "hippopotamus", "rhinoceros", "warthog", "meerkat", "ostrich",
    "gazelle", "wildebeest", "baboon", "cape_buffalo", "mongoose", "serval", "jackal",
    "secretary_bird", "hornbill", "vulture_african", "impala", "springbok", "eland", "kudu",
    "nyala", "oryx", "gemsbok", "ground_hornbill",
  ],
  desert: [
    "camel", "roadrunner", "desert_tortoise", "gila_monster", "horned_lizard", "desert_hare",
    "coyote_desert", "desert_iguana", "thorny_devil", "sand_cat", "desert_monitor", "kangaroo_rat",
    "desert_snake", "vulture_desert", "desert_beetle", "tarantula_desert", "scorpion_emperor",
    "desert_fox", "armadillo_desert", "pronghorn", "jackrabbit", "burrowing_owl", "desert_bighorn",
    "sidewinder", "desert_ant", "desert_bat",
  ],
  freshwater: [
    "trout", "bass", "catfish", "crayfish", "dragonfly", "newt", "frog_bull", "heron_great_blue",
    "kingfisher", "muskrat", "snapping_turtle", "paddlefish", "carp", "pike", "walleye",
    "loon", "mallard", "swan", "cormorant", "otter_giant", "platypus", "crocodile_nile",
    "hippo_river", "dragonfly_nymph", "water_strider", "freshwater_stingray",
  ],
  dogs: [
    "german_shepherd", "labrador", "poodle", "beagle", "bulldog", "husky", "dachshund", "chihuahua",
    "rottweiler", "boxer", "corgi", "shih_tzu", "maltese", "great_dane", "doberman", "akita",
    "samoyed", "dalmatian", "cocker_spaniel", "australian_shepherd", "pit_bull", "mastiff",
    "greyhound", "basset_hound", "dingo", "african_wild_dog",
  ],
  cats: [
    "persian_cat", "maine_coon", "ragdoll", "sphynx", "british_shorthair", "scottish_fold",
    "bengal_cat", "abyssinian", "russian_blue", "burmese", "cheetah", "cougar", "snow_leopard",
    "ocelot", "serval_cat", "caracal", "fishing_cat", "margay", "clouded_leopard",
    "black_panther", "sand_cat_wild", "lynx_canada", "bobcat_wild", "tiger_siberian",
    "lioness", "leopard_snow",
  ],
  reptiles_insects: [
    "ant", "bee", "butterfly", "dragonfly_insect", "grasshopper", "ladybug", "beetle", "stick_insect",
    "praying_mantis", "centipede", "millipede", "snail_garden", "slug", "alligator", "crocodile",
    "komodo_dragon", "monitor_lizard", "skink", "garter_snake", "rattlesnake", "cobra",
    "king_snake", "tortoise", "terrapin",
  ],
  farm: ["turkey_broad", "peacock_farm", "peacock"],
  forest: ["gray_wolf", "red_panda", "marten", "weasel", "flying_squirrel"],
  jungle: ["toucan_jungle", "macaw_scarlet", "tree_frog", "toucan_channel"],
  arctic: ["snowy_owl_arctic", "ivory_gull", "arctic_tern", "beluga", "ringed_seal"],
  birds: ["robin", "sparrow", "crow", "raven", "flamingo", "peacock", "ostrich_bird", "crane"],
  ocean: [],
  deep_sea: [],
};

const DEEP_SEA_RE =
  /deep_sea|abyssal|mariana|faceless|black_swallower|barreleye|gulper|fangtooth|viperfish|hatchet|lantern|coffin|grenadier|lizardfish|snipe_eel|cusk_eel|chimaera|ghost_shark|spookfish|wolffish|cookiecutter|six_gill|goblin|frilled|dragonfish|colossal|oarfish|beaked_whale|monophore|stoplight|siphonophore|sea_pig|comb_jelly|tripod|trumpet|stonefish|flashlight|big_red_jelly|brisingid|glass_sponge|ping_pong|acorn_worm|zombie_worm|giant_tube|basket_star|abyssal_spiderfish|faceless_cusk|deep_sea_jellyfish|deep_sea_cucumber|deep_sea_amphipod/i;

const OCEAN_EXPLICIT = new Set(PRIORITY.ocean);

const MARINE_RE =
  /(?:^|_)(?:fish|shark|eel|squid|octopus|jelly|coral|whale|dolphin|seal|otter|manatee|sponge|krill|plankton|mussel|oyster|nautilus|wrasse|shrimp|starfish|urchin|anemone|lobster|crab|ray|tang|clam|amphipod|cucumber|barreleye|viperfish|fangtooth|gulper|hatchet|lantern|coffin|oar|colossal|abyssal|mariana|faceless|swallower|comb_jelly|barracuda|reef|moray|cuttlefish|puffer|stonefish|tripod|trumpet|boxfish|brisingid|beaked|cleaner|conch|monophore|nudibranch|ping_pong|siphonophore|sea_|deep_sea|stoplight|spook|ghost_shark|chimaera|cusk|snipe|grenadier|lizardfish|wolffish|cookiecutter|six_gill|goblin|frilled|dragonfish|blob|angler|dumbo|giant_squid|vampire_squid|flashlight|mandarin|moorish|parrotfish|trigger|lionfish|hammerhead|great_white|tiger_shark|stingray|manta|hermit|brain_coral|butterflyfish|blue_tang|clownfish|angelfish|seahorse|sea_turtle|scallop|sand_dollar|barnacle|fiddler|giant_clam|giant_tube|zombie_worm|acorn_worm|sea_pen|sea_fan|sea_angel|sea_lion|sea_pig|beluga|narwhal|orca|bottlenose|bowhead|sperm|harp_seal|harbor_seal|elephant_seal|leopard_seal|weddell|horseshoe)(?:_|$)|clownfish|angelfish|jellyfish|starfish|seahorse|lobster|hermit_crab|manatee|flounder/i;

const ARCTIC_IDS = new Set([
  "polar_bear", "arctic_fox", "arctic_hare", "arctic_wolf", "reindeer", "caribou", "musk_ox",
  "lemming", "walrus", "harp_seal", "harbor_seal", "beluga_whale", "narwhal", "bowhead_whale",
  "sperm_whale", "elephant_seal", "leopard_seal", "weddell_seal", "emperor_penguin",
  "adelie_penguin", "rockhopper_penguin", "krill_antarctic", "snow_goose", "ptarmigan", "puffin",
]);

const FARM_IDS = new Set(PRIORITY.farm);
const FOREST_IDS = new Set(PRIORITY.forest);
const JUNGLE_IDS = new Set(PRIORITY.jungle);
const SAVANNAH_IDS = new Set(PRIORITY.savannah);
const DESERT_IDS = new Set(PRIORITY.desert);
const BIRDS_IDS = new Set(PRIORITY.birds);
const DOGS_IDS = new Set(PRIORITY.dogs);
const CATS_IDS = new Set(PRIORITY.cats);
const REPTILES_IDS = new Set(PRIORITY.reptiles_insects);
const FRESHWATER_IDS = new Set(PRIORITY.freshwater);

function isMarine(id) {
  return OCEAN_EXPLICIT.has(id) || MARINE_RE.test(id);
}

function classify(id) {
  if (DEEP_SEA_RE.test(id) && !ARCTIC_IDS.has(id)) return "deep_sea";
  if (isMarine(id) && !ARCTIC_IDS.has(id)) return "ocean";
  if (FARM_IDS.has(id)) return "farm";
  if (SAVANNAH_IDS.has(id)) return "savannah";
  if (DESERT_IDS.has(id)) return "desert";
  if (ARCTIC_IDS.has(id)) return "arctic";
  if (DOGS_IDS.has(id)) return "dogs";
  if (CATS_IDS.has(id)) return "cats";
  if (JUNGLE_IDS.has(id)) return "jungle";
  if (FOREST_IDS.has(id)) return "forest";
  if (BIRDS_IDS.has(id)) return "birds";
  if (REPTILES_IDS.has(id)) return "reptiles_insects";
  if (FRESHWATER_IDS.has(id)) return "freshwater";
  if (isMarine(id)) return "ocean";
  if (/(lion|elephant|hyena)/.test(id)) return "savannah";
  if (/(fennec|jerboa|scorpion|gecko)/.test(id)) return "desert";
  if (/(bear|deer|moose|elk|squirrel|raccoon|fox|wolf|beaver|woodpecker)/.test(id))
    return "forest";
  if (/(gorilla|monkey|sloth|lemur|tapir|okapi|anaconda|pangolin|anteater)/.test(id))
    return "jungle";
  if (/(owl|eagle|falcon|hawk|bird|parrot|macaw|toucan|penguin|pelican|gull|vulture|humming)/.test(id))
    return "birds";
  if (/(moth|tarantula|firefly|ant|spider|scorpion|gecko|chameleon|python|iguana|turtle|frog)/.test(id))
    return "reptiles_insects";
  if (/(beaver|otter|salamander|duck|goose)/.test(id)) return "freshwater";
  return "forest";
}

function sortByPriority(categoryId, ids) {
  const order = PRIORITY[categoryId] || [];
  const rank = new Map(order.map((id, i) => [id, i]));
  return [...ids].sort((a, b) => {
    const ra = rank.has(a) ? rank.get(a) : 9999;
    const rb = rank.has(b) ? rank.get(b) : 9999;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });
}

function padSlots(arr) {
  const out = arr.slice(0, SLOTS_PER_CATEGORY);
  while (out.length < SLOTS_PER_CATEGORY) out.push(null);
  return out.slice(0, SLOTS_PER_CATEGORY);
}

function makePages(animals, labels) {
  const list = animals.slice(0, SLOTS_PER_CATEGORY);
  const padded = padSlots(list);
  return [
    { label: labels[0], animals: padded.slice(0, 16) },
    { label: labels[1], animals: padded.slice(16, 32) },
  ];
}

const buckets = Object.fromEntries(CATEGORIES.map((c) => [c.id, []]));

for (const id of all) {
  const cat = classify(id);
  buckets[cat].push(id);
}

for (const key of Object.keys(buckets)) {
  buckets[key] = sortByPriority(key, buckets[key]);
}

const overflow = {};
for (const key of Object.keys(buckets)) {
  if (buckets[key].length > SLOTS_PER_CATEGORY) {
    overflow[key] = buckets[key].slice(SLOTS_PER_CATEGORY);
    buckets[key] = buckets[key].slice(0, SLOTS_PER_CATEGORY);
  }
}

const config = {
  version: 3,
  grid: { cols: 4, rows: 4, perPage: 16 },
  targetPerCategory: TARGET_PER_CATEGORY,
  categories: CATEGORIES.map((m) => ({
    ...m,
    type: "full",
    pages: makePages(buckets[m.id], [`${m.title} — Page 1`, `${m.title} — Page 2`]),
  })),
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(config, null, 2));

let total = 0;
const report = [];
for (const c of config.categories) {
  const n = c.pages.reduce((s, p) => s + p.animals.filter(Boolean).length, 0);
  total += n;
  const missing = Math.max(0, TARGET_PER_CATEGORY - n);
  report.push({ id: c.id, title: c.title, have: n, missing, overflow: (overflow[c.id] || []).length });
  console.log(`  ${c.id}: ${n}/${TARGET_PER_CATEGORY}${missing ? ` (need ${missing} more)` : ""}`);
}
console.log(`Total placed: ${total} / ${all.length}`);
if (Object.keys(overflow).length) {
  console.log("Overflow (correct biome, not shown — expand category or add pages later):");
  for (const [k, v] of Object.entries(overflow)) console.log(`  ${k}: ${v.length} — ${v.slice(0, 5).join(", ")}...`);
}

const lines = [
  "# Missing animal images (target: 30 per category)",
  "",
  `**Generated:** ${new Date().toISOString().slice(0, 10)}  `,
  `**Images on disk:** ${all.length}  `,
  `**Target total slots:** ${CATEGORIES.length * TARGET_PER_CATEGORY} (${CATEGORIES.length} categories × ${TARGET_PER_CATEGORY})  `,
  `**Gap to fill all categories:** ${Math.max(0, CATEGORIES.length * TARGET_PER_CATEGORY - total)} new illustrations  `,
  "",
  "Save new art as `animals/Images/{slug}.webp` (slug = lowercase, underscores).",
  "",
  "## Current counts",
  "",
  "| Category | Have | Need | Priority |",
  "|----------|-----:|-----:|----------|",
];

let totalMissing = 0;
for (const r of report) {
  totalMissing += r.missing;
  const pri = r.missing > 0 ? (r.missing >= 15 ? "High" : r.missing >= 8 ? "Medium" : "Low") : "✓ Full";
  lines.push(`| ${r.title} | ${r.have} | ${r.missing} | ${pri} |`);
}

lines.push("", `**Sum of per-category gaps:** ${totalMissing} image(s) to reach 30 in every chapter.`, "");
lines.push("## Suggested new animals to create (by category)", "");
lines.push("These slugs are **not** in the project yet — good candidates for AI art or illustration.", "");

for (const c of CATEGORIES) {
  const r = report.find((x) => x.id === c.id);
  if (!r || r.missing === 0) continue;
  const suggestions = (SUGGESTED_NEW[c.id] || []).slice(0, r.missing);
  const existing = buckets[c.id];
  lines.push(`### ${c.title} (need ${r.missing})`, "");
  lines.push("**Already in this chapter:** " + (existing.length ? existing.join(", ") : "—"), "");
  if (overflow[c.id]?.length) {
    lines.push(
      `**Waiting in overflow** (${overflow[c.id].length} correct animals, no room at 30 cap): ${overflow[c.id].join(", ")}`,
      ""
    );
  }
  lines.push("**Suggested new image slugs:**", "");
  for (const slug of suggestions) {
    lines.push(`- \`${slug}.webp\` — ${slug.replace(/_/g, " ")}`);
  }
  if (suggestions.length < r.missing) {
    lines.push(`- _(${r.missing - suggestions.length} more open slots — pick any animal that fits this biome)_`);
  }
  lines.push("");
}

const notInBook = [];
for (const [key, ids] of Object.entries(overflow)) {
  for (const id of ids) notInBook.push({ id, category: key });
}
if (notInBook.length) {
  lines.push("## Animals with images but not in the book yet (44 max slots)", "");
  lines.push(
    `These **${notInBook.length}** animals have a \`.webp\` file but did not fit in 2 pages (32 slots) for their chapter. Add a Page 3 later or rebalance:`,
    ""
  );
  for (const { id, category } of notInBook) {
    lines.push(`- \`${id}.webp\` (${category})`);
  }
  lines.push("");
}

lines.push("## Ocean / Deep Sea overflow", "");
const oceanOver = [...(overflow.ocean || []), ...(overflow.deep_sea || [])];
if (oceanOver.length) {
  lines.push(
    `**${oceanOver.length}** extra marine animals waiting for more pages or slots:`,
    "",
    oceanOver.map((id) => `- \`${id}\``).join("\n"),
    ""
  );
}

const jsonOut = {
  generated: new Date().toISOString().slice(0, 10),
  targetPerCategory: TARGET_PER_CATEGORY,
  imagesOnDisk: all.length,
  categories: report,
  suggestedNew: SUGGESTED_NEW,
  notInBook: notInBook.map((x) => x.id),
  overflowByCategory: overflow,
};
fs.writeFileSync(
  path.join(ROOT, "data", "missing_animal_images.json"),
  JSON.stringify(jsonOut, null, 2)
);

lines.push("## Commands after adding images", "");
lines.push("```powershell");
lines.push("node scripts/generate-categories.js");
lines.push("python scripts/generate_animal_records.py   # if you added records for new animals");
lines.push("npm run build");
lines.push("```");

fs.writeFileSync(MISSING_OUT, lines.join("\n"));
console.log(`\nWrote ${MISSING_OUT}`);
