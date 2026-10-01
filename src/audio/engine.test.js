import { describe, expect, it } from 'vitest';
import { presets } from '../data/presets.js';
import { clonePattern, isValidPattern, sanitizePattern } from '../utils/pattern.js';

describe('oscillator preset data', () => {
  it('clones presets without sharing step arrays', () => {
    const original = presets[0];
    const copy = clonePattern(original);
    copy.tracks[0].steps[0] = 0;
    expect(original.tracks[0].steps[0]).toBe(1);
  });

  it('ships exactly sixteen steps per track', () => {
    for (const preset of presets) {
      for (const track of preset.tracks) {
        expect(track.steps).toHaveLength(16);
      }
    }
  });

  it('rejects malformed saved storage and falls back to the seed pattern', () => {
    const fallback = clonePattern(presets[0]);
    const malformed = {
      tempo: 600,
      swing: 10,
      tracks: [{ id: 'bad', name: 'Bad', waveform: 'noise', steps: [1] }],
    };
    expect(isValidPattern(malformed)).toBe(false);
    expect(sanitizePattern(malformed, fallback)).toEqual(fallback);
  });

  it('accepts a fully shaped stored pattern', () => {
    const valid = clonePattern(presets[1]);
    expect(isValidPattern(valid)).toBe(true);
    expect(sanitizePattern(valid, presets[0])).toEqual(valid);
  });
});
