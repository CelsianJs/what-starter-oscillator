export const STEPS = 16;

export const presets = [
  {
    id: 'brass-grid',
    name: 'Brass Grid',
    tempo: 118,
    swing: 0.1,
    tracks: [
      { id: 'kick', name: 'Kick', waveform: 'sine', frequency: 72, gain: 0.9, muted: false, solo: false, steps: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0] },
      { id: 'hat', name: 'Hat', waveform: 'square', frequency: 6800, gain: 0.25, muted: false, solo: false, steps: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0] },
      { id: 'bass', name: 'Bass', waveform: 'sawtooth', frequency: 110, gain: 0.45, muted: false, solo: false, steps: [1,0,0,1,0,0,1,0,1,0,0,1,0,1,0,0] },
      { id: 'lead', name: 'Lead', waveform: 'triangle', frequency: 330, gain: 0.32, muted: false, solo: false, steps: [0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0] },
    ],
  },
  {
    id: 'slow-bloom',
    name: 'Slow Bloom',
    tempo: 86,
    swing: 0.18,
    tracks: [
      { id: 'kick', name: 'Kick', waveform: 'sine', frequency: 64, gain: 0.88, muted: false, solo: false, steps: [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0] },
      { id: 'hat', name: 'Hat', waveform: 'square', frequency: 4200, gain: 0.2, muted: false, solo: false, steps: [0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,0] },
      { id: 'bass', name: 'Bass', waveform: 'sawtooth', frequency: 92, gain: 0.5, muted: false, solo: false, steps: [1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0] },
      { id: 'lead', name: 'Lead', waveform: 'triangle', frequency: 247, gain: 0.3, muted: false, solo: false, steps: [0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0] },
    ],
  },
  {
    id: 'warehouse-study',
    name: 'Warehouse Study',
    tempo: 132,
    swing: 0.06,
    tracks: [
      { id: 'kick', name: 'Kick', waveform: 'sine', frequency: 76, gain: 0.95, muted: false, solo: false, steps: [1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0] },
      { id: 'hat', name: 'Hat', waveform: 'square', frequency: 7600, gain: 0.22, muted: false, solo: false, steps: [0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1] },
      { id: 'bass', name: 'Bass', waveform: 'sawtooth', frequency: 124, gain: 0.42, muted: false, solo: false, steps: [1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0] },
      { id: 'lead', name: 'Lead', waveform: 'triangle', frequency: 392, gain: 0.28, muted: false, solo: false, steps: [0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0] },
    ],
  },
];
