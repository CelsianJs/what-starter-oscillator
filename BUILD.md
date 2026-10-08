# Build notes for agents

Oscillator is a browser music studio starter built with What Framework signals and Web Audio. It is intentionally local-only: it shows interactive state, effects, persistence, routing, and cleanup without pretending to ship a production audio backend.

## Source map

- `src/routes.jsx` declares `/`, `/studio`, `/build`, and `/404`.
- `src/state/studio.js` owns pattern state, transport state, saved-pattern persistence, and derived values.
- `src/audio/engine.js` owns `AudioContext` lifecycle, step scheduling, and oscillator node cleanup.
- `src/components/Transport.jsx` bridges UI controls to the engine and disposes it when the route unmounts.
- `scripts/build-vura.mjs` emits Vura-ready static aliases after the Vite build.
- `src/audio/engine.lifecycle.test.js` covers audio lifecycle races that are easy to miss in a browser-only smoke test.

## State and rendering flow

The starter keeps shared state in module-level signals instead of component hooks. That makes the pattern reusable from panels, transport controls, and the build page without prop drilling.

```js
const pattern = signal(loadSavedPattern());
export const isPlaying = signal(false);
export const currentStep = signal(0);
export const audioStatus = signal('idle');

export const activeSteps = computed(() =>
  pattern().tracks.reduce((total, track) => (
    total + track.steps.filter(Boolean).length
  ), 0)
);
```

Actions keep mutations narrow. They clone the current pattern, update one concern, and write the next value back to the signal.

```js
export function toggleStep(trackId, stepIndex) {
  const next = clonePattern();
  const track = next.tracks.find((candidate) => candidate.id === trackId);
  if (!track || stepIndex < 0 || stepIndex >= track.steps.length) return;

  track.steps[stepIndex] = !track.steps[stepIndex];
  pattern.set(next);
}
```

This is the main pattern worth copying: signals hold source-of-truth state, computed values derive read models, and route components stay small.

## Audio lifecycle

Web Audio is user-gesture gated, so the UI starts from an explicit “Start audio” button. The engine also has to be idempotent because users and tests can click quickly.

```js
let startingPromise = null;
let startGeneration = 0;

export async function startEngine() {
  if (isPlaying()) return true;
  if (startingPromise) return startingPromise;

  const generation = ++startGeneration;
  audioStatus.set('starting');

  startingPromise = ensureContext()
    .then(async (audioContext) => {
      await audioContext.resume();
      if (generation !== startGeneration) return false;
      // scheduler setup continues here
      return true;
    })
    .finally(() => {
      startingPromise = null;
    });

  return startingPromise;
}
```

`Transport` owns the component boundary cleanup:

```jsx
useEffect(() => () => {
  disposeEngine();
}, []);
```

That cleanup closes the audio context and clears the scheduler interval when the route unmounts.

## Real issue: double-start race

The first version treated `startEngine()` like a synchronous toggle. That was fragile because `AudioContext.resume()` is async.

Before, two quick starts could both pass the “not playing” check before the first resume finished:

```js
export async function startEngine() {
  if (isPlaying()) return true;
  const audioContext = await ensureContext();
  await audioContext.resume();
  isPlaying.set(true);
}
```

After, `startingPromise` coalesces simultaneous starts and `startGeneration` cancels stale completions if stop/dispose wins the race. The lifecycle tests cover simultaneous starts, stop-before-resume, and dispose-before-resume.

## Real issue: ruler grid and stopped playhead

The visual review caught a high-confidence UI bug in the sequencer: the old header emitted a blank span plus sixteen numbers into a two-column parent grid, then hid the final child with CSS. That made the ruler read as two vertical columns and removed step 16.

The fix gives the numbers their own grid:

```jsx
<div class="step-header" aria-hidden="true">
  <span class="track-header">Track</span>
  <div class="step-numbers">
    {stepNumbers.map(step => <span>{step + 1}</span>)}
  </div>
</div>
```

