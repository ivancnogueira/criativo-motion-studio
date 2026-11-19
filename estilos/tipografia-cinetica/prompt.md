# TASK

Create an electrifying, high-retention animated explainer in a **Kinetic Typography & Bold Editorial Motion** style, using the single project configuration below.

Make typography the hero actor on screen: oversized headlines that snap, stretch, stack, invert colors, underline, and interact seamlessly with punchy graphic icons, kinetic counters, and rhythmic background bands—so the message hits instantly even with audio muted.

Produce the experience as a playable **HTML Artifact directly inside this conversation**, rendered via deterministic `renderAt(t)` and exporting a genuine downloadable **MP4** video.

---

# 1. PROJECT CONFIGURATION — EDIT SETTINGS ONLY HERE

**Topic:** {{TOPIC}}

- Storyboard: {{STORYBOARD}}
- Voiceover: {{VOICEOVER}}
- Voiceover transcript (optional): {{TRANSCRIPT}}
- Subtitles: {{SUBTITLES}}
- Duration without voiceover: {{DURATION}}
- Format: {{FORMAT}}
- Native resolution: {{RESOLUTION}}
- Target export frame rate: 30 fps
- Preview: Smooth 60 fps where supported
- Style: Kinetic Typography & High-Impact Graphic Rhythm
- Sound effects: {{SFX}}
- Background music: {{MUSIC}}
- Final video format: MP4

---

# 2. CONFIGURATION BEHAVIOR

- Follow `Storyboard`, `Voiceover`, `Subtitles`, `Music`, and `SFX` strictly.
- When voiceover is enabled, lock every typographic slam, word swap, and highlight pulse to the exact spoken word timestamps from `legendas.json`.
- When subtitles are enabled alongside kinetic hero text, keep standard captions small/clean or integrate the emphasis cleanly without overlapping hero words.

---

# 3. VISUAL DIRECTION — KINETIC TYPOGRAPHY

## Palette
- **Rich charcoal stage:** `#111116`
- **Elevated dark block:** `#1E1E28`
- **Crisp paper white:** `#F8F8F4`
- **Punchy vermilion red:** `#FF3B30`
- **Electric highlight yellow:** `#FFD60A`
- **Action emerald:** `#30D158`
- **Electric sky blue:** `#64D2FF`

## Typographic Craft
- **Scale Contrast:** Pair colossal ultra-bold display keywords (`Archivo`, `Space Grotesk`, `900` weight) with crisp compact monospaced tags (`01`, `PASSO 2`, `%`).
- **Typography + Illustration:** Never leave words floating on an empty black void—pair every key phrase with dynamic graphic framing (animated highlights, strike-throughs, sliding marquee bands, giant animated numbers, and crisp icons from `kit/`).
- **Color Inversion Beats:** Use full-screen color flips (e.g., dark stage inverting briefly into `#FFD60A` or `#FF3B30` with dark ink text) for dramatic twists or punchlines.

---

# 4. MOTION & RHYTHM

- **Snap & Settle:** Use sharp exponential ease-out (`E.sai`) and controlled overshoot (`E.volta`) so words arrive with physical weight and lock cleanly into readable grids.
- **Mask Reveals & Sliding Stacks:** Words emerge from invisible clip lines, push neighboring words aside, or morph scale dynamically while background shapes keep flowing.
- **Relentless Pacing:** Visual rhythm updates every 0.8–2.5 seconds; zero dead static frames.

---

# 5. TECHNICAL IMPLEMENTATION & EXPORT

- Build a deterministic `renderAt(t)` Canvas 2D engine using `measureText()` for exact responsive layout fitting inside vertical/horizontal safe areas, plus playback controls and verified `.mp4` export.
- When audio is enabled, synthesize punchy percussive hits, crisp bass drops, whooshes, and rhythmic hip-hop/electronic beats via Web Audio.

---

# 6. DELIVERABLE

Deliver rendered kinetic typography storyboard frames for approval or the finished playable animation with genuine MP4 export.
