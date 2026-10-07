import { computed, signal } from 'what-framework';
import { presets, STEPS } from '../data/presets.js';
import { clonePattern, isValidPattern, sanitizePattern } from '../utils/pattern.js';

const STORAGE_KEY = 'what-starter-oscillator-pattern';

function loadSavedPattern() {
  const fallback = clonePattern(presets[0]);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { pattern: fallback, restored: false };
    const parsed = JSON.parse(raw);
    return { pattern: sanitizePattern(parsed, fallback), restored: isValidPattern(parsed) };
  } catch {
    return { pattern: fallback, restored: false };
  }
}

const initial = loadSavedPattern();
export const pattern = signal(initial.pattern);
const savedSnapshot = signal(JSON.stringify(pattern()));
export const currentPresetId = computed(() => presets.find((preset) => JSON.stringify(preset) === JSON.stringify(pattern()))?.id || '');
export const hasUnsavedChanges = computed(() => JSON.stringify(pattern()) !== savedSnapshot());
export const patchIdentity = computed(() => `${pattern().name}${currentPresetId() ? ' · preset' : ' · custom'}`);
export const memoryStatus = signal(initial.restored ? 'Saved pattern restored from this browser.' : 'Edits stay in this session until you save locally.');
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
  try {
    const snapshot = JSON.stringify(pattern());
    localStorage.setItem(STORAGE_KEY, snapshot);
    savedSnapshot(snapshot);
    memoryStatus('Pattern saved in this browser.');
  } catch {
    memoryStatus('Pattern not saved. Keep this session open or export JSON.');
  }
}

export function resetSavedPattern() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    loadPreset(pattern().id);
    savedSnapshot(JSON.stringify(pattern()));
    memoryStatus('Local save removed. Source preset restored for this session.');
  } catch {
    memoryStatus('Could not remove the local save. Your current pattern is unchanged.');
  }
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
