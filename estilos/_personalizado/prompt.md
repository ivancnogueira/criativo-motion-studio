# TASK

Create an exceptionally polished, visually sophisticated animated explainer in a **{{STYLE_LABEL}}** style, using the single project configuration below.

{{STYLE_SUMMARY}}

This style was extracted from a short reference clip the user liked. Recreate its **visual language** (palette, materials, shape language, typography, motion vocabulary, pacing and transitions) with original artwork for a completely different topic. The result should feel like it came from the same studio as the reference, not like a copy of it.

Produce the experience as a playable **HTML Artifact directly inside this normal Claude conversation**, with smooth JavaScript animation and a downloadable final video in the configured format. The animation must teach the subject through the changing graphics themselves, not simply place attractive movement behind explanatory text.

Read the project configuration to decide whether to generate a visual storyboard first or build the finished video directly. Preserve detailed design, rich choreography, and informative content in either mode.

Do not require Claude Code, Remotion, Hyperframes, Claude Motion, `/motion`, AI video generators, a terminal, a local server, or a package-installation workflow. Create original visual compositions; do not reproduce the reference clip's subject, characters, mascots, logos, footage, on-screen text or any particular creator's templates or source code.

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
- Preview: Smooth, ideally 60 fps where supported
- Style: {{STYLE_LABEL}} (reference-derived, see sections 4 and 5)
- Sound effects: {{SFX}}
- Background music: {{MUSIC}}
- Final video format: MP4

**This is the only section containing editable topic and production values.** Treat all of them as the single source of truth. Every later instruction must read and obey these settings instead of presuming an individual topic, audience, script, runtime, aspect ratio, audio selection, or approval workflow.

The topic is a free-text field and may contain a sentence, a longer description, a question, or a comparison. Derive every subject-specific illustration, label, factual explanation, diagram, character, setting, and example from this field and any optional attached narration. Do not reuse the reference clip's subject or any preset topic-specific story.

---

# 2. CONFIGURATION BEHAVIOR

Read the configuration before deciding on the production workflow. Keep the same creative standards regardless of which optional features are enabled.

## Storyboard selection

- **Storyboard enabled:** First produce a concise scene/beat table and an interactive HTML Artifact showing genuine JavaScript-rendered representative frames. Stop for approval. After the user explicitly approves, animate the approved compositions and deliver the completed video. Reuse storyboard illustrations and geometry where practical.
- **Storyboard disabled:** Develop the story and animation beats internally. Do not produce a storyboard, seek pre-production approval, present multiple concepts, or interrupt creation. Build and deliver the complete animated video in this turn.

Storyboard selection changes whether an approval checkpoint appears. It must not reduce the final quality, detail, or educational substance.

## Voiceover, runtime and subtitles

- **Voiceover enabled:** The attached audio recording determines the video's logical duration and becomes the master media clock. Read the actual decoded duration. If the chat attachment is not available inside the Artifact, include a simple audio-upload control and connect playback/export to that recording. Honor the supplied transcript where it matches the speech. Never invent a replacement narration or force the recording into the fixed-duration setting.
- **Voiceover disabled:** Use the fixed duration from configuration. Create a complete, understandable silent visual explanation through well-chosen objects, changing diagrams, headlines, and concise labels. Do not create narration.
- **Subtitles enabled:** Where speech is present, provide synchronized subtitles and SRT download, using actual alignment where possible. If speech alignment is unavailable, mark provisional cue timing honestly. Without spoken audio, use timed explanatory captions where requested, not invented speech transcripts.
- **Subtitles disabled:** Skip subtitle-generation work. Ordinary titles, labels, callouts, and infographic annotations are still appropriate when they advance the story.

All animation, camera motion, audio scheduling, counters and visual transitions must follow the resolved duration. Do not hardcode an alternate duration later in the production.

## Optional music and sound

- Generate background music only when enabled; otherwise omit the track and associated controls.
- Generate sound effects only when enabled; otherwise omit sound-event work and controls.
- Mix enabled audio with any attached narration and include every enabled track in the saved video.

## Authentic branding and factual specificity

