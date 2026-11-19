# TASK

Create a striking, futuristic animated explainer in a **3D Neon & Cyberpunk HUD** style, using the single project configuration below.

Build a sleek dark 3D space anchored by a glowing perspective grid, sharp metallic/glass 3D objects with luminous neon edges, floating holographic data readouts, and high-speed light pulses traveling between nodes.

Produce the experience as a playable **HTML Artifact directly inside this conversation**, driven by a pure `renderAt(t)` timeline and offering a genuine downloadable **MP4** file with all enabled audio.

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
- Style: 3D Neon & Holographic HUD (Three.js / emissive 3D + glowing UI telemetry)
- Sound effects: {{SFX}}
- Background music: {{MUSIC}}
- Final video format: MP4

---

# 2. CONFIGURATION BEHAVIOR

- Follow the `Storyboard` setting strictly (stop with rendered previews for approval if enabled; build directly if disabled).
- When voiceover is enabled, decode its real duration as master clock and lock every data pulse, HUD reveal, and camera move to the narration.
- When subtitles are enabled, draw high-contrast glowing captions safely inside the frame and include SRT download.
- Include only enabled audio tracks and genuine official logos if the topic references real brands.

---

# 3. VISUAL DIRECTION — 3D NEON & CYBER HUD

## Palette
- **Deep void backdrop:** `#070816`
- **Dark HUD glass surface:** `#111734`
- **Crisp HUD white/ice ink:** `#E9F4FF`
- **Electric cyan primary:** `#00F5D4`
- **Neon magenta highlight:** `#FF3CAC`
- **Cyber indigo support:** `#6C63FF`
- **Alert amber / energy:** `#FFE66D`

## Visual Elements & Atmosphere
- **3D Emissive Geometry:** Build dark glossy/metallic 3D cores, servers, chips, shields, globes, and geometric modules with bright neon edge highlights (`EdgesGeometry` / emissive rim glow) and additive light trails.
- **Infinite Perspective Grid & Depth Fog:** Ground the scene with a receding glowing floor grid and atmospheric depth fog so foreground elements pop with unmistakable 3D depth.
- **Holographic Telemetry:** Frame important numbers and labels inside sharp angled HUD brackets, subtle scanlines, radar rings, and animated progress arcs—always readable on small mobile screens.

---

# 4. MOTION & CAMERA

- **Continuous Spatial Flow:** Smooth camera fly-throughs, orbital rotations around 3D tech artifacts, and glowing data packets racing along 3D splines.
- **Glitch & Scan Transitions:** Quick clean horizontal scan-wipe reveals or zoom-tunnel transitions between beats—never chaotic unreadable noise.
- **Micro-life:** Rotating holographic rings, blinking status LEDs, pulsing energy cores, and drifting depth particles.

---

# 5. TECHNICAL IMPLEMENTATION & EXPORT

- Render deterministically via `renderAt(t)` using Three.js / WebGL (`preserveDrawingBuffer: true`) or `kit/3d.js` + `neon` brush composited into a unified capture canvas.
- Synthesize sleek cyber audio via Web Audio when enabled (analog synth bass pulse, crystalline arpeggios, crisp telemetry beeps, deep sub-bass impacts).
- Export a verified `.mp4` containing every 3D layer, HUD label, subtitle, and enabled audio track.

---

# 6. DELIVERABLE

Deliver the rendered storyboard previews for approval or the complete playable 3D Neon animation with working MP4 export.
