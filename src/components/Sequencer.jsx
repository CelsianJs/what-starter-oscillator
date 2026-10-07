import { STEPS } from '../data/presets.js';
import { activeSoloCount, currentStep, isPlaying, pattern, setTrackFrequency, setTrackGain, toggleMute, toggleSolo, toggleStep } from '../state/studio.js';

const stepNumbers = Array.from({ length: STEPS }, (_, index) => index);

export default function Sequencer() {
  return (
    <section class="sequencer" aria-label="Sixteen step sequencer">
      <div class="step-header" aria-hidden="true">
        <span class="track-header">Track</span>
        <div class="step-numbers">
          {stepNumbers.map((step) => <span>{step + 1}</span>)}
        </div>
      </div>
      {() => pattern().tracks.map((track) => (
        <div class="track-row" data-muted={track.muted ? 'true' : 'false'}>
          <div class="track-controls">
            <strong>{track.name}</strong>
            <small>{track.waveform} / {track.frequency} hz</small>
            <div class="micro-buttons">
              <button class={() => track.muted ? 'micro active' : 'micro'} aria-pressed={track.muted ? 'true' : 'false'} onClick={() => toggleMute(track.id)}>Mute</button>
              <button class={() => track.solo ? 'micro active' : 'micro'} aria-pressed={track.solo ? 'true' : 'false'} onClick={() => toggleSolo(track.id)}>Solo</button>
            </div>
            <div class="tone-controls">
              <label>
                <span>Gain {Math.round(track.gain * 100)}%</span>
                <input type="range" min="0" max="1" step="0.01" value={track.gain} onInput={(event) => setTrackGain(track.id, event.target.value)} />
              </label>
              <label>
                <span>Tune {track.frequency} Hz</span>
                <input type="range" min="20" max="9000" value={track.frequency} onInput={(event) => setTrackFrequency(track.id, event.target.value)} />
              </label>
            </div>
          </div>
          <div class="steps" role="group" aria-label={`${track.name} steps`}>
            {track.steps.map((enabled, step) => (
              <button
                class={() => [
                  'step',
                  enabled && 'on',
                  isPlaying() && currentStep() === step && 'playing',
                  activeSoloCount() > 0 && !track.solo && 'shadowed',
                ].filter(Boolean).join(' ')}
                aria-label={`${track.name} step ${step + 1}`}
                aria-pressed={enabled ? 'true' : 'false'}
                data-beat-start={step % 4 === 0 ? 'true' : 'false'}
                onClick={() => toggleStep(track.id, step)}
              >
                <span>{step + 1}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
