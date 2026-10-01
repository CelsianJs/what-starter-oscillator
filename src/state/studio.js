import { computed, signal } from 'what-framework';
import { presets, STEPS } from '../data/presets.js';
import { clonePattern, sanitizePattern } from '../utils/pattern.js';

const STORAGE_KEY = 'what-starter-oscillator-pattern';

function loadSavedPattern() {
  const fallback = clonePattern(presets[0]);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return sanitizePattern(parsed, fallback);
  } catch {
    return fallback;
  }
}

export const currentPresetId = signal('brass-grid');
export const pattern = signal(loadSavedPattern());
export const isPlaying = signal(false);
export const currentStep = signal(0);
export const audioStatus = signal('Audio stopped. Press Start audio to enable playback.');
export const browserError = signal('');

export const activeSoloCount = computed(() => pattern().tracks.filter((track) => track.solo).length);
export const activeSteps = computed(() => pattern().tracks.reduce((sum, track) => sum + track.steps.filter(Boolean).length, 0));

export function setTempo(value) {
  updatePattern((draft) => ({ ...draft, tempo: clamp(Number(value) || 40, 40, 220) }));
}

export function setSwing(value) {
  updatePattern((draft) => ({ ...draft, swing: clamp(Number(value) || 0, 0, 0.45) }));
}

export function loadPreset(id) {
  const preset = presets.find((item) => item.id === id) || presets[0];
  currentPresetId(preset.id);
  pattern(clonePattern(preset));
  currentStep(0);
  audioStatus(`Loaded ${preset.name}.`);
}

export function toggleStep(trackId, stepIndex) {
  updatePattern((draft) => ({
    ...draft,
    tracks: draft.tracks.map((track) => {
      if (track.id !== trackId) return track;
      const steps = [...track.steps];
      steps[stepIndex] = steps[stepIndex] ? 0 : 1;
      return { ...track, steps };
    }),
  }));
}

export function toggleMute(trackId) {
  updateTrack(trackId, (track) => ({ ...track, muted: !track.muted }));
}

export function toggleSolo(trackId) {
  updateTrack(trackId, (track) => ({ ...track, solo: !track.solo }));
}

export function setTrackGain(trackId, value) {
  updateTrack(trackId, (track) => ({ ...track, gain: clamp(Number(value) || 0, 0, 1) }));
}

export function setTrackFrequency(trackId, value) {
  updateTrack(trackId, (track) => ({ ...track, frequency: clamp(Number(value) || 20, 20, 9000) }));
}

export function savePattern() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pattern()));
  audioStatus('Pattern saved in localStorage.');
}

export function resetSavedPattern() {
  localStorage.removeItem(STORAGE_KEY);
  loadPreset(currentPresetId());
}

export function exportPattern() {
  return JSON.stringify(pattern(), null, 2);
}

function updateTrack(trackId, mapper) {
  updatePattern((draft) => ({
    ...draft,
    tracks: draft.tracks.map((track) => (track.id === trackId ? mapper(track) : track)),
  }));
}

function updatePattern(mapper) {
  const next = mapper(pattern());
  pattern({
    ...next,
    tracks: next.tracks.map((track) => ({
      ...track,
      steps: [...track.steps].slice(0, STEPS),
    })),
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
