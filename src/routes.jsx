import HomePage from './pages/HomePage.jsx';
import StudioPage from './pages/StudioPage.jsx';
import BuildPage from './pages/BuildPage.jsx';

export const routes = [
  { path: '/', component: HomePage },
  { path: '/studio', component: StudioPage },
  { path: '/build', component: BuildPage },
  { path: '/404', component: () => <MissingAlias /> },
];

function MissingAlias() {
  return (
    <section class="not-found">
      <p class="eyebrow">Static 404 alias</p>
      <h1>This page is the spare plate behind the patch bay.</h1>
      <a class="button" href="/studio">Return to studio</a>
    </section>
  );
}
