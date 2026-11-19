# TASK

Create a razor-sharp, modern tech explainer in a **Bento Grid UI & SaaS Product Motion** style, using the single project configuration below.

Organize complex features, metrics, and workflows into sleek modular Bento Box cards that expand, flip, glow on focus, and respond to crisp animated cursor clicks, paired with buttery camera zooms and clean data visualizations.

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
- Style: Bento Grid UI & Stylized SaaS Motion (modular dark cards + micro-interactions)
- Sound effects: {{SFX}}
- Background music: {{MUSIC}}
- Final video format: MP4

---

# 2. CONFIGURATION BEHAVIOR

- Strictly obey `Storyboard`, `Voiceover`, `Subtitles`, `Music`, and `SFX`.
- When real products or brands are named in the topic, preserve accurate brand colors/logos; otherwise design original high-craft UI modules for the topic.
- Burn high-contrast captions within safe vertical bounds and provide SRT download when subtitles are enabled.

---

# 3. VISUAL DIRECTION — BENTO GRID & SAAS MOTION

## Palette
- **Deep slate canvas:** `#0C101B`
- **Card surface:** `#171E2E` (with crisp 1 px subtle rim `rgba(255,255,255,0.14)`)
- **Crisp UI typography:** `#F3F6FC`
- **Electric indigo primary:** `#6366F1`
- **Cyan telemetry highlight:** `#22D3EE`
- **Emerald status / success:** `#34D399`
- **Amber warning / metric accent:** `#F59E0B`

## Modular Layout & Micro-Interactions
- **Bento Grid Architecture:** Arrange scenes in crisp rounded rectangles (`16–24 px` radius) separated by consistent gutters. Each tile focuses on one idea: a live sparkline chart, a toggle switching ON, a workflow pipeline, a counter ticking up, or a notification badge.
- **Stylized UI (Never Raw Clutter):** Simplify interfaces down to bold recognizable controls, generous padding, and unmistakable state changes so every detail reads effortlessly on a phone screen.
- **Guided Cursor & Focus:** Animate a sleek cursor gliding along eased Bézier paths to hover, press buttons (with tactile scale press + ripple ring), and expand the active Bento tile while dimming resting tiles slightly.

---

# 4. MOTION & CAMERA

- **Spring Grid Transitions:** Tiles stagger in with crisp spring physics (`E.sai` / `mola`), rearrange seamlessly from a 2×2 overview into a zoomed single-card deep dive, and morph cleanly into the next workflow stage.
- **Micro-life:** Animated gradients on active card borders, live counters, pulsing status dots, and flowing data pills inside cards.

---

# 5. TECHNICAL IMPLEMENTATION & EXPORT

- Render everything deterministically inside a single `renderAt(t)` Canvas 2D system (using `bento` brush + `kit/movimento.js`) so every card, text label, cursor, and subtitle exports cleanly to MP4.
- Synthesize crisp modern UI clicks, soft glass swooshes, and minimalist electronic/ambient beats via Web Audio when enabled.

---

# 6. DELIVERABLE

Deliver rendered Bento UI storyboard previews for approval or the finished playable animation with genuine MP4 export.
