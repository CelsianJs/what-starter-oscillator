export default function BuildPage() {
  return (
    <section class="build-page">
      <p class="eyebrow">Agent reference</p>
      <h1>How Oscillator is built</h1>
      <div class="build-grid">
        <article>
          <h2>Global state</h2>
          <p><code>src/state/studio.js</code> owns the pattern, transport flags, current step, browser errors, and derived active step counts through What signals and computed values.</p>
        </article>
        <article>
          <h2>Web Audio lifecycle</h2>
          <p><code>src/audio/engine.js</code> creates oscillator, filter, and gain nodes per step. <code>Transport</code> calls <code>disposeEngine</code> in a cleanup effect so timers and audio contexts stop on unmount.</p>
        </article>
        <article>
          <h2>Interactions</h2>
          <p>The sequencer uses real buttons for every step, plus visible mute, solo, gain, tune, tempo, swing, save, reset, and export controls. Nothing depends on hover-only or canvas-only input.</p>
        </article>
        <article>
          <h2>Limitations</h2>
          <p>Audio starts only after a user gesture and requires Web Audio support. Local save is browser-local storage. Export is a client-side JSON download.</p>
        </article>
      </div>
    </section>
  );
}
