# TASK

Create a professionally designed animated explainer in a handcrafted paper cut-out infographic style, following the project configuration below.

Use JavaScript to generate a visually rich, information-dense animation with sophisticated motion, detailed illustrations, layered paper materials, animated typography, diagrams, and meaningful transitions.

Create the experience directly inside a playable HTML Artifact in this Claude conversation.

The result should feel like a short, professionally produced motion graphics sequence rather than a slideshow, a basic cartoon, or a collection of independent animations.

Use the stages selected by the project configuration:

**Stage 1 — Storyboard:** Develop the visual story, scene timing, motion choreography, and actual rendered storyboard frames. Present these for approval.

**Stage 2 — Animation:** After approval when a storyboard is requested, or immediately otherwise, build the animation with the configured audio, playback controls, and video export.

When storyboard is enabled, stop before Stage 2 for explicit approval. Otherwise, proceed directly to Stage 2.

Prioritize visual quality, useful information, and purposeful movement. Keep implementation focused and avoid unnecessary testing or development overhead.

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
- Target frame rate: 30 fps
- Animation style: Editorial paper cut-out infographic
- Sound effects: {{SFX}}
- Background music: {{MUSIC}}
- Final video format: MP4

Everything below this configuration is reusable. Use these values as the single source of truth; do not treat illustrative examples or instructions as additional project settings. If voiceover is enabled, use the attached recording as the master duration and clock. If storyboard is enabled, stop for approval; otherwise produce the final animation directly. Turn optional audio and subtitles on only when enabled.

Treat the topic as a free-text creative brief. It may be a single sentence or a longer paragraph.

Interpret the subject independently and determine what the viewer should learn, which information matters most, and how to communicate it through animated graphics.

Do not ask for a detailed script, scene breakdown, or additional visual instructions unless something essential is missing.

This prompt must remain adaptable to unrelated subjects, including technology, science, education, gardening, manufacturing, history, business, and everyday processes.

The illustrations, visual metaphors, data graphics, and movement should always be appropriate to the selected subject.

# 2. CONFIGURATION BEHAVIOR

Use the configured duration when narration is off. When narration is on, read the decoded MP3 duration and time the animation to the actual voiceover. If attached audio is not accessible in the Artifact, expose a file picker; do not invent audio or claim exact word alignment without evidence. Match scene structure and pacing to the resolved duration. When subtitles are enabled with voiceover, generate narration-aligned SRT cues; when enabled without voiceover, use timed captions based on the actual on-screen explanation or a supplied SRT without inventing speech. Skip subtitles entirely when disabled. Accept a supplied SRT for more accurate alignment. Keep other visual and rendering instructions below unchanged.

# 3. CREATIVE QUALITY STANDARD

The animation must succeed in three areas:

**Visual design:** It should look professionally composed, distinctive, cohesive, and carefully art-directed.

**Motion design:** It should contain continuous visual progression, expressive transitions, layered movement, and multiple meaningful animated elements.

**Educational value:** It should communicate useful information through visual demonstrations, not simply display a sequence of generic statements.

Do not prioritize one area so heavily that the others become weak.

Avoid producing a collection of pretty graphics that fail to explain the topic.

Equally, avoid presenting useful information in dull, static compositions.

The goal is an explainer that teaches through animation itself.

## Information density

Develop a clear educational narrative that goes beyond a superficial introduction.

For a short video, aim to communicate approximately 4–6 meaningful learning points through a connected visual story; adapt to the configured duration.

This is a creative guideline, not a fixed quota.

Use a concrete scenario, mechanism, comparison, cause-and-effect relationship, or visual demonstration where it improves understanding.

Prioritize specific information over generic labels.

A graphic should ideally demonstrate what is happening, why it happens, or how one step affects another.

Use animated charts, changing diagrams, connected objects, moving indicators, comparisons, highlighted relationships, branching paths, and evolving illustrations where they genuinely help explain the subject.

Do not invent factual statistics or imply that fictional demonstration values are real-world measurements.

If a particular topic requires research to explain accurately, use available reliable sources. Avoid unnecessary research for straightforward topics.

