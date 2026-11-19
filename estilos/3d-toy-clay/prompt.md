# TASK

Create an exceptionally polished, tactile animated explainer in a **3D Toy & Clay Studio** style, using the single project configuration below.

Build a cohesive 3D world where rounded, soft-matte characters, miniature props, volumetric charts, and floating UI badges inhabit a clean studio stage lit with warm key light, cool rim fill, and soft contact shadows. Movements combine playful spring physics and subtle stop-motion clay tactile charm.

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
- Style: Stylized 3D Toy & Clay Studio (soft volumetric 3D + tactile studio lighting)
- Sound effects: {{SFX}}
- Background music: {{MUSIC}}
- Final video format: MP4

Treat these values as the single source of truth for subject, timing, format, audio, subtitles, and workflow.

---

# 2. CONFIGURATION BEHAVIOR

- **Storyboard enabled:** Produce a concise beat table and an interactive HTML preview sheet showing actual rendered 3D frames. Stop and wait for explicit approval (`APPROVED` / `APROVADO`) before building the full animation.
- **Storyboard disabled:** Build the complete playable 3D animation immediately.
- **Voiceover enabled:** Decode the attached MP3 and make it the master clock and total duration. Synchronize every beat, character action, and camera cut to the spoken words.
- **Voiceover disabled:** Use the configured fixed duration and communicate clearly through 3D staging, animated props, and concise labels.
- **Subtitles enabled:** Render readable, high-contrast synchronized captions inside the captured video surface (outside the bottom 20% in 9:16 vertical mode) and provide SRT download.
- **Music & SFX:** Synthesize procedurally with Web Audio only when enabled; duck music gently under voiceover and route every enabled track into the final MP4 mix.
- **Authentic branding:** Use accurate colors and proportions when real brands are explicitly part of the topic; never invent fake statistics or brand marks.

---

# 3. VISUAL DIRECTION — 3D TOY & CLAY STUDIO

Create an inviting miniature studio look inspired by stylized 3D product explainers and modern digital claymation:

## Palette & Lighting
- **Studio backdrop:** Soft lavender-offwhite `#ECEEF8` to `#FFFFFF` with subtle radial floor gradient
- **Deep ink / outlines & shadows:** `#1E243B`
- **Dominant clay accent:** `#5B6CFF`
- **Secondary warm coral:** `#FF785A`
- **Fresh mint support:** `#14C8A8`
- **Highlight amber:** `#FFC84D`
- Use `MeshStandardMaterial` (roughness ~0.55–0.75, metalness ~0.05) in Three.js or layered volumetric shading via `kit/3d.js` (`personagem3d`, `esfera3d`, `desenharMalha3d`).
- **Lighting rig:** Warm directional key light casting soft shadows (`PCFSoftShadowMap`), cool sky hemisphere fill, and subtle rim light separating silhouettes from the studio floor.

## 3D Characters & Volumetric Props
- Build characters with rounded toy proportions (oversized expressive head, capsule limbs, hands, eyes with specular catchlights, hats/accessories) driven by `kit/movimento.js` (`POSES`, `CICLOS`, `atuar`) and `kit/3d.js`.
- Every object in the topic—charts, coins, devices, boxes, buildings, vehicles—must be truly 3D with thickness, bevels, and contact shadows, never flat 2D clip-art pasted onto a 3D background.
- Keep silhouettes bold and legible on mobile vertical screens.

---

# 4. MOTION CHOREOGRAPHY — PLAYFUL WEIGHT & CAMERA DEPTH

- **Three layers of motion at all times:** objects enter with spring overshoot (`mola` / squash-and-stretch), stay alive (subtle breathing, floating rotation, blinking eyes, spinning parts), and transition cleanly via camera orbits or volumetric wipes.
- **3D Camera choreography:** Use smooth eased camera dolly-ins, slight orbital pans (5°–15°), and focus shifts between foreground hero props and background dioramas.
- **Tactile rhythm:** Optionally quantize micro-surface clay deformations or secondary props to 12 fps stop-motion steps while keeping camera pans buttery smooth.
- **Pacing:** Introduce a clear visual beat or camera shift every 2–4 seconds; no frozen diorama holds.

---

# 5. TECHNICAL IMPLEMENTATION & EXPORT

- Use **Three.js** (or self-contained WebGL / `kit/3d.js` volumetric Canvas 2D fallback so it works offline without CDN failure) driven by a single pure `renderAt(t)` timeline.
- Ensure `preserveDrawingBuffer: true` on WebGLRenderer or composite onto a unified 2D capture canvas so **all labels, 3D objects, and subtitles are captured in the MP4 export**.
- Provide playback controls (Play/Pause, Restart, Timeline scrubber, Audio toggles, Subtitle/SRT controls when enabled, and **Export Video**).
- Export a genuine `.mp4` container (`MediaRecorder` MP4/H.264+AAC or `WebCodecs` + MP4 muxer) at native resolution and 30 fps; never disguise a WebM as `.mp4`.
- Synthesize subtle tactile clay thuds, wooden clicks, soft pop-ins, and warm marimba/synth beds via Web Audio when enabled.

---

# 6. DELIVERABLE

Start immediately according to the `Storyboard` setting: deliver either the rendered 3D storyboard frames for approval or the complete playable 3D animation with verified MP4 export.
