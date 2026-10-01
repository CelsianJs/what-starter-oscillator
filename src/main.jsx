import { mount } from 'what-framework';
import { Router, enableScrollRestoration } from 'what-framework/router';
import { routes } from './routes.jsx';
import './styles.css';

enableScrollRestoration();
mount(<Router routes={routes} globalLayout={Shell} fallback={NotFound} />, '#app');

function Shell({ children }) {
  return (
    <div class="shell">
      <a class="skip-link" href="#content">Skip to content</a>
      <header class="topbar">
        <a class="brand" href="/">OSCILLATOR</a>
        <nav class="nav" aria-label="Primary">
          <a href="/studio">Studio</a>
          <a href="/build">Build notes</a>
        </nav>
      </header>
      <main id="content">{children}</main>
    </div>
  );
}

function NotFound() {
  return (
    <section class="not-found">
      <p class="eyebrow">404</p>
      <h1>That patch bay is not wired.</h1>
      <p>The public studio only exposes the home, studio, and build-note rooms.</p>
      <a class="button" href="/studio">Open the studio</a>
    </section>
  );
}
