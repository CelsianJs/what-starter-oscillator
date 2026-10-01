import { useEffect } from 'what-framework';
import { disposeEngine, startEngine, stopEngine } from '../audio/engine.js';
import { audioStatus, activeSteps, browserError, isPlaying, pattern, setSwing, setTempo } from '../state/studio.js';

export default function Transport() {
  useEffect(() => {
    return () => {
      disposeEngine();
    };
  }, []);

  return (
    <section class="transport" aria-labelledby="transport-title">
      <div>
        <p class="eyebrow">Transport</p>
        <h2 id="transport-title">Explicit audio start, clear stop, live timing.</h2>
        <p class="status" aria-live="polite">{() => browserError() || audioStatus()}</p>
      </div>
      <div class="transport-controls">
        <button class="button" disabled={() => isPlaying()} onClick={startEngine}>{() => isPlaying() ? 'Audio running' : 'Start audio'}</button>
        <button class="button ghost" onClick={stopEngine}>Stop</button>
        <label>
          <span>Tempo {() => pattern().tempo} bpm</span>
          <input type="range" min="40" max="220" value={() => pattern().tempo} onInput={(event) => setTempo(event.target.value)} />
        </label>
        <label>
          <span>Swing {() => Math.round(pattern().swing * 100)}%</span>
          <input type="range" min="0" max="0.45" step="0.01" value={() => pattern().swing} onInput={(event) => setSwing(event.target.value)} />
        </label>
        <p class="mini-stat">{() => activeSteps()} active steps</p>
      </div>
    </section>
  );
}