`.step-numbers` uses the same sixteen-column grid as the step buttons, then switches to eight columns below the mobile breakpoint. The smoke test now checks both computed grid counts.

The same pass found a state bug: because `currentStep()` starts at `0`, every track showed a green playhead outline on step 1 while the status said "Audio stopped." The class is now gated on real transport state:

```jsx
isPlaying() && currentStep() === step && 'playing'
```

That protects users from mistaking a loaded pattern for active playback and keeps the visual state tied to the Web Audio engine lifecycle.

## Persistence and export boundaries

Saved patterns use `localStorage` when it is available. The loader sanitizes saved JSON before it reaches the signal so malformed storage cannot put the UI into an impossible state.

Export stays browser-native: it creates JSON for download and attempts clipboard copy only when the browser allows it. Clipboard denial is treated as a recoverable browser boundary, not an app failure.

## What worked smoothly

- Keeping `activeSteps`, solo state, and transport labels as computed values made the UI reactive without extra effect wiring.
- Explicit routes made the demo easy to statically alias for Vura.
- The sample-free synth kept the starter portable: no audio assets, no worker bundle, and no remote dependency.
- Splitting the ruler into its own grid made the layout easier to reason about than hiding a child of a mixed grid.

## Patch identity and storage boundaries

The selected preset is now derived from the complete current pattern, not a separate default label. An edited pattern is custom even when it retains its source name. `savedSnapshot` independently tracks whether the current pattern changed since the session snapshot or last successful save.

```js
export const currentPresetId = computed(() => presets.find((preset) =>
  JSON.stringify(preset) === JSON.stringify(pattern()))?.id || '');
export const hasUnsavedChanges = computed(() =>
  JSON.stringify(pattern()) !== savedSnapshot());
```

Problem: saving Slow Bloom restored its notes and tempo but highlighted Brass Grid. Fix: derive preset identity from restored data. Proof: a regression saves, reloads the module, and verifies the matching preset; smoke repeats that flow in a browser. A custom edit clears preset highlighting without discarding source identity.

Problem: denied storage threw from save/reset. Fix: catch each browser boundary and update `memoryStatus`; do not change the saved snapshot or current pattern after a failed write/remove. The user can keep editing and export JSON. Unit and browser tests deliberately deny both operations.

The studio is an instrument workspace, not another landing page. A compact patch register and transport precede the sequencer; memory follows the instrument on mobile. Beat-start rules group sixteen steps in fours. Gain and tune show exact numbers. The existing engine and transport cleanup remain unchanged, including coalesced starts and stop/dispose cancellation races.

What stayed smooth: computed identity fitted the existing signals without extra effects, JSON export required no service, and the original sixteen-cell ruler and stopped-playhead checks remained useful. No new dependencies or audio assets were introduced.

## Verification commands

The mobile guide needed its own layout regression: an uncontained `pre` gave the grid card a minimum content width wider than the390px document. Guide cards now use `min-width: 0`; code blocks retain literal whitespace and scroll inside their maximum width. The smoke checks document width with both normal code fonts and an intentionally wider Courier fallback. This containment is scoped to the guide, not the working instrument.

Expected gates:

```bash
npm ci
npm run test
npm run build
npm run smoke
```

The important lifecycle regression proof is `src/audio/engine.lifecycle.test.js`. Browser smoke tests cover controls, routing, the sixteen-cell ruler, the stopped playhead state, and desktop/mobile studio screenshots. The Web Audio race still needs the focused unit test because it depends on async scheduling order.

## Presentation contract

The stylesheet uses local Avenir/Segoe sans fallbacks, 16px body copy, 14px labels and controls, bounded build/detail headings, and 44px controls. Code and structured readouts keep their monospace role. Theme identity comes from the real art, instrument, gear or status data rather than decorative page texture. Browser checks assert this contract alongside the existing behavior tests. Keep source/public CSS synchronized where server-rendered packaging requires it.