When the configured topic names real brands, products, or companies, use genuine, verified logos and accurate product visuals where relevant. Preserve official proportions and colors; animate around the marks rather than distorting them. For non-branded topics, create original illustrations. Reflect specific concepts from the topic or supplied narration without inventing claims.

## Information hierarchy

Use three levels of communication where useful:

1. A short headline identifying the current idea.
2. A central animated visual showing what happens.
3. Supporting labels, data, or annotations explaining important details.

Do not force all three into every composition.

Use graphics to carry much of the explanation so the animation remains understandable without narration.

Avoid long paragraphs or excessive simultaneous text.

# 4. VISUAL DIRECTION — EDITORIAL PAPER CUT-OUT

Create a distinctive handcrafted visual language combining physical paper illustration with sophisticated editorial infographic design.

The animation should look like detailed construction-paper artwork brought to life through professional motion design.

It must be more sophisticated than generic flat vector graphics with a grain overlay.

## Color and materials

Use a restrained palette built around:

- Warm cream: #F3EBDD
- Charcoal: #243139
- Terracotta: #C56B50
- Mustard: #E8B65C
- Sage green: #8A9B7C
- Dusty blue: #7C9DA5
- Pale cardstock: #FFF8EB

Add darker or lighter variations as needed for depth, contrast, and hierarchy.

Use matte paper materials with carefully controlled texture.

Each paper object should have:

- Subtly imperfect cut edges
- A fine, stable fiber texture
- Thin exposed paper edges
- Consistent directional lighting
- Soft shadows indicating depth
- Realistic separation between physical layers

Construct complex illustrations from multiple distinct paper components.

Use overlapping foreground, middle-ground, and background elements.

Aim for convincing shallow physical depth rather than full 3D realism.

Use warm, subtle shadows. Avoid excessive blurring or artificial gloss.

## Rich illustration design

Create recognizable, detailed illustrations suited to the topic.

Use layered geometry for characters, objects, machines, environments, information panels, and process diagrams.

Illustrations should look deliberately designed, with identifiable parts and thoughtful proportions.

Use more detail where it adds meaning or visual interest.

Avoid overly simplified symbols as the main focus of an entire scene.

Do not fill the screen with unrelated decorative elements.

Each major object should either communicate information, establish the setting, or participate in the visual story.

## Editorial infographic elements

Integrate paper-cut illustrations with sophisticated graphic elements, including:

- Animated information cards
- Callouts and annotations
- Connected process diagrams
- Comparison layouts
- Progress indicators
- Flowing information paths
- Layered charts
- Exploded-view illustrations
- Labels that follow or attach to objects
- Highlighted data and relationships
- Visual transformations representing changing information

Choose elements based on the subject.

Do not add every element to every scene.

Graphics should look integrated into the paper environment rather than pasted over it.

## Typography

Use confident, readable typography as an active part of the composition.

Combine short headlines, carefully positioned labels, and occasional numerical or data-driven elements.

Text can appear on cut-paper banners, physical labels, cards, or directly within the editorial layout.

Use typographic movement to reveal information, emphasize relationships, and guide attention.

Vary typographic scale intentionally.

Avoid tiny explanatory paragraphs and overly complicated text effects.

# 5. MOTION DIRECTION

This is a motion graphics production. Movement is central to the experience.

Do not create five static illustrations with entrance animations between them.

Every scene should develop visually and contain several meaningful changes.

## Pacing

Create an energetic, fluid, professionally paced sequence.

For a short video, aim for approximately 12–18 meaningful visual beats across the complete animation; scale to the configured duration.

A visual beat is a noticeable development that advances the explanation:

- New information is revealed.
- An object changes state.
- A diagram expands or transforms.
- A piece of data moves between components.
- A comparison develops.
- A decision changes the path of the story.
- A new paper environment is revealed.

Use these as creative targets, not rigid timing constraints.

Keep the viewer's attention moving naturally from one piece of information to another.

Avoid long pauses where nothing meaningful changes.

Allow brief holds when viewers need time to read or understand something important.

## Choreography

Use coordinated, overlapping movement rather than animating every object separately in sequence.

