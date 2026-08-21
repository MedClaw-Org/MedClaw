#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

function safeName(value) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '');
}

function readManifest(manifestPath) {
  const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  if (!parsed.baseURL || !Array.isArray(parsed.scenarios)) {
    throw new Error('Manifest requires baseURL and scenarios[]');
  }
  if (parsed.scenarios.length === 0) {
    throw new Error('Manifest must contain at least one scenario');
  }
  const ids = new Set();
  for (const scenario of parsed.scenarios) {
    if (!scenario.id || !scenario.path) {
      throw new Error('Every scenario requires id and path');
    }
    if (ids.has(scenario.id))
      throw new Error(`Duplicate scenario: ${scenario.id}`);
    ids.add(scenario.id);
  }
  return parsed;
}

async function performAction(page, action) {
  const locator = action.selector ? page.locator(action.selector) : null;
  switch (action.type) {
    case 'click':
      await locator.click();
      break;
    case 'fill':
      await locator.fill(action.value ?? '');
      break;
    case 'press':
      await locator.press(action.key);
      break;
    case 'check':
      await locator.check();
      break;
    case 'select':
      await locator.selectOption(action.value);
      break;
    case 'waitFor':
      await locator.waitFor({ state: action.state ?? 'visible' });
      break;
    case 'wait':
      await page.waitForTimeout(action.ms ?? 100);
      break;
    default:
      throw new Error(`Unsupported action type: ${action.type}`);
  }
}

async function warmLongPage(page) {
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const step = Math.max(300, Math.floor(window.innerHeight * 0.8));
    let previousHeight = 0;
    for (let pass = 0; pass < 3; pass += 1) {
      const height = document.documentElement.scrollHeight;
      for (let y = 0; y < height; y += step) {
        window.scrollTo(0, y);
        await delay(50);
      }
      if (height === previousHeight) break;
      previousHeight = height;
    }
    window.scrollTo(0, 0);
  });
}

async function captureSegments(page, outputDir, viewportHeight, masks) {
  const pageHeight = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  const step = Math.max(1, Math.floor(viewportHeight * 0.9));
  const files = [];
  let part = 1;
  for (let y = 0; y < pageHeight; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(50);
    const file = path.join(
      outputDir,
      `part-${String(part).padStart(3, '0')}.png`,
    );
    await page.screenshot({
      path: file,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      mask: masks,
    });
    files.push(file);
    part += 1;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  return files;
}

const manifestPath = path.resolve(
  argument('--manifest', 'qa/screenshots.example.json'),
);
const manifest = readManifest(manifestPath);
const baseURL = argument('--base-url', manifest.baseURL);
if (process.argv.includes('--validate')) {
  console.log(
    `Valid screenshot manifest: ${manifest.scenarios.length} scenarios`,
  );
  process.exit(0);
}

const { chromium } = await import('playwright');
const manifestDir = path.dirname(manifestPath);
const outputRoot = path.resolve(
  argument(
    '--output-dir',
    path.resolve(manifestDir, manifest.outputDir ?? '../artifacts/screenshots'),
  ),
);
const viewports = manifest.viewports ?? [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];
const browser = await chromium.launch({ headless: true });
const report = [];

try {
  for (const viewport of viewports) {
    const storageState = manifest.storageState
      ? path.resolve(manifestDir, manifest.storageState)
      : undefined;

    for (const scenario of manifest.scenarios) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        storageState,
        locale: manifest.locale ?? 'en-US',
        timezoneId: manifest.timezoneId ?? 'UTC',
        colorScheme: viewport.colorScheme ?? 'light',
      });
      const page = await context.newPage();
      for (const mock of scenario.mocks ?? []) {
        await page.route(mock.url, async (route) => {
          const body = mock.fixture
            ? fs.readFileSync(path.resolve(manifestDir, mock.fixture), 'utf-8')
            : JSON.stringify(mock.json ?? {});
          await route.fulfill({
            status: mock.status ?? 200,
            contentType: mock.contentType ?? 'application/json',
            body,
          });
        });
      }
      if (scenario.fixedTime) {
        await page.clock.install({ time: new Date(scenario.fixedTime) });
      }
      await page.goto(new URL(scenario.path, baseURL).toString(), {
        waitUntil: scenario.waitUntil ?? 'networkidle',
      });
      for (const action of scenario.actions ?? [])
        await performAction(page, action);
      if (scenario.readySelector) {
        await page
          .locator(scenario.readySelector)
          .waitFor({ state: 'visible' });
      }
      await page.evaluate(() => document.fonts.ready);
      await warmLongPage(page);

      const scenarioDir = path.join(
        outputRoot,
        safeName(scenario.id),
        safeName(viewport.name),
      );
      fs.mkdirSync(scenarioDir, { recursive: true });
      const masks = (scenario.maskSelectors ?? []).map((selector) =>
        page.locator(selector),
      );
      const fullPath = path.join(scenarioDir, 'full.png');
      await page.screenshot({
        path: fullPath,
        fullPage: true,
        animations: 'disabled',
        caret: 'hide',
        scale: 'css',
        mask: masks,
      });
      const segmentPaths = scenario.captureSegments
        ? await captureSegments(page, scenarioDir, viewport.height, masks)
        : [];
      report.push({
        scenario: scenario.id,
        viewport: viewport.name,
        url: page.url(),
        fullPage: fullPath,
        segments: segmentPaths,
      });
      await page.close();
      await context.close();
    }
  }
} finally {
  await browser.close();
}

fs.mkdirSync(outputRoot, { recursive: true });
fs.writeFileSync(
  path.join(outputRoot, 'manifest.json'),
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(
  `Captured ${report.length} scenario/viewport combinations in ${outputRoot}`,
);
