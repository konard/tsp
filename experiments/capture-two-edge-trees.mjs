/**
 * Capture a deterministic review screenshot of the Two Edge Trees UI.
 *
 * Run after `bun run build`:
 *   bun experiments/capture-two-edge-trees.mjs
 */

import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const port = 3010;
const baseUrl = `http://127.0.0.1:${port}`;
const outputPath = 'docs/screenshots/two-edge-trees-result.png';

const server = spawn('bun', ['serve.js'], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port) },
  stdio: 'ignore',
  detached: true,
});

const waitForServer = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not start at ${baseUrl}`);
};

let browser;

try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });

  // Seed point generation so the review image can be recreated exactly.
  await page.addInitScript(() => {
    let state = 0x84;
    Math.random = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 2 ** 32;
    };
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.locator('.algorithm-select').first().selectOption('two-edge-trees');
  await page.locator('input[type="number"]').fill('18');
  await page.getByRole('button', { name: 'New Points' }).click();
  await page.locator('input[type="range"]').evaluate((slider) => {
    slider.value = '50';
    slider.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.getByRole('button', { name: 'Start' }).click();
  await page.waitForFunction(
    () =>
      document.querySelector('.visualization .step-info')?.textContent?.includes(
        'Tour synthesis'
      ),
    undefined,
    { timeout: 20_000 }
  );

  await mkdir('docs/screenshots', { recursive: true });
  await page.locator('.visualization').first().screenshot({ path: outputPath });
  console.log(`Saved ${outputPath}`);
} finally {
  await browser?.close();
  try {
    process.kill(-server.pid, 'SIGKILL');
  } catch {
    server.kill('SIGKILL');
  }
}