When appropriate, multiple elements should animate together.

A headline might reveal as a paper object assembles, with annotations entering shortly afterward and a connecting diagram developing beneath it.

Use staggered timing, anticipation, follow-through, and visual continuity.

Give motion a clear beginning, development, and finish.

Transitions should often grow naturally out of the action already taking place.

Avoid stopping the entire composition before introducing the next scene.

## Paper-specific animation

Use the physical paper medium creatively:

- Cut-out pieces assemble into complex illustrations.
- Layers lift, fold, rotate, slide, and settle.
- Paper objects transform through rearrangement.
- Strips unfold into connected diagrams.
- Paper windows reveal additional details.
- Stacked components separate to expose inner mechanisms.
- Labels appear attached to moving pieces.
- Foreground sheets pass across the composition.
- Paper elements reorganize into a new visual explanation.

Keep material behavior consistent.

Paper can bend or fold when appropriate, but should not behave like liquid or rubber unless the effect is deliberately stylized.

## Smooth motion and stop-motion accents

Use smooth animation at the configured target frame rate for camera movement, typography, diagrams, transitions, and information flow.

Apply subtle stepped stop-motion movement selectively to physical paper pieces when it improves the handcrafted appearance.

Do not force the entire animation to run at 12 unique poses per second.

Use easing functions suited to each action.

Avoid repetitive linear movement, unnecessary bouncing, and identical entrance animations.

## Camera movement

Use a virtual 2D camera where it improves the composition.

Possible movements include:

- Controlled pans
- Short zooms
- Reframing between connected diagrams
- Layered parallax
- Revealing a wider composition
- Following moving information through a process

Camera movement should direct attention and connect ideas.

Do not continuously zoom or move the camera without a reason.

# 6. TECHNICAL IMPLEMENTATION

Use JavaScript to build the animation directly inside a normal Claude HTML Artifact.

You may use:

- HTML and CSS
- JavaScript
- HTML5 Canvas 2D
- SVG
- Native browser animation APIs
- Web Audio API
- Browser-compatible JavaScript libraries when they provide a meaningful benefit

Do not require an external coding environment, Remotion, Hyperframes, Claude Motion, `/motion`, a terminal, or a local development environment.

Avoid dependencies that require package installation or a separate build process.

If a library is useful, make sure it can run in the Artifact environment. Prefer a self-contained implementation when library loading is uncertain.

Do not depend on stock footage, externally generated imagery, or unnecessary remote assets. An attached narration file and authentic official brand assets are allowed when required by the configuration and topic.

All primary illustrations and visual effects should be generated programmatically.

## Animation architecture

Build a reusable animation system with:

- A global timeline
- Scene-specific timing
- Reusable illustration primitives
- Paper materials and texture rendering
- Transform and easing utilities
- Typography animation utilities
- Diagram and information-visualization utilities
- Scene transition functions
- A virtual camera where useful

Use original code suited to the chosen visual direction.

Do not limit yourself to primitive drawing functions or a fixed set of prebuilt shapes.

The scene designs should determine which reusable functions are needed.

## Rendering

Use a deterministic time-based rendering approach.

The animation should be drawable at any requested timestamp without depending on the previously rendered frame.

Separate static geometry and materials from animated properties.

Cache reusable paths, textures, and other expensive visual resources.

Generate paper grain with a well-mixed deterministic random function and stable seeds.

Do not use one-step xorshift operations on sequential seeds to generate independently sampled textures.

Do not regenerate paper textures on every frame.

Keep textures visually stable as objects move.

Maintain consistent shadows, layering, lighting, and clipping.

Use adaptive preview resolution when helpful for responsiveness.

Preserve the configured native resolution for final export.

# 7. STAGE 1 — CREATE THE STORYBOARD

If storyboard is enabled, begin here and do not create the complete animation yet. If storyboard is disabled, skip this stage entirely and proceed to Stage 2.

## A. Plan the visual explanation

Identify the key learning points and arrange them into a connected visual story matching the resolved duration.

Use approximately 4–5 main compositions, each containing several animated beats.

Do not assume that one composition equals one static slide.

