# TASK

Create a gripping, modern documentary explainer in a **Mixed-Media Editorial Collage** style, using the single project configuration below.

Blend tactile analog textures (subtle film grain, torn paper scraps, masking tape strips, rubber stamps, and halftone cutouts) with sharp modern infographic charts, bold marker highlights, and multi-plane parallax camera depth—reminiscent of top visual journalism and investigative YouTube channels.

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
- Style: Mixed-Media Editorial Collage (layered cutouts + film grain + data graphics)
- Sound effects: {{SFX}}
- Background music: {{MUSIC}}
- Final video format: MP4

---

# 2. CONFIGURATION BEHAVIOR

- Follow `Storyboard`, `Voiceover`, `Subtitles`, `Music`, and `SFX` strictly as configured.
- Synchronize document reveals, highlighter sweeps, rubber stamps, and chart growths to the attached voiceover when enabled.
- Render legible subtitles within safe mobile bounds and allow SRT download when enabled.

---

# 3. VISUAL DIRECTION — EDITORIAL MIXED-MEDIA COLLAGE

## Palette
- **Warm archival backdrop:** `#EFEAE0` (with cached fine grain & gentle corner vignette)
- **Dark newsprint ink:** `#1B1B1D`
- **Card / clipping white:** `#FCF9F2`
- **Editorial crimson highlight:** `#E11D48`
- **Marker yellow tape/highlight:** `#FACC15`
- **Info cyan:** `#0EA5E9`
- **Archival slate gray:** `#475569`

## Collage & Investigative Layering
- **Tactile Clippings & Depth:** Frame scenes as layered archival cards, torn paper edges, masking tape strips, stamped seals (`APROVADO`, `ALERTA`, dates), and high-contrast illustrated silhouettes over dark or toned backdrops.
- **Highlighter Sweeps & Redactions:** Animate yellow marker bars sweeping behind key words, red marker circles framing anomalies, and crisp animated charts emerging directly from clipping cards.
- **No Unreadable Clutter:** Keep each frame focused on one visual proof or step, separating background grain from crisp foreground callouts.

---

# 4. MOTION & PACING

- **Multi-Plane Parallax + Tactile Snaps:** Background archival grids move slowly while foreground cards snap into place (`E.sai` / `carimbar`) with subtle 12 fps stop-motion texture flicker on physical scraps.
- **Seamless Visual Evidence Flow:** Use sliding paper wipes, camera zoom-ins into highlighted clippings, and connected string/arrow paths linking cause to effect.

---

# 5. TECHNICAL IMPLEMENTATION & EXPORT

- Build a deterministic `renderAt(t)` Canvas 2D engine with pre-cached paper/film grain textures, playback UI, and verified `.mp4` export containing all layers and audio tracks.
- When audio is enabled, synthesize investigative documentary pulses, camera shutter clicks, paper rustles, stamp thuds, and marker swishes via Web Audio.

---

# 6. DELIVERABLE

Deliver rendered collage storyboard previews for approval or the complete playable animation with genuine MP4 export.