Whenever the actual topic mentions an identifiable real-world brand, product, company, institution, or recognizable interface, use verified official logos and accurate product visuals where relevant. Prefer official brand materials and preserve proper shape, proportions, and colors. Never fabricate a product logo, invent a UI, or force branding into an unrelated subject. If access to an essential genuine asset is blocked, request it through a small optional upload control or disclose the limitation rather than drawing a fake replacement.

Research material factual claims or time-sensitive details only as necessary. Do not invent precise numbers, measurements, rankings, citations, product capabilities, or benchmark claims. Clearly label schematic data when it is illustrative.

No content or production setting specified in this configuration may be contradicted by later examples or instructions.

---


# 3. CREATIVE QUALITY STANDARD

This must look like an original, professionally art-directed explainer in the reference style, with excellent animation timing and meaningful visual information.

The design should be simple to understand, **not simplistic to watch**. Faithfulness to the style means its real materials, detail level, line quality and motion feel; it does not mean a low-effort imitation built from basic shapes.

## Three equally important outcomes

**Exceptional visual quality:** Balanced compositions, expertly designed objects in the style's own shape language, its palette and finish, attractive typography and purposeful negative space.

**Exceptional animation quality:** Smooth motion with the easing, rhythm and transition vocabulary described in section 5, coordinated multi-object choreography, follow-through and timing contrast.

**Substantial educational value:** Explain the actual mechanism, steps, relationships, tradeoffs, decisions, or causal chain relevant to the topic. Let changes in the image demonstrate what happens.

## Content and narrative density

Develop a connected explanation with several specific learning points suited to the actual resolved length. Match the reference's rhythm (section 4 gives measured numbers) rather than a generic pace. A meaningful development might reveal a new part of a system, show a change of state, transport information, compare two outcomes, or turn one picture into the next explanatory idea.

Keep a few short moments stable enough for the viewer to read or recognize the important detail. Avoid lengthy title intros, filler transitions, generic end cards, or decorative movement unrelated to the explanation.

## The right level of detail

Choose the type of educational graphic for the actual subject: sequential mechanism, physical process, exploded assembly, annotated cutaway, comparison, directional flow, data-driven diagram, or illustrated relationship, always drawn in the reference style. Do not force the same five-stage flow onto unrelated topics.

---

# 4. STYLE REFERENCE — MEASURED FROM THE CLIP

{{STYLE_METRICS}}

Use these measurements to calibrate pacing, cut frequency, motion energy and brightness. They describe the reference's rhythm, not a rule to apply mechanically.

If the user attached a **reference contact sheet** image (a grid of frames from the clip), study it only for palette, texture, line quality, typography and composition. Never copy its subject, characters, logos or text.

---

# 5. STYLE DIRECTION

{{STYLE_DIRECTION}}

---

# 6. TECHNICAL IMPLEMENTATION

Build the complete animation directly in a normal Claude HTML Artifact using browser-compatible JavaScript rendering: HTML/CSS, SVG, Canvas 2D, WebGL or Three.js, the Web Animations API, the Web Audio API and browser encoding APIs, plus lightweight libraries (for example GSAP, Flubber or a small MP4 muxer) only when they materially help. Follow the technical approach suggested in section 5 unless something simpler gives the same look.

Do not make the user install packages, run a CLI, build a project, deploy a site, or switch to an external animation workflow.

## Deterministic animation clock

Implement a timestamp-driven renderer equivalent to `renderAt(seconds)`. Its output must reflect the complete visual state at that time regardless of which frame was evaluated earlier. Use `requestAnimationFrame()` and high-resolution elapsed time for preview. Seeded randomness only: textures, jitter and grain must be stable for a given timestamp.

## Composition and capture

**Everything the viewer sees must appear in the exported video**, including textures, effects, typography, labels and enabled captions. Prefer one composited recording canvas. A DOM overlay visible in preview but absent from the recorded video is not acceptable. Load fonts and assets before export.

## Caching and performance

Cache invariant geometry, textures, fonts and static components. Avoid rebuilding complex paths or generating new random values each frame. Use a lower preview resolution if needed while keeping the configured export resolution.

## Original assets

