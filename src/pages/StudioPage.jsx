import PresetPanel from '../components/PresetPanel.jsx';
import Sequencer from '../components/Sequencer.jsx';
import Transport from '../components/Transport.jsx';

export default function StudioPage() {
  return (
    <div class="studio-page">
      <section class="studio-heading">
        <p class="eyebrow">Analog browser studio</p>
        <h1>Patch, play, mute, solo, save, export.</h1>
        <p>No microphone, no recording permission, no remote audio. The synth voices are generated locally by oscillator nodes after a user clicks Start audio.</p>
      </section>
      <Transport />
      <div class="studio-grid">
        <PresetPanel />
        <Sequencer />
      </div>
    </div>
  );
}
