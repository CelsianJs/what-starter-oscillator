import { Link } from 'what-framework/router';

export default function HomePage() {
  return (
    <section class="hero instrument-hero">
      <div>
        <p class="eyebrow">Analog browser studio</p>
        <h1>Make the next thing you hear.</h1>
        <p class="lede">Oscillator is a compact music workstation for sketching patterns in the browser. It makes sound locally with Web Audio, saves patterns locally, and exports JSON without microphone permissions or remote services.</p>
        <div class="button-row">
          <Link class="button" href="/studio">Open the studio</Link>
          <Link class="button ghost" href="/build">Read build notes</Link>
        </div>
      </div>
      <InstrumentPreview />
    </section>
  );
}

function InstrumentPreview() {
  const rows = [
    ['Kick', [1, 0, 0, 0, 1, 0, 1, 0]],
    ['Hat', [0, 1, 1, 1, 0, 1, 1, 1]],
    ['Bass', [1, 0, 1, 0, 0, 0, 1, 0]],
  ];

  return (
    <aside class="instrument-preview" aria-label="Studio preview">
      <div class="preview-header">
        <span>118 bpm</span>
        <span>Swing 10%</span>
        <span>Local audio</span>
      </div>
      <div class="knob-row" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="preview-grid">
        {rows.map(([label, steps]) => (
          <div class="preview-track">
            <strong>{label}</strong>
            <div>
              {steps.map((step, index) => <i class={step ? 'lit' : ''}>{index + 1}</i>)}
            </div>
          </div>
        ))}
      </div>
      <p>No microphone. No samples. Just oscillator nodes after you press start.</p>
    </aside>
  );
}
