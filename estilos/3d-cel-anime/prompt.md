# TASK

Create a high-energy animated explainer in a **3D Cel-Shading (Anime / Toon Hybrid)** style, using the single project configuration below.

Combine dimensional 3D geometry and dramatic camera angles with crisp stepped cel-shading, bold ink outlines, and punchy 2D anime-inspired impact frames, speed lines, and expressive typography.

Produce the experience as a playable **HTML Artifact directly inside this conversation**, with deterministic time-based JavaScript animation (`renderAt(t)`) and a genuine downloadable **MP4** export including all enabled audio tracks.

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
- Style: 3D Cel-Shading / Stylized Toon & 2D Impact Hybrid
- Sound effects: {{SFX}}
- Background music: {{MUSIC}}
- Final video format: MP4

---

# 2. CONFIGURATION BEHAVIOR

- **Storyboard enabled:** Produce the beat table and rendered cel-shaded preview frames; stop and wait for explicit approval before full animation.
- **Storyboard disabled:** Build the full playable animation directly.
- **Voiceover enabled:** Use the attached MP3 as the master clock and match every visual beat, cut, and action frame to spoken timing.
- **Voiceover disabled:** Use the configured duration and drive comprehension through visual action, callouts, and kinetic camera framing.
- **Subtitles enabled:** Burn readable high-contrast subtitles into the captured composition (safe zone away from bottom 20% on vertical 9:16) and allow SRT download.
- **Music & SFX:** Synthesize via Web Audio only when enabled, ducking music under voiceover.

---

# 3. VISUAL DIRECTION — CEL-SHADED 3D + 2D ANIME IMPACT

## Palette & Tone Steps
- **Deep night backdrop:** `#18132B`
- **Crisp ink outline:** `#0D0917`
- **Cream highlight / card:** `#FFF8EC`
- **Vibrant crimson / action:** `#FF4D6D`
- **Electric gold accent:** `#FFD166`
- **Sky cyan energy:** `#38D6FF`
- **Violet depth accent:** `#9B72FF`

## Rendering Grammar
- **Stepped Shading (Toon):** Use `MeshToonMaterial` with a 3-band gradient map (shadow, midtone, bright highlight) in Three.js or stepped `tom3d` shading in `kit/3d.js`. Never blend soft realistic PBR muddiness into this style.
- **Bold Outlines:** Render inverted-hull outlines or crisp dark ink strokes around 3D shapes and characters so every silhouette pops cleanly against the background.
- **2D FX Overlays:** Layer animated 2D speed lines, four-point lens sparkles, comic callout tags, and impact bursts directly over key 3D transitions.

---

# 4. CHOREOGRAPHY & CAMERA

- **Dynamic Angles:** Favor heroic low angles, tight Dutch-tilt emphasis beats (2°–6°), and whip-pan transitions between scenes.
- **Snappy Timing:** Use fast anticipation and strong follow-through (`E.volta`, `mola`) with brief 2–3 frame impact holds when key information lands.
- **Expressive Characters:** Use articulated 3D characters (`personagem3d` / Three.js rigs) acting out emotions, pointing, running, or reacting to giant 3D props.

---

# 5. TECHNICAL IMPLEMENTATION & EXPORT

- Build a deterministic `renderAt(t)` engine (Three.js + WebGL with `preserveDrawingBuffer: true` composited with 2D Canvas overlays, or full `kit/3d.js` + Canvas 2D with `toon` brush).
- Include Play/Pause, Restart, Timeline scrubber, conditional Audio/Subtitle controls, and **Export Video** producing a real `.mp4` with all enabled audio tracks.
- When SFX/Music are enabled, generate crisp anime-style synth hits, whooshes, rising tension swells, and rhythmic lo-fi/synthwave beats with Web Audio.

---

# 6. DELIVERABLE

Deliver either the cel-shaded storyboard for approval or the finished playable animation with genuine MP4 export according to configuration.
