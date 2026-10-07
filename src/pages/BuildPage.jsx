export default function BuildPage() {
  return (
    <section class="build-page">
      <p class="eyebrow">Agent reference</p>
      <h1>How Oscillator is built</h1>
      <div class="build-grid">
        <article>
          <h2>Identity follows the pattern</h2>
          <p>A saved Slow Bloom originally restored its tempo but still highlighted Brass Grid. <code>currentPresetId</code> is now computed from the entire pattern; edits show custom identity, while the saved snapshot tracks changes independently.</p>
          <pre><code>{`export const hasUnsavedChanges = computed(() =>
  JSON.stringify(pattern()) !== savedSnapshot());`}</code></pre>
          <p>Save and reset catch denied browser storage and report recovery through <code>memoryStatus</code>. A failed write does not claim success, and a failed remove leaves the current pattern untouched. Regression tests cover reload and both denial paths.</p>
        </article>
        <article>
          <h2>A working instrument first</h2>
          <p>The studio now places the sequencer before pattern memory on mobile, shows numerical gain/tune values and marks each four-step beat. The audio engine required no redesign: transport still owns cleanup, and the existing asynchronous start/stop/dispose tests remain the safety boundary.</p>
        </article>
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
          <h2>Ruler and playhead fix</h2>
          <p>The step ruler is a dedicated <code>.step-numbers</code> grid with sixteen cells on desktop and two rows of eight on mobile. The playhead outline is gated by <code>isPlaying()</code>, so a stopped pattern never looks like it is already running.</p>
        </article>
        <article>
          <h2>Limitations</h2>
          <p>Audio starts only after a user gesture and requires Web Audio support. Local save is browser-local storage. Export is a client-side JSON download.</p>
        </article>
      </div>
    </section>
  );
}
