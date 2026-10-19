'use strict';
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:5000/api';

test.describe('vendor preview, wishlist and product sections', function () {
  let page;

  test.beforeEach(async function ({ browser }) {
    page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.setDefaultTimeout(10000);
  });

  test.afterEach(async function () {
    if (page) await page.close();
  });

  test('vendor preview shows demo data and never calls the API', async function () {
    const apiCalls = [];
    page.on('request', function (request) {
      if (request.url().indexOf('/api/') !== -1) apiCalls.push(request.url());
    });

    await page.goto(BASE_URL + '/vendor-preview', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('VENDOR UI PREVIEW')).toBeVisible();
    await expect(page.getByText(/Demo data only/i)).toBeVisible();

    // Demo store record and demo product rows.
    await expect(page.getByText('Demo Studio Samples').first()).toBeVisible();
    await expect(page.getByText('Demo Linen Oversized Shirt').first()).toBeVisible();

    // Statistics and the application status panel.
    await expect(page.getByRole('heading', { name: /vendor dashboard overview/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /application status/i })).toBeVisible();

    // The preview is public and read-only: no API request, no redirect.
    expect(apiCalls).toEqual([]);
    expect(new URL(page.url()).pathname).toBe('/vendor-preview');
  });

  test('vendor preview switches sections without entering the protected area', async function () {
    await page.goto(BASE_URL + '/vendor-preview', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    const nav = page.getByRole('navigation', { name: /vendor preview sections/i });

    await nav.getByRole('button', { name: 'Add product' }).click();

    await expect(page.getByRole('heading', { name: /^add product$/i })).toBeVisible();
    await expect(page.getByLabel(/product name/i)).toBeVisible();

    // Section switching is local state; the URL never becomes /vendor/*.
    expect(new URL(page.url()).pathname).toBe('/vendor-preview');

    await nav.getByRole('button', { name: 'Store profile' }).click();
    await expect(page.getByRole('heading', { name: /store profile/i })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/vendor-preview');
  });

  test('wishlist page asks a signed-out visitor to sign in', async function () {
    await page.goto(BASE_URL + '/wishlist', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /^your wishlist$/i })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /sign in to see your wishlist/i }),
    ).toBeVisible();
  });

  test('protected dashboards redirect a signed-out visitor to login', async function () {
    await page.goto(BASE_URL + '/admin', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login$/, { timeout: 15000 });

    await page.goto(BASE_URL + '/vendor', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login$/, { timeout: 15000 });

    await page.goto(BASE_URL + '/account', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login$/, { timeout: 15000 });
  });

  test('product page renders the new information section', async function () {
    // /products/:productId takes a real catalog id, so the test asks the API for
    // the first product instead of hard-coding one.
    const response = await page.request.get(API_URL + '/products?limit=1');
    const body = await response.json();
    const product = (body.data || [])[0];

    expect(product, 'the API returned at least one product').toBeTruthy();

    await page.goto(BASE_URL + '/products/' + product._id, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /product information/i }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: /^specifications$/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /size and fit/i })).toBeVisible();
  });

  test('product cards offer the wishlist button', async function () {
    await page.goto(BASE_URL + '/shop', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('button', { name: /to your wishlist/i }).first(),
    ).toBeVisible();
  });
});
