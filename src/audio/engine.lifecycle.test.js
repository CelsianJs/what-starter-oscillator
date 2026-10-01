import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class FakeParam {
  setValueAtTime() {}
  exponentialRampToValueAtTime() {}
}

class FakeNode {
  connect() {}
  disconnect() {}
}

class FakeOscillator extends FakeNode {
  constructor() {
    super();
    this.frequency = new FakeParam();
    this.onended = null;
    this.stopCount = 0;
  }

  start() {}

  stop() {
    this.stopCount += 1;
    this.onended?.();
  }
}

class FakeAudioContext {
  static resumePromises = [];
  static instances = [];

  constructor() {
    this.currentTime = 0;
    this.destination = new FakeNode();
    this.closed = false;
    FakeAudioContext.instances.push(this);
  }

  resume() {
    const deferred = Promise.withResolvers();
    FakeAudioContext.resumePromises.push(deferred);
    return deferred.promise;
  }

  close() {
    this.closed = true;
    return Promise.resolve();
  }

  createOscillator() {
    return new FakeOscillator();
  }

  createGain() {
    return { gain: new FakeParam(), connect() {}, disconnect() {} };
  }

  createBiquadFilter() {
    return { frequency: new FakeParam(), connect() {}, disconnect() {} };
  }
}

describe('audio engine lifecycle', () => {
  let intervals;
  let cleared;

  beforeEach(() => {
    vi.resetModules();
    intervals = [];
    cleared = [];
    FakeAudioContext.resumePromises = [];
    FakeAudioContext.instances = [];
    vi.stubGlobal('window', {
      AudioContext: FakeAudioContext,
      setInterval: vi.fn((fn, delay) => {
        const id = { fn, delay };
        intervals.push(id);
        return id;
      }),
      clearInterval: vi.fn((id) => {
        cleared.push(id);
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps startEngine idempotent and stopEngine clears the only interval', async () => {
    const { isPlaying } = await import('../state/studio.js');
    const { startEngine, stopEngine, disposeEngine } = await import('./engine.js');

    const start = startEngine();
    FakeAudioContext.resumePromises[0].resolve();
    await start;
    const secondStart = startEngine();
    await secondStart;

    expect(intervals).toHaveLength(1);
    expect(isPlaying()).toBe(true);

    stopEngine();
    expect(cleared).toHaveLength(1);
    expect(isPlaying()).toBe(false);

    await disposeEngine();
  });

  it('coalesces simultaneous starts before resume resolves into one interval', async () => {
    const { isPlaying } = await import('../state/studio.js');
    const { startEngine, stopEngine, disposeEngine } = await import('./engine.js');

    const firstStart = startEngine();
    const secondStart = startEngine();

    expect(FakeAudioContext.instances).toHaveLength(1);
    expect(FakeAudioContext.resumePromises).toHaveLength(1);
    expect(intervals).toHaveLength(0);

    FakeAudioContext.resumePromises[0].resolve();
    await Promise.all([firstStart, secondStart]);

    expect(intervals).toHaveLength(1);
    expect(isPlaying()).toBe(true);

    stopEngine();
    expect(cleared).toHaveLength(1);
    expect(isPlaying()).toBe(false);

    await disposeEngine();
    expect(cleared).toHaveLength(1);
  });

  it('cancels a pending start when stopped before resume resolves', async () => {
    const { isPlaying } = await import('../state/studio.js');
    const { startEngine, stopEngine, disposeEngine } = await import('./engine.js');

    const pendingStart = startEngine();
    expect(FakeAudioContext.resumePromises).toHaveLength(1);

    stopEngine();
    FakeAudioContext.resumePromises[0].resolve();
    await pendingStart;

    expect(intervals).toHaveLength(0);
    expect(cleared).toHaveLength(0);
    expect(isPlaying()).toBe(false);

    await disposeEngine();
    expect(intervals).toHaveLength(0);
  });

  it('cancels a pending start when disposed before resume resolves', async () => {
    const { isPlaying } = await import('../state/studio.js');
    const { startEngine, disposeEngine } = await import('./engine.js');

    const pendingStart = startEngine();
    expect(FakeAudioContext.resumePromises).toHaveLength(1);

    const pendingDispose = disposeEngine();
    FakeAudioContext.resumePromises[0].resolve();
    await pendingStart;
    await pendingDispose;

    expect(FakeAudioContext.instances[0].closed).toBe(true);
    expect(intervals).toHaveLength(0);
    expect(cleared).toHaveLength(0);
    expect(isPlaying()).toBe(false);
  });
});
