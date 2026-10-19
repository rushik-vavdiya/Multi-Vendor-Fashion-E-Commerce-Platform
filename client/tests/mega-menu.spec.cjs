'use strict';
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

const CATEGORIES = {
  success: true,
  message: 'stubbed',
  data: [
    {
      _id: '68f100000000000000000001',
      name: 'Kurti 1 Piece',
      slug: 'kurti-1-piece',
      parentCategoryId: null,
      level: 0,
      status: 'active',
    },
    {
      _id: '68f100000000000000000002',
      name: 'Kurti 2 Piece Set',
      slug: 'kurti-2-piece-set',
      parentCategoryId: null,
      level: 0,
      status: 'active',
    },
    {
      _id: '68f100000000000000000003',
      name: 'Kurti 3 Piece Set',
      slug: 'kurti-3-piece-set',
      parentCategoryId: null,
      level: 0,
      status: 'active',
    },
    {
      _id: '68f100000000000000000004',
      name: 'Co-ord Set',
      slug: 'coord-set',
      parentCategoryId: null,
      level: 0,
      status: 'active',
    },
  ],
};

test.describe('simple storefront navigation', function () {
  test('desktop navigation links directly to departments without opening a panel', async function ({
    page,
  }) {
    await page.route('**/api/categories*', function (route) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(CATEGORIES),
      });
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded' });

    const kurtis = page.getByRole('link', { name: '1 Piece', exact: true }).first();
    await expect(kurtis).toHaveAttribute('href', '/shop?category=1-piece');
    await expect(kurtis).not.toHaveAttribute('aria-haspopup');
    await kurtis.hover();
    await expect(page.locator('header [aria-label="1 Piece menu"]')).toHaveCount(0);

    await kurtis.click();
    await expect(page).toHaveURL(/\/shop\?category=1-piece/);
  });

  test('mobile menu shows plain links without expandable department panels', async function ({
    page,
  }) {
    await page.route('**/api/categories*', function (route) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(CATEGORIES),
      });
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Open menu' }).click();

    const menu = page.locator('header nav[aria-label="Mobile navigation"]');
    const kurtis = menu.getByRole('link', { name: '1 Piece', exact: true });
    await expect(kurtis).toHaveAttribute('href', '/shop?category=1-piece');
    await expect(menu.getByRole('button')).toHaveCount(0);

    await kurtis.click();
    await expect(page).toHaveURL(/\/shop\?category=1-piece/);
    await expect(menu).toHaveCount(0);
  });
});
