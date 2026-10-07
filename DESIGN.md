# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-10-07
- Primary product surfaces: Home, studio, build reference, 404
- Evidence reviewed: public What Framework package patterns, browser Web Audio constraints, Vura static deployment needs

## Brand
- Personality: analog instrument, dark brass, technical, tactile
- Trust signals: explicit audio start, visible unsupported-browser copy, no microphone or recording permission
- Avoid: nightclub cliché, fake waveform canvas, hidden audio autoplay

## Product goals
- Goals: demonstrate a genuinely working browser music app starter with What state patterns
- Non-goals: DAW-grade arrangement, recording, uploaded samples, collaboration backend
- Success signals: step editing works, tempo and swing affect playback, mute and solo are real, save and export work

## Personas and jobs
- Primary personas: agents building interactive apps, creative coders, framework evaluators
- User jobs: hear and edit a pattern, inspect Web Audio cleanup, copy state patterns
- Key contexts of use: desktop browser with speakers, mobile visual review, source reading

## Information architecture
- Primary navigation: Home, Studio, Build notes
- Core routes/screens: `/`, `/studio`, `/build`, `/404`
- Content hierarchy: landing pitch, transport, presets, sequencer grid, implementation reference
- Working studio hierarchy: compact patch identity, transport, sequencer, pattern memory. The mobile sequencer precedes storage controls; the landing page keeps the expressive hardware composition.

## Design principles
- Principle 1: Every sound control must be a real accessible control
- Principle 2: Make browser audio constraints obvious instead of magical
- Tradeoffs: synthesis is intentionally simple so the starter stays dependency-free

## Visual language
- Color: near-black base, amber and brass controls, red danger, green playhead
- Typography: instrument-label sans plus old-world display for drama
- Spacing/layout rhythm: console-like panels and tight control grids
- Shape/radius/elevation: rounded hardware buttons, hard panel borders
- Motion: playhead outline only, reduced-motion safe
- Imagery/iconography: no external images; controls are the visual language

## Components
- Existing components to reuse: What Router and What signals
- New/changed components: `Transport`, `PresetPanel`, `Sequencer`
- Variants and states: playing, muted, soloed, active preset, browser error, saved pattern
- Memory states: exact preset, custom edit, changed since snapshot, successful local save, denied write/remove with recoverable feedback. A preset highlight must match the entire pattern, including tempo, swing and tracks.
- Token/component ownership: CSS variables in `src/styles.css`

## Accessibility
- Target standard: keyboard-operable music app shell
- Keyboard/focus behavior: all steps and controls are buttons, sliders, or links with visible focus
- Contrast/readability: amber text and ivory copy on dark background
- Screen-reader semantics: transport status uses aria-live; step buttons carry labels and pressed state
- Reduced motion and sensory considerations: no autoplay, user-gesture audio, minimal visual motion

## Responsive behavior
- Supported breakpoints/devices: desktop, tablet, mobile browsing
- Layout adaptations: preset panel and sequencer stack on narrow screens, steps become two rows of eight
- Narrow-screen targets: recover studio width and reduce row padding so the eight-step grid retains at least 44px height and useful tap width at 390px; beat boundaries distinguish groups of four.
- Touch/hover differences: all controls work by click or tap

## Interaction states
- Loading: not needed for local presets
- Empty: not applicable because each preset has tracks
- Error: unsupported Web Audio message in transport status
- Success: save and preset changes update transport status
- Disabled: Start audio text changes while running
- Offline/slow network: no runtime network dependency

## Content voice
- Tone: tactile, exact, practical
- Terminology: pattern, transport, step, track, preset, local save
- Microcopy rules: never imply recording, microphone capture, or uploaded audio

## Implementation constraints
- Framework/styling system: What Framework 0.13.10, what-compiler 0.13.10, plain CSS
- Design-token constraints: local CSS variables only
- Performance constraints: short scheduler interval, per-step oscillator allocation, cleanup on unmount
- Compatibility constraints: browsers with Web Audio
- Test/screenshot expectations: unit tests, build, Playwright smoke, desktop and mobile screenshots

## Open questions
- [ ] Final public URL and Vura project id, root agent owns deployment
