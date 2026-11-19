# TASK

Create a crystal-clear, engaging educational explainer in a **Whiteboard & Live Marker Sketch** style, using the single project configuration below.

Illustrate ideas by progressively drawing crisp ink strokes onto a clean studio whiteboard/sketchpad surface, accented by vibrant translucent highlighter strokes, hand-drawn arrows, circled callouts, and smart visual diagrams.

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
- Style: Whiteboard / Live Hand-Drawn Marker & Highlighter Explainer
- Sound effects: {{SFX}}
- Background music: {{MUSIC}}
- Final video format: MP4

---

# 2. CONFIGURATION BEHAVIOR

- Obey `Storyboard`, `Voiceover`, `Subtitles`, `Music`, and `SFX` settings as the single source of truth.
- When voiceover is enabled, align stroke reveal timings directly to spoken keywords from the audio.
- Keep subtitles crisp and high-contrast within safe screen bounds when enabled.

---

# 3. VISUAL DIRECTION — WHITEBOARD & LIVE MARKER

## Palette
- **Clean studio whiteboard / dot-grid pad:** `#FBFBF9` (with subtle `#2563EB` micro dot-grid at ~10% opacity)
- **Primary marker ink:** `#1E2430`
- **Pure card highlight:** `#FFFFFF`
- **Blue marker / structure:** `#2563EB`
- **Red marker / alert & emphasis:** `#EF4444`
- **Emerald marker / solution & growth:** `#10B981`
- **Amber highlighter:** `#F59E0B`

## Sketch & Highlighter Craft
- **Progressive Stroke Drawing:** Every diagram, icon, arrow, and character draws itself smoothly along its path length (`setLineDash` reveal) right when mentioned, followed by loose, slightly imperfect marker/highlighter fills underneath.
- **Hand-Sketched Character:** Add tiny deterministic organic wobble to strokes so lines look genuinely drawn by a skilled illustrator—clean and super legible, never sloppy or unreadable.
- **Annotation Vocabulary:** Use underlined keywords, circled numbers, dashed connector arrows, and translucent highlighter sweeps (`globalAlpha ~0.28–0.45`) to focus attention.

---

# 4. CAMERA & TEACHING FLOW

- **Infinite Canvas Panning:** Treat the whiteboard as one connected visual map! Instead of erasing everything abruptly, glide the 2D camera smoothly to fresh areas of the board, zooming in on details and zooming out to show the big picture.
- **Active Pen Point:** Optionally show a clean stylized marker tip or glowing drawing point leading active lines as they sketch.

---

# 5. TECHNICAL IMPLEMENTATION & EXPORT

- Render deterministically via `renderAt(t)` (Canvas 2D + `kit/movimento.js` + `quadro` brush), with full playback controls and verified `.mp4` export.
- When enabled, synthesize crisp marker-scratch swishes, soft dry-erase wipes, and light acoustic/marimba study beats via Web Audio.

---

# 6. DELIVERABLE

Deliver the rendered storyboard previews for approval or the complete playable whiteboard animation with verified MP4 export.
