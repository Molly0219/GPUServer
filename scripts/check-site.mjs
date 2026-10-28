import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from './serve.mjs';
import { gpuEntries } from '../site/gpu-matrix.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', 'product.html', 'solution.html', 'service.html', 'about.html', 'benchmarks.html', 'gpu-matrix.html', 'contact.html', '404.html'];
const server = createServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
let checks = 0;
const passed = message => { checks++; console.log(`PASS ${message}`); };

try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const externalRequests = new Set();
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) { externalRequests.add(url.origin); return route.abort(); }
    return route.continue();
  });
  for (const width of [1440, 390, 320]) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height: width > 700 ? 1000 : 844 });
    for (const filename of pages) {
      const errors = [], failures = [];
      const onError = e => errors.push(e.message);
      const onResponse = r => { if (r.status() >= 400) failures.push(r.url()); };
      page.on('pageerror', onError);
      page.on('response', onResponse);
      await page.goto(`${origin}/${filename}`, { waitUntil: 'networkidle' });
      assert.deepEqual(errors, [], `${filename}: script errors`);
      assert.deepEqual(failures, [], `${filename}: missing resources`);
      assert.equal(await page.locator('main h1').count(), 1, `${filename}: one page heading`);
      const metrics = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
      assert.ok(metrics.scroll <= metrics.width + 1, `${filename} overflows at ${width}px: ${JSON.stringify(metrics)}`);
      const broken = await page.locator('img').evaluateAll(images => images.filter(img => img.complete && !img.naturalWidth).map(img => img.src));
      assert.deepEqual(broken, [], `${filename}: broken images`);
      if (width === 1440) {
        const links = await page.locator('a[href]').evaluateAll(anchors => anchors.map(a => ({ href: a.getAttribute('href'), url: a.href })));
        for (const link of links) {
          assert.notEqual(link.href, '#', `${filename}: placeholder link`);
          if (!link.url.startsWith(origin)) continue;
          const url = new URL(link.url);
          const target = path.join(root, decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
          assert.ok(fs.existsSync(target), `${filename}: missing link ${link.href}`);
          if (url.hash && (url.pathname === `/${filename}` || link.href.startsWith('#'))) {
            assert.equal(await page.locator(`[id="${decodeURIComponent(url.hash.slice(1))}"]`).count(), 1, `${filename}: missing anchor ${url.hash}`);
          }
        }
      }
      page.off('pageerror', onError);
      page.off('response', onResponse);
    }
    passed(`All ${pages.length} pages at ${width}px: resources, headings, links and overflow`);
    await page.close();
  }
  assert.deepEqual([...externalRequests], [], 'Pages should not depend on third-party scripts, fonts or image requests');
  passed('All page resources are self-hosted');

  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(`${origin}/index.html`);
  const menu = mobile.locator('.menu-toggle');
  await menu.click();
  assert.equal(await menu.getAttribute('aria-expanded'), 'true');
  await mobile.keyboard.press('Tab');
  assert.equal(await mobile.evaluate(() => document.activeElement.textContent.trim()), 'Home');
  await mobile.keyboard.press('Shift+Tab');
  await mobile.keyboard.press('Shift+Tab');
  assert.match(await mobile.evaluate(() => document.activeElement.textContent), /Let’s talk/);
  await mobile.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  assert.equal(await menu.evaluate(el => document.activeElement === el), true);
  await menu.click();
  await mobile.locator('#main-nav').getByRole('link', { name: 'Servers', exact: true }).click();
  assert.ok(mobile.url().endsWith('/product.html'));
  passed('Mobile navigation, keyboard focus, Escape and page navigation');

  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}/product.html?gpu=H100&brand=Dell`);
  assert.equal(await page.locator('[data-product]:visible').count(), 1);
  assert.equal(await page.locator('#gpu-filter').inputValue(), 'H100');
  assert.match(await page.locator('[data-product]:visible').innerText(), /80 GB HBM3/);
  await page.getByRole('button', { name: 'HPE', exact: true }).click();
  assert.equal(await page.locator('[data-product]:visible h2').textContent(), 'Cray XD670');
  await page.selectOption('#gpu-filter', 'H200');
  assert.match(await page.locator('[data-product]:visible').innerText(), /141 GB HBM3e/);
  assert.ok(page.url().includes('gpu=H200'));
  await page.locator('[data-product]:visible summary').click();
  assert.equal(await page.locator('[data-product]:visible details').getAttribute('open'), '');
  await page.locator('[data-product]:visible [data-quote-link]').click();
  assert.equal(await page.locator('#inquiry-product').inputValue(), 'hpe-cray-xd670');
  assert.equal(await page.locator('#inquiry-gpu').inputValue(), 'H200');
  passed('Brand / GPU selection, detail expansion, shareable URL and quote prefill');

  await page.getByRole('button', { name: 'Prepare inquiry' }).click();
  assert.equal(await page.locator('#inquiry-result').isVisible(), false, 'Empty inquiry must not be prepared');
  await page.getByLabel('Your name *', { exact: true }).fill('A & B <test>');
  await page.getByLabel('Work email *', { exact: true }).fill('test@example.com');
  await page.getByLabel('Company', { exact: true }).fill('Example Research');
  await page.getByLabel('Number of systems').fill('2');
  await page.getByLabel('Your requirements *', { exact: true }).fill('Train models & compare storage.\nDelivery to our lab.');
  const requests = [];
  page.on('request', request => requests.push(request.method()));
  await page.getByRole('button', { name: 'Prepare inquiry' }).click();
  assert.equal(await page.locator('#inquiry-result').isVisible(), true);
  const mailto = new URL(await page.locator('#email-inquiry').getAttribute('href'));
  assert.equal(mailto.protocol, 'mailto:');
  assert.equal(mailto.pathname, 'cindy@ateamdata.com');
  assert.match(mailto.searchParams.get('body'), /Name: A & B <test>/);
  assert.match(mailto.searchParams.get('body'), /HPE Cray XD670/);
  assert.match(mailto.searchParams.get('body'), /NVIDIA H200 SXM/);
  assert.match(mailto.searchParams.get('body'), /Number of systems: 2/);
  assert.ok((await page.locator('#inquiry-result').textContent()).includes('has not been sent'));
  assert.equal(requests.includes('POST'), false);
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }));
  await page.getByRole('button', { name: 'Copy inquiry' }).click();
  assert.match(await page.locator('#copy-status').textContent(), /Select and copy/);
  assert.equal(await page.locator('#inquiry-preview').evaluate(el => el.selectionEnd - el.selectionStart), (await page.locator('#inquiry-preview').inputValue()).length);
  await page.getByLabel('Number of systems').fill('3');
  assert.equal(await page.locator('#inquiry-result').isVisible(), false, 'Editing invalidates the prepared inquiry');
  passed('Inquiry validation, safe email encoding, no submission, copy fallback and edited draft invalidation');

  await page.goto(`${origin}/contact.html?product=%3Cscript%3E&gpu=__proto__&workload=__proto__`);
  assert.equal(await page.locator('#inquiry-product').inputValue(), 'unsure');
  assert.equal(await page.locator('#inquiry-gpu').inputValue(), 'unsure');
  assert.equal(await page.locator('#inquiry-requirements').inputValue(), '');
  passed('Unknown URL parameters fall back safely');

  await page.goto(`${origin}/gpu-matrix.html`);
  assert.equal(await page.locator('[data-entry]:visible').count(), gpuEntries.length);
  await page.locator('#matrix-search').fill('h200');
  await page.waitForFunction(() => document.getElementById('matrix-count').textContent.startsWith('4 entries'));
  assert.equal(await page.locator('[data-entry]:visible').count(), 4, 'Substring search also finds GH200');
  await page.locator('#matrix-format').selectOption('pcie');
  assert.equal(await page.locator('[data-entry]:visible').count(), 1);
  assert.equal(await page.locator('thead [data-format]:visible').count(), 1);
  await page.locator('[data-entry="h200-nvl"] summary').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('[data-entry="h200-nvl"]').getAttribute('open'), '');
  assert.match(await page.locator('[data-entry="h200-nvl"] .matrix-detail').textContent(), /PCIe variant/);
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#matrix-export').click();
  const download = await downloadEvent;
  assert.equal(download.suggestedFilename(), 'ateamdata-nvidia-gpu-matrix.csv');
  const csv = fs.readFileSync(await download.path(), 'utf8');
  assert.ok(csv.startsWith('\uFEFF'));
  assert.match(csv, /"Hopper","PCIe cards","H200 NVL"/);
  assert.match(csv, /https:\/\/www.nvidia.com\/en-us\/data-center\/h200\//);
  assert.equal(csv.trim().split('\r\n').length, 2, 'Export contains the header and the single filtered entry');
  await page.reload();
  assert.equal(await page.locator('#matrix-search').inputValue(), 'h200');
  assert.equal(await page.locator('#matrix-format').inputValue(), 'pcie');
  assert.equal(await page.locator('[data-entry]:visible').count(), 1);
  await page.locator('#matrix-generation').selectOption('volta');
  assert.equal(await page.locator('#matrix-empty').isVisible(), true);
  assert.equal(await page.locator('#matrix-export').isDisabled(), true);
  await page.locator('#matrix-clear').click();
  assert.equal(await page.locator('[data-entry]:visible').count(), gpuEntries.length);
  assert.equal(new URL(page.url()).search, '');
  await page.locator('#matrix-generation').selectOption('blackwell-ultra');
  assert.equal(await page.locator('[data-entry]:visible').count(), 4);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.locator('#matrix-search').fill('nvl72');
  await page.waitForFunction(() => document.getElementById('matrix-count').textContent.startsWith('3 entries'));
  assert.equal(await page.locator('[data-entry="h100-nvl"]').isVisible(), false);
  await page.goto(`${origin}/gpu-matrix.html?generation=__proto__&format=unknown&q=%3Cscript%3E`);
  assert.equal(await page.locator('#matrix-generation').inputValue(), 'all');
  assert.equal(await page.locator('#matrix-format').inputValue(), 'all');
  assert.equal(await page.locator('#matrix-empty').isVisible(), true);
  passed('GPU matrix: combined search/filters, keyboard details, filtered CSV, URL restore, empty/reset and invalid parameters');

  for (const width of [1440, 1024, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${origin}/gpu-matrix.html`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    const geometry = await page.locator('#matrix-scroll').evaluate(el => ({ client: el.clientWidth, scroll: el.scrollWidth }));
    if (width < 1200) assert.ok(geometry.scroll > geometry.client, 'The matrix scrolls inside its own region');
    await page.locator('#matrix-format').selectOption('sxm');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  }
  passed('GPU matrix: contained horizontal scrolling and single-format view on desktop, tablet and phones');

  // Verify relative assets and navigation when the same files are served under
  // a GitHub project path. No publishing-source change is necessary.
  await page.route('**/existing-project/**', async route => {
    const url = new URL(route.request().url());
    url.pathname = url.pathname.replace('/existing-project', '');
    const response = await route.fetch({ url: url.href });
    await route.fulfill({ response });
  });
  await page.goto(`${origin}/existing-project/product.html?gpu=H100`);
  assert.equal(await page.locator('[data-product]').count(), 3);
  assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(251, 252, 249)');
  await page.locator('[data-quote-link]').first().click();
  assert.ok(page.url().includes('/existing-project/contact.html'));
  assert.equal(await page.locator('#inquiry-gpu').inputValue(), 'H100');
  await page.goto(`${origin}/existing-project/gpu-matrix.html?generation=hopper&format=sxm`);
  assert.equal(await page.locator('[data-entry]:visible').count(), 2);
  assert.equal(await page.locator('#matrix-controls').isVisible(), true);
  assert.equal(await page.locator('.gpu-matrix').evaluate(el => getComputedStyle(el).borderCollapse), 'separate');
  passed('Static files also work under an existing project path');

  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const staticPage = await noJS.newPage();
  await staticPage.goto(`${origin}/product.html`);
  assert.equal(await staticPage.locator('[data-product]').count(), 3);
  assert.equal(await staticPage.locator('#main-nav').getByRole('link', { name: 'Servers', exact: true }).isVisible(), true);
  await staticPage.goto(`${origin}/contact.html`);
  assert.equal(await staticPage.locator('.contact-email').isVisible(), true);
  await staticPage.goto(`${origin}/gpu-matrix.html`);
  assert.equal(await staticPage.locator('[data-entry]').count(), gpuEntries.length);
  assert.equal(await staticPage.locator('#matrix-controls').isVisible(), false);
  assert.equal(await staticPage.locator('#matrix-export').isVisible(), false);
  await staticPage.locator('[data-entry="hgx-rubin"] summary').click();
  assert.equal(await staticPage.locator('[data-entry="hgx-rubin"] .matrix-detail').isVisible(), true);
  passed('Static content, navigation and direct contact remain usable without JavaScript');

  assert.equal(fs.readFileSync(path.join(root,'CNAME'),'utf8').trim(), 'ateamdata.com');
  assert.equal(fs.readFileSync(path.join(root,'docs/CNAME'),'utf8').trim(), 'ateamdata.com');
  assert.equal(fs.existsSync(path.join(root,'.github/workflows')), false, 'No new deployment workflow');
  passed('Existing domain files retained; no new deployment workflow');
  console.log(`\n${checks} verification groups passed. No email was sent.`);
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
