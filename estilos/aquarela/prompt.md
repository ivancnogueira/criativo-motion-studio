# TASK

Create a luminous, tactile animated explainer in a **Watercolor & Living Ink** (*Aquarela*) style, using the single project configuration below.

Simulate organic wet-on-wet watercolor blooms, soft translucent pigment layering over textured cotton paper, subtle ink linework, and serene editorial typography. Every idea flows gracefully into the next like paint diffusing in water.

Produce the experience as a playable **HTML Artifact directly inside this conversation**, using deterministic `renderAt(t)` rendering and exporting a genuine **MP4** file with all enabled audio.

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
- Style: Watercolor & Botanical Ink Illustration (organic pigment washes + delicate ink strokes)
- Sound effects: {{SFX}}
- Background music: {{MUSIC}}
- Final video format: MP4

---

# 2. CONFIGURATION BEHAVIOR

- Obey `Storyboard` strictly: render genuine watercolor preview frames and wait for approval when enabled; build the full video directly when disabled.
- Use attached voiceover MP3 duration as the master clock when enabled; otherwise use configured duration.
- When subtitles are enabled, integrate legible captions seamlessly over soft translucent washes and provide SRT download.
- Synthesize music and SFX only when enabled, ducking music cleanly under voiceover.

---

# 3. VISUAL DIRECTION — WATERCOLOR & LIVING INK

## Palette
- **Cotton watercolor paper:** `#FAF6EE` (cached procedural paper grain + subtle warm tooth)
- **Sepia/charcoal ink:** `#2B303A`
- **Pure paper highlight:** `#FFFDF8`
- **Cerulean wash:** `#4C7EA8`
- **Terracotta coral bloom:** `#E07A5F`
- **Sage botanical wash:** `#81B29A`
- **Soft ochre gold:** `#F2CC8F`

## Material & Pigment Behavior
- **Layered Translucent Washes:** Never fill shapes with harsh flat digital solids. Composite overlapping translucent radial washes and organically jittered polygon edges with darker pigment pooling subtly at the outer rim ("wet edge" ring).
- **Delicate Ink Drawing:** Pair soft washes with expressive fine ink outlines (`#2B303A`) that draw onto the page slightly offset from the paint fill, creating an authentic hand-illustrated look.
- **Typography:** Combine refined serif italic keywords (`Georgia` / editorial serif) with clean sans-serif supporting labels, keeping generous breathing room around every composition.

---

# 4. MOTION & TRANSITIONS

- **Pigment Bloom Entrances:** Elements enter by expanding softly like drops of pigment hitting damp paper, followed by ink outlines sketching over them.
- **Fluid Liquid Wipes:** Transition between beats by expanding a soft watercolor wash across the frame or gently panning across a larger illustrated canvas.
- **Continuous Calm Life:** Subtle drifting pigment particles, gently swaying botanical/organic forms, and softly breathing washes—graceful and unhurried, never jittery or robotic.

---

# 5. TECHNICAL IMPLEMENTATION & EXPORT

- Pre-bake cotton paper texture and reusable noise stamps once at initialization for fast deterministic `renderAt(t)` execution at 30 fps export and 60 fps preview.
- Provide Play/Pause, Restart, Seek bar, conditional Audio/Subtitle controls, and **Export Video** delivering a real `.mp4`.
- When enabled, synthesize gentle acoustic-feeling Web Audio textures (warm felt-piano chords, soft chime harmonics, subtle brush swishes, water-drop accents).

---

# 6. DELIVERABLE

Deliver the rendered watercolor storyboard for approval or the complete playable animation with verified MP4 export.
