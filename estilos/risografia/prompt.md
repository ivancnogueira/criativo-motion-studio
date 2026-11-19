# TASK

Create a bold, tactile animated explainer in a **Risograph Print & Indie Zine** style, using the single project configuration below.

Emulate analog Japanese risograph duplicator printing: restricted vibrant spot-ink plates, crisp halftone dot shading, subtle misregistration offsets between color passes, paper grain, and snappy print-shop motion.

Produce the experience as a playable **HTML Artifact directly inside this conversation**, rendered deterministically via `renderAt(t)` and exporting a genuine downloadable **MP4** file.

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
- Style: Risograph Print & Zine Collage (halftone dots + offset ink registration + paper grain)
- Sound effects: {{SFX}}
- Background music: {{MUSIC}}
- Final video format: MP4

---

# 2. CONFIGURATION BEHAVIOR

- Follow `Storyboard`, `Voiceover`, `Subtitles`, `Music`, and `SFX` strictly as configured.
- Decode attached MP3 duration when voiceover is enabled; otherwise match configured duration.
- Burn subtitles safely within the frame (keeping clear of bottom 20% on 9:16 vertical) and provide SRT download when enabled.

---

# 3. VISUAL DIRECTION — RISOGRAPH & ZINE PRINT

## Palette (Spot Ink Plates)
- **Uncoated warm cream paper:** `#F4EFE4`
- **Deep indigo / dark ink:** `#1D264B`
- **Bright paper highlight:** `#FFFBF2`
- **Fluorescent pink ink:** `#FF48B0`
- **Risograph bright orange:** `#FF6C2F`
- **Kelly green ink:** `#00A95C`
- **Federal blue ink:** `#0078BF`

## Print Mechanics
- **Misregistration & Overprint:** Offset color fills slightly (2–5 px) from their dark indigo outline or secondary halftone layer, using `multiply` blending where inks overlap to create rich third colors authentically.
- **Halftone Patterns & Grain:** Cache a fine paper grain stamp and dot-screen patterns once at startup so shadows and gradients appear as crisp halftone dots rather than smooth digital airbrushing.
- **Zine Typography:** Bold condensed display headers inside ink stamps or torn print blocks, paired with monospaced Courier annotations and registration crop marks (`+`) in corners.

---

# 4. MOTION & RHYTHM

- **On-Twos Print Cadence:** Quantize subtle print-jitter, halftone texture shifts, and character/object micro-cycles to 12 fps (`passo(t, 12)`) while keeping large scene slides and transitions decisive and energetic.
- **Mechanical Stamps & Drum Roll Wipes:** Reveal scenes with roller-drum wipes, rapid stamp impacts, and staggered zine card stacks.

---

# 5. TECHNICAL IMPLEMENTATION & EXPORT

- Build a self-contained deterministic `renderAt(t)` Canvas 2D engine with cached grain/halftone patterns, playback controls, and genuine `.mp4` export with all enabled audio tracks.
- When audio is enabled, synthesize tactile mechanical print clicks, paper drum snaps, and upbeat indie synth/percussion grooves via Web Audio.

---

# 6. DELIVERABLE

Deliver rendered risograph storyboard frames for approval or the finished playable animation with genuine MP4 export.
