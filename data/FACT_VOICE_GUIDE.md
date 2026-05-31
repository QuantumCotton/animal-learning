# Change the fun-fact read-aloud voice

The app does **not** lock you into one voice in code. Every spoken fun fact uses whatever voice you put in your `.env` file as `ELEVENLABS_VOICE_ID`. Change that one line, test one animal, and when you like it, regenerate the MP3s.

**Quick preset list:** run `node scripts/list-fact-voice-presets.mjs` or open `data/fact_voice_presets.json`.

---

## Fun bubbly voices for kids

These are **ElevenLabs premade / library voices** with American English where noted. Always preview with a sample fact before committing. IDs below match ElevenLabs public premade listings (SignalWire docs + ElevenLabs voice library).

| Display name | One-line personality | How to find in Voice Library | Voice ID |
|--------------|----------------------|------------------------------|----------|
| **Jessica** | Playful, bright, warm — best “fun teacher” vibe | Search **Jessica**; filter English + American | `cgSgspJ2msm6clMCkdW9` |
| **Gigi** | Childish cartoon voice — sounds like a young kid | Search **Gigi**; Use case: Animation | `jBpfuIE2acCO8z3wKNLl` |
| **Freya** | Energetic, hyped, excited — very bubbly | Search **Freya**; energetic / video game tags | `jsCqWAovK2LkecY7zXl4` |
| **Elli** | Warm, emotional young narrator — expressive but not shouty | Search **Elli** | `MF3mGyEYCl7XYWbV9V6O` |
| **Domi** | Confident, punchy, upbeat — strong energy | Search **Domi** | `AZnzlk1XvdvUeBnXmlld` |
| **Nicole** | Soft, gentle whisper — calm facts (less cartoon) | Search **Nicole** | `piTKgcLEGmPE4e6mEKli` |
| **Dorothy** | Pleasant storybook reader *(British accent)* | Search **Dorothy**; children's stories | `ThT5KcBeYPX3keUQqHPh` |
| **Community voices** | Thousands more — bubbly, cartoon, enthusiastic | Search **bubbly**, **children**, **cartoon** (see steps below) | *(copy ID from the voice you pick)* |

**Voices to skip if you dislike accents:** Lily (British), Charlotte (Swedish), Mimi (Swedish), George (British storyteller).

**Not bubbly (corporate/calm):** Adam, Brian, Rachel, Matilda — fine narrators, but flatter than Jessica/Gigi/Freya.

---

## Why it still sounds the same (troubleshooting checklist)

Work through these in order:

1. **`ELEVENLABS_VOICE_ID` missing or empty in `.env`**  
   If this line is blank, scripts always use the built-in fallback **Adam** (`pNInz6obpgDQGcFmaJgB`) — a calm US male narrator. Changing other `.env` lines (stability, style) without setting a voice ID will still sound like Adam.

2. **You changed `.env` but did not regenerate MP3s**  
   The app plays **saved MP3 files**, not live ElevenLabs. After picking a new voice ID, you must run:
   ```powershell
   npm run sounds:fact-test -- reindeer
   npm run build
   ```

3. **Browser or iPad is caching old audio**  
   Hard refresh the page (Ctrl+Shift+R on PC) or close and reopen the tab. On iPad, force-quit Safari and reopen.

4. **Old MP3 is newer than your `.env` change (unlikely but confusing)**  
   Check file date on `animals/Sounds/reindeer_fact_en.mp3`. If it was created *before* you changed the voice ID, you are still hearing the old recording.

5. **Testing in ElevenLabs preview vs. in the app**  
   The web preview can sound different from `eleven_multilingual_v2` + your `ELEVENLABS_FACT_*` settings. Always test with `npm run sounds:fact-test` for the real sound.

6. **Wrong `.env` file**  
   `.env` must sit next to `package.json` in the project root (same folder as this guide’s parent).

7. **Want even more character without changing voice**  
   In `.env`, try slightly lower stability and higher style (see `.env.example`): e.g. `ELEVENLABS_FACT_STABILITY=0.25`, `ELEVENLABS_FACT_STYLE=0.65`. This adds expression but cannot turn Adam into a cartoon kid — pick **Jessica** or **Gigi** for that.

---

## Find voices in ElevenLabs (step-by-step)

Described as if you are looking at the ElevenLabs website:

