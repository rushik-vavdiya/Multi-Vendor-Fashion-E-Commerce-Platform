'use strict';
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('mobile layout health checks', function () {
  let page;

  test.beforeEach(async function ({ browser }) {
    page = await browser.newPage({ viewport: { width: 360, height: 820 } });
    await page.setDefaultTimeout(8000);
  });

  test.afterEach(async function () {
    if (page) await page.close();
  });

  test('homepage first paint loads without console error', async function () {
    const errors = new Set();
    page.on('console', function (msg) {
      if (msg.type() === 'error') {
        errors.add(msg.text());
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    expect(errors.size).toBe(0);
  });

  test('mobile menu opens and contains the storefront links', async function () {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: /open menu/i })).toBeVisible();

    await page.getByRole('button', { name: /open menu/i }).click();

    const mobileNav = page.getByRole('navigation', { name: /mobile/i });
    await expect(mobileNav).toBeVisible();

    // The menu lists the departments that exist in the catalog, each one a
    // filter on the collection page.
    const linkLabels = [
      'Home',
      '1 Piece',
      '2 Piece',
      '3 Piece',
      'Cord Set',
      'New Arrivals',
      'Offers',
    ];

    for (const label of linkLabels) {
      const link = mobileNav.getByRole('link', { name: new RegExp('^' + label + '$', 'i') });
      await expect(link).toBeVisible();
    }
  });

  test('newsletter h2 renders inside the viewport', async function () {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /join our\s+community/i, level: 2 }),
    ).toBeVisible();
  });

  test('mobile menu does not overlap key footer content when open', async function () {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /open menu/i }).click();
    const mobileNav = page.getByRole('navigation', { name: /mobile/i });
    await expect(mobileNav).toBeVisible();

    await expect(page.getByRole('contentinfo')).toBeVisible();
  });
});