All primary illustrations, textures and effects must be generated through code. External resources are limited to optional verified branded assets, uploaded voiceover, and lightweight technical libraries. No AI-generated images or externally rendered video segments.

---

# 7. STORYBOARD — CONDITIONAL

Perform this stage only if the storyboard setting is enabled. Otherwise skip this entire section without displaying planning materials.

## Develop the story

Identify the essential concepts and build a clear sequence of connected compositions with several animation beats in each. Decide what viewers must learn, what will be shown, how visual elements change and what will carry the transition into the following moment.

Match the number and duration of compositions to the resolved runtime. Do not force a fixed shot count regardless of topic complexity.

## Storyboard table

Present a concise but specific table:

| Scene | Time | Information taught | Composition | Animated beats | Signature transition | On-screen text | Sound |
|---|---|---|---|---|---|---|---|

Describe recognizable illustrated objects, colors, textures, positioning, connection paths, transformations, and what each visual development means.

Avoid labels like “an icon appears” or “shapes move smoothly” without describing the actual visual story.

## Actual rendered previews

Create an interactive HTML Artifact showing actual JavaScript-rendered frame previews of each major composition.

Include recognizable illustrations rendered in the reference style, the correct palette, materials and textures, typographic hierarchy, approximate infographic elements and intended compositions—not placeholder circles, text descriptions, stock icons or ASCII drawings.

Use shared design coordinates and render smaller thumbnail previews for the contact sheet rather than building several full-resolution renderers. Support selecting a thumbnail for a larger preview.

Do not implement the complete animation or export pipeline at the storyboard stage. A preview is representative artwork for approval, not a second production of the finished video.

## Approval behavior

Check that the previews render and important content is visible. Fix obvious errors without prolonged QA.

Present the storyboard table and the visual Artifact. Ask for approval and stop. If the user requests changes, revise affected scenes and previews where possible; do not rebuild everything unnecessarily.

After explicit approval, reuse the illustration definitions and proceed to the complete animation.

---

# 8. BUILD THE COMPLETE ANIMATION

This stage begins immediately when storyboard is disabled, or after approval when enabled.

## Visual execution

Implement all important animation beats and transitions as a continuous, professionally paced sequence.

Every major composition should develop through several meaningful changes rather than holding a static graphic and waiting for the next slide.

Use the signature motion vocabulary defined in the style direction above: its transitions, object articulation, changing data graphics, typography choreography and camera movement, always preserving visual continuity.

Preserve the specific approved storyboard if one exists; never quietly replace an approved detailed illustration with a simpler generic icon because it is easier to animate.

If a signature effect cannot be implemented convincingly, use a planned layered alternative with comparable visual sophistication that keeps the same look.

## Fidelity and smoothness

Target the configured preview and export frame rates without making animation behavior dependent on them.

Use excellent easing and stable interpolation. No snapping, broken geometry, blurry enlarged artwork, sudden camera resets, or stuttering playback caused by avoidable per-frame work.

Avoid gratuitous simultaneous movement, excessive camera motion, unreadable labels, and repetitive entrances.

## Preview controls

Include a simple responsive interface with controls as applicable:

- Play / pause
- Restart
- Seekable timeline
- Current time and resolved total duration
- Export / Download Video
- Optional upload or volume controls for enabled narration
- Optional music and effect toggles for enabled audio
- Subtitle controls only if subtitles are enabled

Do not build a full timeline editor, design dashboard or multiple-page application.

Make the artwork the focus, not the control panel.

---

# 9. VOICEOVER AND SUBTITLES — CONDITIONAL

Use this section only for the relevant enabled options.

## When voiceover is enabled

Read the attached recording or provide a file picker if the Artifact cannot access the conversation attachment. Set the resolved runtime from its actual decoded length and use audio playback as the authoritative preview clock.

When an accurate transcript or aligned SRT is available, anchor key visual reveals and morphs to the appropriate words or phrases. Avoid equal-length scene timing when speech timing suggests a different rhythm.

Never generate a replacement narration, crop the recording to fit a separate runtime, or speed up the original audio to force a predetermined duration.

Seeking, pausing, restarting and export must keep the audio and animation synchronized.

