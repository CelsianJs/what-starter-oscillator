import { afterEach, beforeEach, expect, it, vi } from 'vitest';

let store;
beforeEach(() => {
  vi.resetModules();
  store = new Map();
  vi.stubGlobal('localStorage', {
    getItem: key => store.get(key) || null,
    setItem: (key, value) => store.set(key, value),
    removeItem: key => store.delete(key),
  });
});
afterEach(() => vi.unstubAllGlobals());

it('restores the real saved preset rather than highlighting Brass Grid', async () => {
  let studio = await import('./studio.js');
  studio.loadPreset('slow-bloom');
  studio.savePattern();
  vi.resetModules();
  studio = await import('./studio.js');
  expect(studio.pattern().tempo).toBe(86);
  expect(studio.currentPresetId()).toBe('slow-bloom');
  expect(studio.memoryStatus()).toMatch(/restored/i);
});

it('identifies edits as custom and keeps saved/unsaved identity separate', async () => {
  const studio = await import('./studio.js');
  studio.toggleStep('kick', 1);
  expect(studio.currentPresetId()).toBe('');
  expect(studio.hasUnsavedChanges()).toBe(true);
  studio.savePattern();
  expect(studio.hasUnsavedChanges()).toBe(false);
  vi.resetModules();
  const restored = await import('./studio.js');
  expect(restored.currentPresetId()).toBe('');
  expect(restored.hasUnsavedChanges()).toBe(false);
});

it('keeps edits usable when storage writes and removes are denied', async () => {
  const studio = await import('./studio.js');
  studio.setTempo(143);
  const before = JSON.stringify(studio.pattern());
  localStorage.setItem = () => { throw new Error('denied'); };
  localStorage.removeItem = () => { throw new Error('denied'); };
  expect(() => studio.savePattern()).not.toThrow();
  expect(studio.memoryStatus()).toMatch(/not saved/i);
  expect(studio.hasUnsavedChanges()).toBe(true);
  expect(() => studio.resetSavedPattern()).not.toThrow();
  expect(studio.memoryStatus()).toMatch(/could not remove/i);
  expect(JSON.stringify(studio.pattern())).toBe(before);
});

it('falls back safely when saved JSON is malformed or reads are denied', async () => {
  store.set('what-starter-oscillator-pattern', '{bad-json');
  let studio = await import('./studio.js');
  expect(studio.currentPresetId()).toBe('brass-grid');
  vi.resetModules();
  localStorage.getItem = () => { throw new Error('denied'); };
  studio = await import('./studio.js');
  expect(studio.pattern().tempo).toBe(118);
});
