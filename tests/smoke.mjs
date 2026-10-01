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
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Make the next thing/i }).waitFor();
  await page.screenshot({ path: 'test-artifacts/oscillator-desktop-home.png', fullPage: true });

  await page.goto(`${baseURL}/studio`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Slow Bloom/i }).click();
  await page.getByRole('button', { name: 'Kick step 2' }).click();
  await page.getByRole('button', { name: 'Mute' }).first().click();
  await page.getByRole('button', { name: 'Export JSON' }).click();
  await page.getByRole('heading', { name: /Patch, play, mute, solo, save, export/i }).waitFor();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/build`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /How Oscillator is built/i }).waitFor();
  await page.screenshot({ path: 'test-artifacts/oscillator-mobile-build.png', fullPage: true });

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