Develop purposeful relationships between scenes so the animation feels continuous.

Determine:

- What the viewer learns
- Which specific objects or diagrams demonstrate it
- Which information changes during the scene
- How the objects animate
- How the scene transforms into the following composition

Spend creative effort on the actual visual explanation rather than generic introductory material.

Begin communicating useful information immediately.

## B. Create the storyboard table

Present a concise but detailed table containing:

| Scene | Time | Key information | Visual composition | Animation beats | Transition | On-screen text | Sound |
|---|---|---|---|---|---|---|---|

Describe the actual artwork rather than generic concepts.

Include approximate positions, key paper illustrations, colors, layering, and important data elements.

The animation-beats column should describe multiple actions when appropriate, including their order and approximate timing.

Make clear how the composition changes during each scene.

Ensure the full resolved duration is covered.

## C. Render the visual storyboard

Create an interactive HTML Artifact displaying actual JavaScript-rendered storyboard frames.

Do not provide text-only mockups, placeholders, ASCII art, or generic icons.

Render one polished representative frame per main composition.

These should resemble real frames from the intended final animation, showing:

- Detailed paper-cut illustrations
- Editorial infographic composition
- Recognizable objects
- Paper depth and texture
- Visual information
- Labels and typography
- Colors, lighting, and shadows

The storyboard should establish the actual visual quality and design direction.

Use approximately 640 × 360 rendering resolution for the contact-sheet previews, with the ability to enlarge a selected frame.

Use one reusable rendering system rather than separately constructing every preview at full video resolution.

Provide a contact sheet and simple scene selection.

Do not build complete scene animations, video export, or an elaborate editor at this stage.

## D. Approval

Briefly check that the storyboard renders correctly and that the main illustrations and text are visible.

Fix obvious functional mistakes.

Present the storyboard table and visual Artifact.

Then stop and say:

"Storyboard ready. Review the visual previews and reply APPROVED to generate the animation, or tell me what you'd like to change."

Do not start Stage 2 until I explicitly approve.

If I request changes, revise the affected scene designs and previews without unnecessarily rebuilding the entire storyboard.

# 8. STAGE 2 — BUILD THE ANIMATION

Start after storyboard approval when enabled; otherwise start immediately without waiting.

Use the approved storyboard as the creative reference when it exists; otherwise develop the visual sequence directly from the configured topic.

Reuse its illustrations, geometry, materials, and compositions where practical.

Do not replace the approved design with simpler, generic visuals during implementation.

## Animate the complete sequence

Build a fully playable animation with the resolved duration in an interactive HTML Artifact.

Develop the complete motion choreography described in the storyboard, when available, or planned directly from the creative brief.

Each composition must contain meaningful movement throughout its active period, allowing appropriate reading time.

Use coordinated animation, progressive data reveals, layered movement, illustrated transformations, expressive typography, and connected scene transitions.

Maintain the same visual identity across the full video.

Do not simplify an approved detailed illustration into a basic symbol merely to make animation easier.

Where a particular effect is technically difficult, implement a visually comparable approach that preserves the intended design.

## Playback controls

Provide a simple interface with:

- Play / pause
- Restart
- Seekable timeline
- Current time and total duration
- Audio toggles for enabled tracks
- Subtitle toggle and SRT download when subtitles are enabled
- Export Video

The preview should resize to fit the Artifact while maintaining its original aspect ratio.

Keep the controls functional and unobtrusive.

# 9. SOUND EFFECTS

Generate the procedural sound effects below only when sound effects are enabled; otherwise omit them. Independently include any enabled voiceover or background music as instructed at the end of this section.

Generate sound programmatically using JavaScript and the Web Audio API.

Use sounds that support the animation, including:

- Paper sliding and folding
- Light taps and clicks
- Soft whooshes
- Paper impacts
- Mechanical movements
- Subtle confirmation sounds

Choose sounds according to the visual actions.

Use synthesized noise, oscillators, filters, and gain envelopes.

Do not download audio or use external sound-effect files.

Synchronize effects with the animation timeline.

Keep the sound design restrained and professional.

