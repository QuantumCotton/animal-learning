/**
 * Strict kid-fun scoring for basic facts (0-100). Outputs data/FUN_FACTS_SCORES.json
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const records = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "animal_records.json"), "utf8")
);
const rewrites = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "fun_fact_rewrites.json"), "utf8")
);

function score(en) {
  let s = 88;
  if (/^I('|m|ve| )/i.test(en) || /^My /i.test(en) || /^I've /i.test(en)) s -= 18;
  if (/santa/i.test(en)) s -= 15;
  if (/scientific|phytoplankton|Osedax|Monoplacophoran/i.test(en)) s -= 12;
  if (en.length > 140) s -= 8;
  if (en.length < 40) s -= 5;
  if (/secret heroes|food web|herbivore|omnivore|ruminant/i.test(en)) s -= 10;
  if (/learn about|scientists study/i.test(en)) s -= 25;
  if (/—/.test(en) && en.split("—").length > 2) s -= 5;
  if (!/[.!?]$/.test(en.trim())) s -= 3;
  if (/super smart|very intelligent|worldwide/i.test(en)) s -= 6;
  if (/like a|parang|como un/i.test(en)) s += 4;
  if (/\bSNAP\b|wow|surprise|silly|goofy|ninja|spaghetti/i.test(en)) s += 5;
  return Math.max(0, Math.min(100, s));
}

const rows = Object.keys(records)
  .sort()
  .map((id) => {
    const en = records[id].facts.basic.en;
    const sc = score(en);
    return {
      id,
      score: sc,
      rewritten: Boolean(rewrites[id]),
      en,
      status: sc >= 80 ? "keep" : "rewrite",
    };
  });

const below = rows.filter((r) => r.score < 80);
const report = {
  generated: new Date().toISOString().slice(0, 10),
  rubric:
    "Strict kid engagement: surprise, concrete imagery, no I'm/My/Santa, no textbook tone.",
  total: rows.length,
  keep: rows.filter((r) => r.score >= 80).length,
  below80: below.length,
  rewritesApplied: Object.keys(rewrites).length,
  animals: rows,
};

fs.writeFileSync(
  path.join(ROOT, "data", "FUN_FACTS_SCORES.json"),
  JSON.stringify(report, null, 2)
);

let md = `# Fun facts scores (strict regrade)\n\n`;
md += `**${report.keep}/${report.total}** scored **80+** · **${report.below80}** still below 80 · **${report.rewritesApplied}** custom rewrites applied\n\n`;
md += `| Score band | Count |\n|------------|------:|\n`;
const bands = [[90, 100], [80, 89], [70, 79], [0, 69]];
for (const [lo, hi] of bands) {
  const n = rows.filter((r) => r.score >= lo && r.score <= hi).length;
  md += `| ${lo}–${hi} | ${n} |\n`;
}
md += `\n## Still below 80 (need polish)\n\n`;
for (const r of below) {
  md += `- **${r.id}** (${r.score}): ${r.en}\n`;
}
fs.writeFileSync(path.join(ROOT, "data", "FUN_FACTS_AUDIT.md"), md);
console.log(`keep ${report.keep}, below80 ${report.below80}, rewrites ${report.rewritesApplied}`);
