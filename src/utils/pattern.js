import { STEPS } from '../data/presets.js';

const WAVEFORMS = new Set(['sine', 'square', 'sawtooth', 'triangle']);

export function isValidPattern(value) {
  if (!value || typeof value !== 'object') return false;
  if (!Number.isFinite(value.tempo) || value.tempo < 40 || value.tempo > 220) return false;
  if (!Number.isFinite(value.swing) || value.swing < 0 || value.swing > 0.45) return false;
  if (!Array.isArray(value.tracks) || value.tracks.length < 1 || value.tracks.length > 8) return false;
  return value.tracks.every(isValidTrack);
}

export function sanitizePattern(value, fallback) {
  if (!isValidPattern(value)) return clonePattern(fallback);
  return {
    id: typeof value.id === 'string' && value.id ? value.id : fallback.id,
    name: typeof value.name === 'string' && value.name ? value.name : fallback.name,
    tempo: value.tempo,
    swing: value.swing,
    tracks: value.tracks.map((track) => ({
      id: track.id,
      name: track.name,
      waveform: track.waveform,
      frequency: track.frequency,
      gain: track.gain,
      muted: track.muted,
      solo: track.solo,
      steps: track.steps.map((step) => (step ? 1 : 0)),
    })),
  };
}

export function clonePattern(pattern) {
  return {
    ...pattern,
    tracks: pattern.tracks.map((track) => ({ ...track, steps: [...track.steps] })),
  };
}

function isValidTrack(track) {
  return Boolean(
    track &&
    typeof track.id === 'string' &&
    track.id.length > 0 &&
    typeof track.name === 'string' &&
    track.name.length > 0 &&
    WAVEFORMS.has(track.waveform) &&
    Number.isFinite(track.frequency) &&
    track.frequency >= 20 &&
    track.frequency <= 9000 &&
    Number.isFinite(track.gain) &&
    track.gain >= 0 &&
    track.gain <= 1 &&
    typeof track.muted === 'boolean' &&
    typeof track.solo === 'boolean' &&
    Array.isArray(track.steps) &&
    track.steps.length === STEPS &&
    track.steps.every((step) => step === 0 || step === 1 || step === false || step === true)
  );
}
