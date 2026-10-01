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

## Persistence and export boundaries

Saved patterns use `localStorage` when it is available. The loader sanitizes saved JSON before it reaches the signal so malformed storage cannot put the UI into an impossible state.

Export stays browser-native: it creates JSON for download and attempts clipboard copy only when the browser allows it. Clipboard denial is treated as a recoverable browser boundary, not an app failure.

## What worked smoothly

- Keeping `activeSteps`, solo state, and transport labels as computed values made the UI reactive without extra effect wiring.
- Explicit routes made the demo easy to statically alias for Vura.
- The sample-free synth kept the starter portable: no audio assets, no worker bundle, and no remote dependency.

## Verification

Expected gates:

```bash
npm ci
npm run test
npm run build
npm run test:browser
```

The important regression proof is `src/audio/engine.lifecycle.test.js`. Browser smoke tests are still useful for controls, routing, and layout, but the Web Audio race needed a focused unit test because it depends on async scheduling order.
