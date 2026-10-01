import { presets } from '../data/presets.js';
import { currentPresetId, exportPattern, loadPreset, resetSavedPattern, savePattern } from '../state/studio.js';

export default function PresetPanel() {
  const copyExport = async () => {
    const json = exportPattern();
    await navigator.clipboard?.writeText(json).catch(() => {});
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'oscillator-pattern.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside class="preset-panel" aria-label="Presets and storage">
      <p class="eyebrow">Pattern memory</p>
      <div class="preset-list">
        {presets.map((preset) => (
          <button
            class={() => currentPresetId() === preset.id ? 'preset active' : 'preset'}
            onClick={() => loadPreset(preset.id)}
          >
            <span>{preset.name}</span>
            <small>{preset.tempo} bpm</small>
          </button>
        ))}
      </div>
      <div class="button-row vertical">
        <button class="button ghost" onClick={savePattern}>Save locally</button>
        <button class="button ghost" onClick={copyExport}>Export JSON</button>
        <button class="button ghost danger" onClick={resetSavedPattern}>Reset saved</button>
      </div>
      <p class="note">Local save uses <code>localStorage</code>. Export downloads a JSON pattern and tries to copy it to your clipboard.</p>
    </aside>
  );
}
