# TASK

Create a charming, hyper-expressive animated explainer in a **1930s Rubber Hose Retro Cartoon** style, using the single project configuration below.

Bring ideas to life through bendy hose-like limbs, bouncy squash-and-stretch physics, expressive vintage characters (even anthropomorphized objects when fitting), thick rounded ink lines, and authentic warm vintage film texture.

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
- Style: Vintage 1930s Rubber Hose Cartoon (elastic squash & stretch + warm film grain)
- Sound effects: {{SFX}}
- Background music: {{MUSIC}}
- Final video format: MP4

---

# 2. CONFIGURATION BEHAVIOR

- Follow `Storyboard`, `Voiceover`, `Subtitles`, `Music`, and `SFX` strictly as configured.
- Use attached voiceover MP3 duration as master clock when enabled; otherwise match configured duration.
- Burn high-contrast subtitles inside safe vertical margins (clear of bottom 20%) and offer SRT download when enabled.

---

# 3. VISUAL DIRECTION — RUBBER HOSE 1930

## Palette
- **Aged warm parchment:** `#F1E8D6`
- **Thick vintage India ink:** `#181412`
- **Glove / highlight cream:** `#FBF7EE`
- **Muted vermilion accent:** `#D95D39`
- **Vintage mustard gold:** `#E8B954`
- **Dusty teal support:** `#5C8078`
- **Plum shadow accent:** `#967AA1`

## Cartoon Craft
- **Bendy Limbs & Rounded Linework:** Draw limbs with curved Bézier arcs or soft rounded capsules (`lineCap = "round"`, `lineJoin = "round"`), bold consistent outlines (`#181412`), classic pie-cut eyes, and expressive glove hands.
- **Squash, Stretch & Living Props:** Give important props (coins, clocks, rockets, documents, phones) expressive personality, bounce, and weight—never stiff geometric slides.
- **Vintage Film Atmosphere:** Layer a subtle vignette, cached warm paper grain, and occasional faint film dust/scratches moving at 12 fps without obscuring readability.

---

# 4. CHOREOGRAPHY & BOUNCE

- **Elastic Easing & Follow-Through:** Use strong anticipation, overshoot (`mola`, `E.volta`), and volume-preserving squash-and-stretch (`sx * sy ≈ 1`) on every jump, landing, and pop-in.
- **Continuous Idle Bounce:** Characters and cartoon props bob lightly to a steady tempo even while explaining a point.
- **Iris-Out / Iris-In Transitions:** Classic circular iris wipes and bouncing scene pushes between beats.

---

# 5. TECHNICAL IMPLEMENTATION & EXPORT

- Build a deterministic `renderAt(t)` Canvas 2D engine integrated with `kit/movimento.js` (`POSES`, `CICLOS`, `atuar`) and playback/MP4 export controls.
- When enabled, synthesize playful ragtime/brass-inspired Web Audio loops and classic cartoon pops, boings, slides, and impacts.

---

# 6. DELIVERABLE

Deliver rendered cartoon storyboard previews for approval or the finished playable animation with genuine MP4 export.