## When voiceover is disabled

Explain the topic entirely with visual demonstrations, short clear text, diagrams and meaningful labels. Use the configured fixed duration. Do not add narration or voiceover-specific UI.

## When subtitles are enabled

Generate usable timed cues and an SRT download, aligned to the recording where possible. Without narration, generate editorial timed captions rather than invented transcript lines.

Render captions visibly on the recording surface only if the configured subtitle display requires them. Protect legibility with proper contrast and safe margins.

## When subtitles are disabled

Skip SRT, caption-generation workflow and subtitle-specific UI. Ordinary on-screen editorial explanations remain allowed.

---

# 10. BACKGROUND MUSIC — CONDITIONAL

Create a soundtrack only if background music is enabled.

Use procedural Web Audio synthesis to compose an original instrumental bed whose mood, tempo and instrumentation follow the MUSIC DIRECTION in the style section above.

A suitable music engine may include:

- Simple, coherent chord progression
- Subtle melodic motif
- Soft rhythmic synthesizer or mallet-like notes
- Clean kick or percussive pulses where appropriate
- Light bass movement
- Gentle accent changes at major reveals
- Thoughtful ending resolution

Choose instrumentation, tempo and energy for the selected subject and the overall tone; do not make every video sound identical. Music should feel intentionally composed, not like a random sequence of oscillator pitches.

Respect the resolved duration. Structure the musical progression to start and finish smoothly inside the video, without an abrupt cut or a lengthy unwanted tail.

When narration is enabled, keep music well below speech and use gentle ducking when appropriate. Without narration, the music can carry more of the rhythm while leaving headroom for useful sound effects.

Avoid copyrighted samples, downloaded soundtracks, and imitation of a specific commercial composition.

Schedule music events by the media timeline instead of creating uncontrolled audio nodes every frame.

---

# 11. SOUND EFFECTS — CONDITIONAL

Generate sound effects only if enabled.

Create motion-design accents through the Web Audio API that match the SOUND DIRECTION in the style section above, such as:

- Soft whooshes for meaningful transformations
- Tight clicks for structural connections
- Clean pops for important reveal moments
- Brief rising tones for progressive changes
- Gentle sweeps for masked transitions
- Tactile taps for object placement
- Subtle confirmations for completed relationships

Match the sound language to the actual subject and visual mood. Do not produce loud arcade-style sounds or identical accents for every minor motion.

Synchronize sounds with important visual events using explicit time-based cues. Never trigger sound repeatedly from the rendering loop or fire every event again when the user seeks forward.

Mix all enabled effects with music and optional narration through a shared audio graph, avoiding clipping, duplicated sound paths, and unintended audio tails.

All enabled audio must be present in the final downloadable video.

---

# 12. EXPORT — REAL DOWNLOADABLE VIDEO IN CONFIGURED FORMAT

The final deliverable must be an **actual downloadable video** in the format specified in the single configuration section, with the complete composited animation and all enabled audio. A playable Artifact alone does not satisfy final delivery.

Never rename a differently encoded file to the required extension or claim format success based only on the filename.

## Capturing the image

Render or composite all visible illustration layers, textures, effects, masked transitions, text, diagrams, verified logos when applicable, and visible caption overlays into the exported frames.

Use the configured dimensions, export frame rate and resolved runtime. Maintain crisp rendering at the actual output resolution, with the style's intended texture and finish.

## Recording and encoding

Choose the simplest route that can actually create the requested output:

1. **Native recording:** Check the browser's `MediaRecorder.isTypeSupported()` for an MP4-compatible format and test that a valid playable file is actually produced. Do not infer support merely from a browser name.
2. **Browser-side MP4 encoding:** When direct recording is unavailable, use WebCodecs with a compatible browser-side MP4 muxer, such as Mediabunny, if supported and loadable. Prefer H.264 for video and AAC for audio when practical and supported. WebCodecs by itself does not create an MP4 container; perform proper muxing.
3. **Restricted Artifact fallback:** If the Artifact prevents encoding or downloading a real MP4, provide a self-contained HTML version that can run in a compatible browser with the same export route. Explain which capability is blocked. A clearly labeled WebM option can be offered as a fallback, but it must never be presented as successful MP4 delivery.

