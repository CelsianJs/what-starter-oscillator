import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { collectChildLogs, spawnLocalVitePreview, starterRoot, stopOwnedProcess, waitForOwnedReadiness } from '../scripts/smoke-harness.mjs';

const port = 5179;
const baseURL = `http://127.0.0.1:${port}`;
const root = starterRoot(import.meta.url);
const server = spawnLocalVitePreview({ cwd: root, port });
const logs = collectChildLogs(server);

async function waitForServer() {
  await waitForOwnedReadiness(server, {
    logs,
    readyPattern: new RegExp(`Local:\\s+http://127\\.0\\.0\\.1:${port}/`),
    label: 'Oscillator Vite preview',
  });
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(baseURL);
      if (res.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Vite preview did not start: ${logs.join('\n')}`);
}

try {
  await waitForServer();
  await mkdir('test-artifacts', { recursive: true });
  var browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', error => consoleErrors.push(error.message));

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Make the next thing/i }).waitFor();
  await page.screenshot({ path: 'test-artifacts/oscillator-desktop-home.png', fullPage: true });

  await page.goto(`${baseURL}/studio`, { waitUntil: 'networkidle' });
  const stepHeaderCount = await page.locator('.step-numbers span').count();
  if (stepHeaderCount !== 16) {
    throw new Error(`Expected 16 visible step header numbers, found ${stepHeaderCount}`);
  }
  const desktopStepColumns = await page.locator('.step-numbers').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
  if (desktopStepColumns !== 16) {
    throw new Error(`Desktop step header is not a 16-column ruler: ${desktopStepColumns}`);
  }
  const stoppedPlayingCount = await page.locator('.step.playing').count();
  if (stoppedPlayingCount !== 0) {
    throw new Error(`Stopped transport should not show a playhead outline; found ${stoppedPlayingCount}`);
  }
  await page.getByRole('button', { name: /Slow Bloom/i }).click();
  await page.getByRole('button', { name: 'Save locally' }).click();
  await page.reload({ waitUntil: 'networkidle' });
  if (!(await page.locator('.preset.active').innerText()).includes('Slow Bloom')) throw new Error('Saved preset identity did not restore');
  await page.getByRole('button', { name: 'Kick step 2' }).click();
  await page.waitForFunction(() => document.querySelector('.patch-register').textContent.includes('custom'));
  await page.getByRole('button', { name: 'Mute' }).first().click();
  await page.getByRole('button', { name: 'Export JSON' }).click();
  await page.getByRole('heading', { name: /Make a little noise/i }).waitFor();
  await page.screenshot({ path: 'test-artifacts/oscillator-desktop-studio.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/studio`, { waitUntil: 'networkidle' });
  const mobileStepColumns = await page.locator('.step-numbers').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
  if (mobileStepColumns !== 8) {
    throw new Error(`Mobile step header should wrap as 8 columns, found ${mobileStepColumns}`);
  }
  const mobileLayout = await page.evaluate(() => ({ step: document.querySelector('.step').getBoundingClientRect().toJSON(), memory: document.querySelector('.preset-panel').getBoundingClientRect().top, sequencer: document.querySelector('.sequencer').getBoundingClientRect().top, overflow: document.documentElement.scrollWidth > innerWidth }));
  if (mobileLayout.step.height < 44 || mobileLayout.step.width < 44 || mobileLayout.sequencer >= mobileLayout.memory || mobileLayout.overflow) throw new Error(`Unusable mobile studio: ${JSON.stringify(mobileLayout)}`);
  await page.getByRole('button', { name: 'Start audio' }).click();
  await page.getByRole('button', { name: 'Audio running' }).waitFor();
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('.step.playing'));
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('storage denied'); }; Storage.prototype.removeItem = () => { throw new Error('storage denied'); }; });
  await page.getByRole('button', { name: 'Save locally' }).click();
  await page.getByText(/Pattern not saved/).waitFor();
  await page.getByRole('button', { name: 'Reset saved' }).click();
  await page.getByText(/Could not remove/).waitFor();
  await page.screenshot({ path: 'test-artifacts/oscillator-mobile-studio.png', fullPage: true });
  await page.goto(`${baseURL}/build`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /How Oscillator is built/i }).waitFor();
  await page.screenshot({ path: 'test-artifacts/oscillator-mobile-build.png', fullPage: true });
  const guideWidths = [await page.evaluate(() => ({ font: 'default', viewport: innerWidth, document: document.documentElement.scrollWidth }))];
  await page.addStyleTag({ content: '.build-page pre code { font-family: "Courier New", monospace; font-size: 18px; letter-spacing: .8px; }' });
  guideWidths.push(await page.evaluate(() => ({ font: 'wide fallback', viewport: innerWidth, document: document.documentElement.scrollWidth })));
  if (guideWidths.some(width => width.document > width.viewport)) throw new Error(`Build guide overflow: ${JSON.stringify(guideWidths)}`);
  const codeText = await page.locator('.build-page pre code').innerText();
  if (!codeText.includes('JSON.stringify(pattern()) !== savedSnapshot());')) throw new Error('Build guide lost literal code text');

  if (consoleErrors.length) {
    throw new Error(`Console errors:\n${consoleErrors.join('\n')}`);
  }
  await browser.close();
  browser = null;
  console.log('PASS oscillator smoke: home, studio editing, export, build route, desktop/mobile screenshots');
} finally {
  if (browser) await browser.close().catch(() => {});
  await stopOwnedProcess(server, { logs, label: 'Oscillator Vite preview' });
}
