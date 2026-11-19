# TASK

Create a compelling, documentary-grade animated explainer in a **Documentary Cartography & Satellite Map** style, using the single project configuration below.

Build stylized procedural terrain and oceanic backdrops, glowing borders and highlighted regions, sweeping animated curved trade/flight/data routes, pulsing location pins, timeline callouts, and smooth cinematic camera flights between areas.

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
- Style: Documentary Satellite Cartography (procedural terrain + animated routes & camera pan/zoom)
- Sound effects: {{SFX}}
- Background music: {{MUSIC}}
- Final video format: MP4

---

# 2. CONFIGURATION BEHAVIOR

- Follow `Storyboard`, `Voiceover`, `Subtitles`, `Music`, and `SFX` strictly.
- Synchronize camera flights, glowing region reveals, and date counters to spoken timing when voiceover is enabled.
- Burn high-contrast subtitles inside safe vertical margins (above the bottom 20%) and include SRT download when enabled.

---

# 3. VISUAL DIRECTION — DOCUMENTARY CARTOGRAPHY

## Palette
- **Deep ocean navy:** `#0B1A28`
- **Terrain / landmass surface:** `#162B3D` (layered with subtle elevation contour rings and procedural relief shading)
- **Crisp map labels & coordinates:** `#F0F6FA`
- **Route & maritime cyan:** `#38BDF8`
- **Hotspot / conflict / focal orange:** `#F97316`
- **Growth / resource emerald:** `#4ADE80`
- **Historical milestone gold:** `#FACC15`

## Cartographic Vocabulary
- **Procedural Stylized Geography:** Generate clean stylized landmasses, coastlines, latitude/longitude grids, topographic contour lines, and soft elevation hillshading relevant to the topic (never pretend to render raw satellite GPS street accuracy; clarify schematic visualizations cleanly).
- **Animated Routes & Flow:** Draw great-circle arcs, dashed maritime/logistics corridors, pulsing radar ripples around key pins, and traveling packet dots.
- **Documentary HUD Overlays:** Place compact corner coordinate readouts, animated year/metric counters, and clean leader-line callout cards tied to map pins.

---

# 4. CAMERA & STORYTELLING

- **Pan & Zoom Storytelling:** Fly smoothly from wide continental context down into a focused region (`camera` keyframe interpolation with `E.entraSai`), tilting perspective subtly or shifting focus from one pin to the next along a drawn route.
- **Data + Map Integration:** Transform regional silhouettes cleanly into comparison bars, timeline tracks, or resource ratios when explaining why a place matters.

---

# 5. TECHNICAL IMPLEMENTATION & EXPORT

- Pre-cache terrain relief textures and grid layers once for crisp 60 fps preview and deterministic 30 fps MP4 export via `renderAt(t)`.
- When audio is enabled, synthesize atmospheric documentary pads, subtle sonar pings, route-drawing ticks, and low cinematic swells via Web Audio.

---

# 6. DELIVERABLE

Deliver rendered cartographic storyboard frames for approval or the complete playable documentary animation with verified MP4 export.
