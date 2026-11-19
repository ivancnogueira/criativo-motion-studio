# TASK

Create a museum-worthy, architecturally crisp animated explainer in a **Bauhaus & Swiss Neo-Brutalist Grid** style, using the single project configuration below.

Distill ideas into bold geometric primitives—circles, quarter-arcs, triangles, clean diagonal bars, modular Swiss grids, sharp hard shadows, and disciplined asymmetric typography—moving with mechanical precision and satisfying geometric choreography.

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
- Style: Bauhaus Geometric & Swiss Grid Motion (primary shapes + architectural rhythm)
- Sound effects: {{SFX}}
- Background music: {{MUSIC}}
- Final video format: MP4

---

# 2. CONFIGURATION BEHAVIOR

- Follow `Storyboard`, `Voiceover`, `Subtitles`, `Music`, and `SFX` strictly as configured.
- Lock grid subdivisions, shape swaps, and typographic reveals to the attached voiceover duration when enabled.
- Render legible high-contrast subtitles inside safe vertical margins and include SRT download when enabled.

---

# 3. VISUAL DIRECTION — BAUHAUS & SWISS GRID

## Palette
- **Warm architectural cream:** `#F4F1EA`
- **Solid black ink:** `#111111`
- **Pure contrast white:** `#FFFFFF`
- **Bauhaus crimson:** `#D92B2B`
- **Bauhaus ochre yellow:** `#F2B705`
- **Cobalt structural blue:** `#1D4ED8`

## Geometric Grammar
- **Grid Discipline:** Divide the canvas along visible thin architectural hairlines (`rgba(17,17,17,0.10)`). Objects align cleanly to grid cells, slide along tracks, and subdivide spaces mathematically.
- **Primary Shape Storytelling:** Represent concepts, systems, flows, and ratios through clever geometric compositions—rotating quarter-circles, interlocking cog blocks, crisp hard-edged offset shadows (`0 px` blur), and high-contrast negative space cutouts.
- **Swiss Typography:** Crisp geometric sans-serif headers (`Space Grotesk` / `Archivo` / `Inter`), bold numbered indices (`01`, `02`, `03`), and clean tabular alignment. Never use fuzzy blurs or messy gradients here.

---

# 4. MOTION & CHOREOGRAPHY

- **Precision Snaps & Grid Subdivisions:** Shapes rotate in crisp 45°/90° increments (`E.entraSai`), scale cleanly inside grid cells, and split/merge to reveal new concepts.
- **Geometric Tile Wipes:** Transition between compositions using sliding checkerboards, rotating radial gates, and expanding color blocks.

---

# 5. TECHNICAL IMPLEMENTATION & EXPORT

- Render deterministically via `renderAt(t)` using `bauhaus` brush + `kit/movimento.js`, with playback controls and verified `.mp4` export including enabled audio.
- When enabled, synthesize minimalist percussive clicks, wooden marimba taps, and rhythmic geometric synth grooves via Web Audio.

---

# 6. DELIVERABLE

Deliver rendered Bauhaus storyboard previews for approval or the complete playable animation with genuine MP4 export.
