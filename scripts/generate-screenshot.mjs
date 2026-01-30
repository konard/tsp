/**
 * Generate a screenshot of the TSP Visual Solver UI.
 *
 * Uses browser-commander with Playwright to render the app
 * and capture a screenshot for README.md.
 *
 * Usage: bun run scripts/generate-screenshot.mjs
 */

/* global setTimeout */

import { launchBrowser } from 'browser-commander';
import { spawn, spawnSync } from 'child_process';
import { existsSync } from 'fs';

const PORT = process.env.PORT || 3002;
const BASE_URL = `http://localhost:${PORT}`;
const OUTPUT_PATH = process.env.SCREENSHOT_PATH || 'screenshot.png';

async function waitForServer(url, maxAttempts = 30, delayMs = 200) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(
    `Server did not start within ${(maxAttempts * delayMs) / 1000} seconds`
  );
}

function buildAppIfNeeded() {
  if (!existsSync('dist/main.js')) {
    console.log('Building application...');
    const result = spawnSync('bun', ['run', 'build'], {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    if (result.status !== 0) {
      throw new Error('Build failed');
    }
  }
}

async function main() {
  let serverProcess;
  let browser;

  try {
    buildAppIfNeeded();

    // Start server
    serverProcess = spawn('bun', ['serve.js'], {
      env: { ...process.env, PORT: String(PORT) },
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: process.cwd(),
      detached: true,
    });

    serverProcess.stdout.on('data', () => {});
    serverProcess.stderr.on('data', () => {});

    await waitForServer(BASE_URL);
    console.log('Server started on', BASE_URL);

    // Launch browser
    const result = await launchBrowser({
      engine: 'playwright',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    browser = result.browser;
    const page = result.page;

    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1200, height: 800 });

    // Navigate and wait for app to render
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('.visualization-container', { timeout: 10000 });

    // Click Start and wait for algorithm animation to complete partially
    await page.click('button:has-text("Start")');
    await new Promise((r) => setTimeout(r, 3000));

    // Take screenshot
    await page.screenshot({ path: OUTPUT_PATH, fullPage: false });
    console.log(`Screenshot saved to ${OUTPUT_PATH}`);
  } finally {
    if (browser) {
      await browser.close();
    }
    if (serverProcess) {
      try {
        process.kill(-serverProcess.pid, 'SIGKILL');
      } catch {
        try {
          serverProcess.kill('SIGKILL');
        } catch {
          // Ignore
        }
      }
    }
  }
}

main().catch((err) => {
  console.error('Screenshot generation failed:', err);
  process.exit(1);
});