1. Sign in at [elevenlabs.io](https://elevenlabs.io).
2. In the left sidebar, click **Voices**.
3. Open the **Voice Library** tab (browse community + premade voices).
4. At the top, use the **search box** and type one of: `bubbly`, `children`, `cartoon`, `enthusiastic`, `young`, or a name like `Jessica`.
5. On the left filters panel:
   - **Language:** English  
   - **Accent:** American (or Neutral)  
   - **Gender:** Female (most kid-friendly bubbly picks)  
   - **Use case:** Narration, Storytelling, or Animation  
6. Click a voice card. You should see a **Play** button and a text box — paste a sample fact:
   > Reindeer can see ultraviolet light, which helps them find food in snowy places.
7. If you like it, click **Add to My Voices** (or **Use** / **Add voice** — wording varies).
8. Go to **Voices** → **My Voices**. Find the voice you added.
9. Click the **⋯** (three dots) menu on that voice → **Copy voice ID** (long code like `cgSgspJ2msm6clMCkdW9`).
10. On your PC, open the project `.env` and set:
    ```
    ELEVENLABS_VOICE_ID=paste-your-voice-id-here
    ```
11. Save `.env`, then run the test commands below.

**Tip:** Premade names (Jessica, Gigi, etc.) also appear under **My Voices** with filter **Type: Default** if your account has legacy default voices.

---

## Before you start

1. Copy `.env.example` to `.env` if you have not already (same folder as `package.json`).
2. Add your **ElevenLabs API key** to `.env` as `ELEVENLABS_API_KEY=` (you only need this once).
3. Set **`ELEVENLABS_VOICE_ID=`** — this is the line that actually picks the voice (see presets above).

---

## Tips for choosing a voice

| Goal | What to try |
|------|-------------|
| Fun bubbly for kids | **Jessica**, **Gigi**, or **Freya** (see table above) |
| Avoid accents you dislike | Filter **American** or **Neutral**; skip British, Swedish, Australian |
| Softer female narrator | **Elli** or **Nicole** |
| Warm male narrator | **Adam**, **Brian**, **Chris** — calm, not cartoon-bubbly |
| Storybook feel (British) | **George** or **Dorothy** — only if you *want* a light British tone |
| Not sure yet | Run `node scripts/list-fact-voice-presets.mjs --env` and try 2–3 IDs with reindeer test |

**Important:** Names like Jessica or Gigi are search hints. Always copy the **Voice ID** from *your* ElevenLabs account when possible. Preset IDs in `fact_voice_presets.json` match public premade listings.

---

## Test one animal (cheap — 3 short MP3s)

In PowerShell, from the project folder:

```powershell
npm run sounds:fact-test -- reindeer
```

This creates English, Tagalog, and Spanish fact audio for **reindeer** only.

- Listen in the app: run `npm run dev`, open reindeer, tap the fact area / sound.
- Or open the files directly: `animals/Sounds/reindeer_fact_en.mp3` (and `_tl`, `_es`).

**Preview without overwriting production files** (optional):

```powershell
node scripts/elevenlabs-fact-voice-test.mjs reindeer --test
```

Files go to `animals/Sounds/tests/` instead.

Repeat with a different `ELEVENLABS_VOICE_ID` until you are happy.

---

## Regenerate all animals (uses API credits)

When you are sure about the voice:

```powershell
npm run sounds:fact-batch -- --all
npm run build
```

- `npm run sounds:fact-batch` alone only does **4 animals** per run (safe for small tests).
- `--all` redoes every animal with a basic fact.
- `npm run build` refreshes the app so iPad/browser pick up new MP3s.

---

## Troubleshooting (quick reference)

| Problem | Fix |
|---------|-----|
| Still hear the old voice / sounds like Adam | Set `ELEVENLABS_VOICE_ID` in `.env`, regenerate MP3s, hard refresh |
| Voice never changes | Checklist in **Why it still sounds the same** above |
| Browser shows old audio | Hard refresh or close/reopen the tab; MP3s are cached |
| Error “Missing .env” | Copy `.env.example` → `.env` and add your API key |
| Tagalog/Spanish sound wrong | Keep `ELEVENLABS_FACT_MODEL=eleven_multilingual_v2` in `.env` (see `.env.example`) |

---

## Where this is wired in the project

| File | Role |
|------|------|
| `.env` → `ELEVENLABS_VOICE_ID` | **Your** chosen voice (this is the setting that matters) |
| `data/fact_voice_presets.json` | Curated bubbly/kid-friendly presets with public IDs |
| `scripts/list-fact-voice-presets.mjs` | Prints presets for copying into `.env` |
| `.env.example` | Template — safe to share, no real keys |
| `scripts/elevenlabs-fact-voice-test.mjs` | Generates one animal’s fact MP3s |
| `scripts/elevenlabs-fact-voice-batch.mjs` | Generates many animals |

You do **not** need to edit JavaScript to change the voice — only `.env` and the regenerate commands above.
