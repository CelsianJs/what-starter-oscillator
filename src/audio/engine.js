import { audioStatus, browserError, currentStep, isPlaying, pattern } from '../state/studio.js';

let context = null;
let timer = null;
let nextStepAt = 0;
let stepIndex = 0;
let startingPromise = null;
let startGeneration = 0;
const activeVoices = new Set();

export function isAudioSupported() {
  return Boolean(window.AudioContext || window.webkitAudioContext);
}

export async function startEngine() {
  if (timer || isPlaying()) {
    audioStatus('Audio already running.');
    return;
  }
  if (startingPromise) {
    audioStatus('Audio starting.');
    return startingPromise;
  }
  if (!isAudioSupported()) {
    browserError('This browser does not expose Web Audio. Try a current Chromium, Safari, or Firefox build.');
    return;
  }
  browserError('');
  const generation = ++startGeneration;
  startingPromise = (async () => {
    if (!context) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      context = new AudioCtor();
    }
    await context.resume();
    if (generation !== startGeneration || timer || isPlaying()) return;
    stepIndex = currentStep();
    nextStepAt = context.currentTime + 0.05;
    isPlaying(true);
    audioStatus('Audio running. Toggle steps, mutes, solos, tempo, and swing live.');
    scheduler();
    if (generation !== startGeneration || !isPlaying()) return;
    timer = window.setInterval(scheduler, 25);
  })().finally(() => {
    if (generation === startGeneration) {
      startingPromise = null;
    }
  });
  return startingPromise;
}

export function stopEngine() {
  startGeneration += 1;
  startingPromise = null;
  if (timer) {
    window.clearInterval(timer);
    timer = null;
  }
  stopActiveVoices();
  isPlaying(false);
  currentStep(0);
  stepIndex = 0;
  audioStatus('Audio stopped.');
}

export async function disposeEngine() {
  stopEngine();
  if (context) {
    await context.close().catch(() => {});
    context = null;
  }
}

function scheduler() {
  if (!context || !isPlaying()) return;
  while (nextStepAt < context.currentTime + 0.12) {
    playStep(stepIndex, nextStepAt);
    const bpm = pattern().tempo;
    const sixteenth = 60 / bpm / 4;
    const swingOffset = stepIndex % 2 === 1 ? sixteenth * pattern().swing : 0;
    nextStepAt += sixteenth + swingOffset;
    stepIndex = (stepIndex + 1) % 16;
    currentStep(stepIndex);
  }
}

function playStep(index, at) {
  const state = pattern();
  const soloCount = state.tracks.filter((track) => track.solo).length;
  state.tracks.forEach((track) => {
    if (!track.steps[index]) return;
    if (soloCount > 0 && !track.solo) return;
    if (track.muted) return;
    playVoice(track, at);
  });
}

function playVoice(track, at) {
  const osc = context.createOscillator();
  const amp = context.createGain();
  const filter = context.createBiquadFilter();
  osc.type = track.waveform;
  osc.frequency.setValueAtTime(track.frequency, at);
  filter.type = track.id === 'hat' ? 'highpass' : 'lowpass';
  filter.frequency.setValueAtTime(track.id === 'hat' ? 3600 : 1100, at);
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, track.gain), at + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + (track.id === 'kick' ? 0.22 : 0.12));
  osc.connect(filter);
  filter.connect(amp);
  amp.connect(context.destination);
  const voice = { osc, filter, amp };
  activeVoices.add(voice);
  osc.onended = () => {
    activeVoices.delete(voice);
    try {
      osc.disconnect();
      filter.disconnect();
      amp.disconnect();
    } catch {}
  };
  osc.start(at);
  osc.stop(at + 0.26);
}

function stopActiveVoices() {
  for (const voice of activeVoices) {
    try {
      voice.osc.stop(0);
    } catch {}
    try {
      voice.osc.disconnect();
      voice.filter.disconnect();
      voice.amp.disconnect();
    } catch {}
  }
  activeVoices.clear();
}