If voiceover is enabled, use the supplied audio without recreating it and synchronize visual timing to it. If background music is enabled, synthesize an original, understated music bed using Web Audio. If either is disabled, omit that track. Mix enabled tracks at sensible levels, duck music beneath narration, and include all enabled audio in export.

Avoid triggering duplicate sounds during seeking or replay.

# 10. VIDEO EXPORT

Include an Export Video button.

Use supported native browser APIs to capture the Canvas animation and any enabled audio tracks; when no audio is enabled, export video without an audio track.

Use Canvas capture, MediaRecorder, MediaStream, and Web Audio routing as appropriate.

Target:

- Configured native resolution
- Configured frame rate
- Resolved duration
- All enabled audio tracks included
- MP4 container (the configured final video format)

**The final video format is MP4.** The finished deliverable must be a real downloadable MP4 file containing the complete animation and every enabled audio track. Choose the simplest reliable browser route:

1. **Native recording:** Check `MediaRecorder.isTypeSupported()` for an MP4-compatible MIME type (for example `video/mp4` with H.264 video and AAC audio) and use it when the browser can actually record that format. Validate the resulting file, not merely the MIME string.
2. **Browser-side encoding and muxing:** If native MP4 recording is unavailable, use `WebCodecs` with a lightweight browser-compatible MP4 muxer (for example, Mediabunny) when its module can load and the encoders are supported. Prefer H.264 video and AAC audio. WebCodecs alone does not create an MP4 container, so do not skip the muxing step.
3. **Restricted-environment fallback:** If the Artifact blocks real MP4 encoding or downloading, provide the complete self-contained HTML with the same MP4 export route for a standard Chromium browser, and state the specific blocker. A clearly labeled WebM may be offered as a secondary fallback, but it must never be presented as the MP4.

Never rename a WebM file to `.mp4` or claim an MP4 exists until a valid file has been encoded. Provide a clear **Download Video** control with a truthful extension and MIME type.

If the Artifact environment prevents direct video recording or downloading, provide the complete self-contained HTML so the user can open it in a standard Chromium browser and export the same animation. If voiceover is enabled, provide an MP3 input when the attachment is inaccessible; route narration and other enabled audio through the captured mix.

Do not spend excessive time building unsupported export workarounds.

Browser recording may produce timing variations or dropped frames under load. Do not claim frame-perfect output without verification.

# 11. QUALITY AND VERIFICATION

Aim for a strong first result rather than extended autonomous refinement.

When storyboard is enabled, verify that the scenes render and that the visual compositions are recognizable.

During animation development, verify that the Artifact loads, the animation plays, the scenes are present, and the playback and export features work where supported.

Inspect a few meaningful timestamps for obvious visual errors.

Fix missing content, broken animation, JavaScript errors, and major rendering problems.

Do not run extensive QA loops, repeated screenshot comparisons, exhaustive frame-by-frame tests, or multiple unnecessary exports.

Do not repeatedly rebuild working scenes to correct minor artistic imperfections.

Preserve the approved design rather than sacrificing visual quality to simplify the code.

Once the animation is functional and consistent with the storyboard when present, deliver it for review.

# 12. EXECUTION GUIDELINES

Work efficiently without compromising the central creative requirements.

Make reasonable creative and technical decisions independently.

Avoid unnecessary clarifying questions, excessive planning, lengthy implementation commentary, and optional features unrelated to the final video.

When there is a storyboard, reuse its artwork and code in the animation.

Do not produce multiple redundant versions.

Do not create a separate editing application or complex production infrastructure.

Prioritize the actual motion graphics over auxiliary features.

The final video should demonstrate:

- Strong editorial design
- Detailed paper-cut artwork
- Substantial useful information
- Expressive and continuous motion
- Purposeful visual storytelling
- Sophisticated transitions
- Cohesive sound and visuals

Do not settle for a basic animated slideshow.

## START

If storyboard is enabled, begin with Stage 1: create the storyboard table and polished HTML Artifact previews, then stop for approval before generating the complete animation.

If storyboard is disabled, skip Stage 1 and build the complete animation immediately. Design the scenes with their final motion choreography in mind.