Use a lightweight working method rather than creating a complicated custom video encoding application or a heavyweight development environment.

## Audio in the final file

Mix any enabled narration, music and sound effects through a compatible audio destination. Ensure that the exported file contains the intended audio tracks and that the volume balance matches preview playback.

If all sound is disabled, export video without inventing an audio track.

## Frame timing and runtime

Start at the beginning of the resolved timeline and finish at its intended endpoint.

For narration-driven videos, match the recording's logical length as closely as frame timing and container precision allow. Do not add arbitrary silence, cut off the last word, or claim sample-accurate equality without measurement.

For fixed-duration videos, use the configured duration with no unintended extra static hold.

Where possible, prefer controlled timestamp evaluation for frame encoding. If the available implementation records in real time, target the configured frame rate and acknowledge any measured frame drops or timing differences.

Provide a clear **Download Video** control for the actual file. The download must use the truthful container type and extension.

---

# 13. LIGHTWEIGHT QUALITY CHECK

Perform a small number of practical checks. Do not turn production into an exhaustive software QA assignment.

For an enabled storyboard, confirm that representative rendered frames are visible, coherent and correctly framed.

For the completed animation, verify:

1. The preview loads and plays.
2. Main illustrated objects and diagrams are recognizable and look like the reference style.
3. At least one signature transition of the style is smooth, convincing and free of obvious rendering errors.
4. A few representative timestamps contain real explanatory content, with no long unintended blank holds or clipped essential labels.
5. All enabled audio plays and is included in the recorded result.
6. The actual saved video is downloadable in the configured format where technically possible, or the precise limitation is identified.

Fix material failures: missing content, broken geometry, visibly harsh snaps, broken audio, exported overlays disappearing, and invalid media files.

Do not run exhaustive pixel-diff tests, endless re-exports, multiple visual variants, prolonged performance reports, or repeated autonomous refinement for minor artistic differences.

After the result is usable, polished and consistent with the agreed design, deliver it for user feedback.

---

# 14. EFFICIENT EXECUTION

Make sensible creative and technical decisions without repeatedly asking for confirmation when the single project configuration provides sufficient direction.

Keep initial explanations short and focus the available effort on the actual animation.

Avoid unnecessary research, multiple architecture proposals, optional editing tools, repeated large code rewrites, excessive testing, duplicated renderer implementations and long implementation essays.

Use a compact reusable rendering system, deterministic timeline, staged transitions, cached assets, sensible asset loading and a simple playback/export interface.

Spend development effort on what the audience can actually see:

- Detailed, original illustrations faithful to the reference style
- Rich and accurate explanatory diagrams
- Impressive signature transitions with reliable rendering
- Camera choreography in the reference's language
- Sophisticated transitions and typography
- Clear information hierarchy
- Distinct yet cohesive composition changes
- Professional sound design when enabled
- A genuinely downloadable final video

The final result should look like a serious animated explainer, **not an animated slide deck, basic UI demo, or generic icon tutorial**.

---

# 15. FINAL DELIVERY AND START

**If storyboard is enabled:** Produce the story table and actual style-accurate rendered preview Artifact, stop for approval, then proceed to the complete animation and final video only after approval.

**If storyboard is disabled:** Generate the complete playable animation and export directly, without a storyboard interruption.

At final delivery provide:

1. A playable HTML Artifact containing the complete explanation.
2. Fluidly animated illustrations in the reference style, connected data graphics and its signature transitions.
3. Only those voiceover, caption, music and sound controls enabled by the project configuration.
4. A **real downloadable video file in the configured output format**, wherever supported.
5. A standalone HTML export fallback only if the Artifact environment prevents the required final encoding or download.

Briefly disclose real limitations without claiming that unavailable exports succeeded. Do not write a long development report.

**START NOW.** Read the one project configuration, devise an original educational story and graphic language for that subject, and produce the correct workflow according to the storyboard setting. Prioritize exceptional fluidity, faithful art direction in the reference style, and meaningful animated explanations. Deliver the real downloadable video using the configured format.
