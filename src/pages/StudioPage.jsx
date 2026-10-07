import PresetPanel from '../components/PresetPanel.jsx';
import Sequencer from '../components/Sequencer.jsx';
import Transport from '../components/Transport.jsx';
import { hasUnsavedChanges, patchIdentity } from '../state/studio.js';

export default function StudioPage() {
  return (
    <div class="studio-page">
      <section class="studio-heading">
        <div><p class="eyebrow">Oscillator / pattern studio</p><h1>Make a little noise.</h1></div>
        <div class="patch-register"><strong>{patchIdentity}</strong><span>{() => hasUnsavedChanges() ? 'Unsaved changes' : 'No new edits'}</span><p>16 steps · 4 beats · local synthesis</p></div>
      </section>
      <Transport />
      <div class="studio-grid">
        <Sequencer />
        <PresetPanel />
      </div>
    </div>
  );
}
