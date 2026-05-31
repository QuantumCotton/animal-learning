/**
 * Writes flat checklists for images still to create and sounds to generate.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const missing = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "missing_animal_images.json"), "utf8")
);
const imports = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "animal_sound_imports.json"), "utf8")
);
const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, "web/data/manifest.json"), "utf8")
);

const imageRows = [];
for (const cat of missing.categories) {
  const suggestions = missing.suggestedNew[cat.id] || [];
  for (let i = 0; i < cat.missing; i++) {
    const slug = suggestions[i] || `(pick one for ${cat.title})`;
    imageRows.push({
      category: cat.title,
      slug,
      filename: slug.endsWith(".webp") ? slug : `${slug}.webp`,
      status: "TODO",
    });
  }
}

const displayName = (id) =>
  id
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const imported = new Set(
  Object.keys(imports).filter((k) => !k.startsWith("_"))
);

const inBook = [];
manifest.categories.forEach((cat) => {
  cat.pages.forEach((page) => {
    page.animals.forEach((a) => {
      if (a?.id) inBook.push({ id: a.id, category: cat.title });
    });
  });
});

const soundRows = inBook.map(({ id, category }) => {
  const name = displayName(id);
  const hasUserImport = imported.has(id);
  return {
    id,
    category,
    prompt: `A ${name.toLowerCase()} making realistic natural animal sounds, wildlife sound effect, no music, no speech`,
    hasUserElevenLabsSfx: hasUserImport,
    priority: hasUserImport ? "done" : "generate",
  };
});

const needSfx = soundRows.filter((r) => r.priority === "generate");

let md = `# Animals to create (images)\n\n`;
md += `**Total new illustrations needed:** ${imageRows.length} (to reach **30 animals per category** in all 13 chapters)\n\n`;
md += `You already have **255** \`.webp\` files. This list is **extra animals** we still need art for.\n\n`;
md += `Save each as: \`animals/Images/{slug}.webp\`\n\n`;
md += `| # | Category | Slug | File |\n|---|----------|------|------|\n`;
imageRows.forEach((r, i) => {
  md += `| ${i + 1} | ${r.category} | \`${r.slug}\` | \`${r.filename}\` |\n`;
});

fs.writeFileSync(path.join(ROOT, "data", "ANIMALS_TO_CREATE_IMAGES.md"), md);

const flatImages = imageRows.map((r) => r.slug).filter((s) => !s.startsWith("("));
fs.writeFileSync(
  path.join(ROOT, "data", "animals_to_create_images.txt"),
  flatImages.join("\n") + "\n"
);

fs.writeFileSync(
  path.join(ROOT, "data", "animals_need_sounds.json"),
  JSON.stringify(
    {
      generated: new Date().toISOString().slice(0, 10),
      inBook: inBook.length,
      alreadyElevenLabsSfx: imported.size,
      needElevenLabsSfx: needSfx.length,
      animals: soundRows,
    },
    null,
    2
  ) + "\n"
);

let snd = `# Animals needing ElevenLabs sound effects\n\n`;
snd += `**In the app today:** ${inBook.length} animals\n\n`;
snd += `**Already using your ElevenLabs exports:** ${imported.size}\n\n`;
snd += `**Still to generate (real SFX like your cow/lion files):** ${needSfx.length}\n\n`;
snd += `Run batch (5 at a time so it does not burn all credits at once):\n\n`;
snd += `\`\`\`powershell\nnpm run sounds:batch -- --limit 5\n\`\`\`\n\n`;
snd += `| # | Animal ID | Category | Status |\n|---|-----------|----------|--------|\n`;
soundRows.forEach((r, i) => {
  snd += `| ${i + 1} | \`${r.id}\` | ${r.category} | ${r.hasUserElevenLabsSfx ? "✓ you added" : "generate"} |\n`;
});
fs.writeFileSync(path.join(ROOT, "data", "ANIMALS_NEED_SOUNDS.md"), snd);

console.log(`Images to create: ${imageRows.length} → data/ANIMALS_TO_CREATE_IMAGES.md`);
console.log(`Sounds to generate: ${needSfx.length} → data/ANIMALS_NEED_SOUNDS.md`);
