# Liora — Animal Learning

Interactive **flip-book** for iPad: open book layout, **7:9 left/right pages**, category tabs, **4×4 animal grid**, instant left-panel updates.

## Quick start (Windows)

```powershell
npm run dev
```

Open **http://localhost:5199/web/** (PC or iPad).  
Port **5199** is used so Liora does not clash with other apps on 5173 (e.g. Hypertuner).  
Use the `/web/` path — **not** the project root.

On iPad: Add to Home Screen. Turn the device **landscape** for the full open-book layout.

## UI (graph-paper layout)

| Left page (7fr) | Right page (9fr) |
|-----------------|------------------|
| Square animal image | Title **Liora** + active category |
| Name, height/length, weight | Language: EN / TL / ES |
| Fact (Basic or EDU toggle) | 4×4 touch grid |
| Habitat, region, diet | **Page 1 / Page 2** |
| Sound + Name buttons | Category tabs on book edges |

**Tabs:** categories before the active one stick out on the **left**; active and later categories on the **right** — like turning chunks of a physical book.

## 13 categories

1. Farm & Domestic  
2. Forest & Woods  
3. Jungle & Rainforest  
4. Savannah & Grasslands  
5. Desert Ecosystems  
6. Arctic & Tundra  
7. Ocean & Marine (reefs & open sea)  
8. **Deep Sea** (abyss — so fish don’t land on Savannah)  
9. Freshwater & Wetlands  
10. Avian Species  
11. Canine Breeds  
12. Feline Breeds  
13. Reptiles & Insects  

**Target:** 30 animals per category (2 pages × 16 grid). See **`data/MISSING_ANIMAL_IMAGES.md`** for gaps and suggested new `.webp` slugs to create.

## Data contract

Left panel fields map to **`data/animal_schema.json`**. Per-animal overrides go in **`data/animal_records.json`**, then run `npm run build`.

**Fun facts:** Strict kid-fun regrade (no “I’m a…”, no Santa jokes). Scores in **`data/FUN_FACTS_SCORES.json`**, summary in **`data/FUN_FACTS_AUDIT.md`**. Rewrites in **`data/fun_fact_rewrites.json`**, then:

```powershell
python scripts/generate_animal_records.py
npm run build
```

**Animal sounds (ElevenLabs Sound Effects):**

1. Export MP3s into `animals/Sounds/animal sounds/` (like you did).
2. Map them in `data/animal_sound_imports.json`, then run:

```powershell
npm run sounds:import
npm run build
```

3. Try generating one more via API (same as ElevenLabs “Sound Effects”):

```powershell
npm run sounds:try-sfx
# custom: npm run sounds:try-sfx -- white_tailed_deer "white tailed deer snort in forest"
```

Tap the **big animal photo** or **Sound** to hear `animalSound`. Copy `.env.example` → `.env` with `ELEVENLABS_API_KEY`.

**Spoken fun facts (ElevenLabs Text-to-Speech):** The read-aloud voice is **one setting** in `.env` — `ELEVENLABS_VOICE_ID`. It is not hard-coded to a single person; pick any voice in ElevenLabs Voice Library, copy its ID, paste in `.env`, test, then regenerate. Step-by-step guide (filters, male/female tips, test commands): **`data/FACT_VOICE_GUIDE.md`**.

Quick test one animal, then batch when happy:

```powershell
npm run sounds:fact-test -- reindeer
npm run sounds:fact-batch -- --all
npm run build
```

Tune narration tone with `ELEVENLABS_FACT_*` in `.env` (see `.env.example`). Dry-run batch: `npm run sounds:fact-batch -- --dry-run`

**Checklists (open in Cursor):**

| What you need | File |
|---------------|------|
| **New animal pictures** still to draw (~184) | `data/ANIMALS_TO_CREATE_IMAGES.md` or `data/animals_to_create_images.txt` |
| Summary + per-category counts | `data/MISSING_ANIMAL_IMAGES.md` |
| **ElevenLabs sounds** still to generate (~189) | `data/ANIMALS_NEED_SOUNDS.md` or `data/animals_need_sounds.json` |
| **Change fun-fact read-aloud voice** | `data/FACT_VOICE_GUIDE.md` |

Regenerate checklists: `npm run sounds:checklists`

Batch sounds (5 per run): `npm run sounds:batch -- --limit 5` then `npm run build`

## Commands

| Command | Purpose |
|---------|---------|
| `npm run generate` | Rebuild category animal lists (habitat-safe, no fish in Savannah) |
| `node scripts/generate-categories.js` | Same + writes `data/MISSING_ANIMAL_IMAGES.md` |
| `npm run build` | Build `web/data/manifest.json` |
| `npm run dev` | Generate + build + serve |

## Assets

- `animals/Images/*.webp`  
- `animals/Sounds/*.mp3`  
