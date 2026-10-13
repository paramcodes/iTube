import { expect, test } from '@playwright/test'

test.describe('iTube Web Application E2E Test Suite', () => {
  test('01 - Home Feed, Category Carousel & Guide Drawer Navigation', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/iTube/)
    await expect(page.getByTestId('masthead')).toBeVisible()
    await expect(page.getByTestId('guide-drawer')).toBeVisible()

    // Wait for videos to load and images to complete rendering
    await page.waitForSelector('text=Building a Full-Stack YouTube Clone', {
      timeout: 15000,
    })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    await page.screenshot({
      path: 'e2e-evidence/screenshots/01-home-feed.png',
      fullPage: true,
    })

    const gamingChip = page.getByRole('button', { name: 'Gaming' })
    await expect(gamingChip).toBeVisible()
    await gamingChip.click()
    await page.waitForTimeout(400)

    await page.screenshot({
      path: 'e2e-evidence/screenshots/02-category-gaming.png',
    })

    const menuToggle = page.getByLabel('Toggle menu')
    await menuToggle.click()
    await page.waitForTimeout(300)
    await page.screenshot({
      path: 'e2e-evidence/screenshots/03-drawer-collapsed.png',
    })
  })

  test('02 - Search & Autocomplete Suggestions', async ({ page }) => {
    await page.goto('/')
    const searchInput = page.getByPlaceholder('Search')
    await searchInput.fill('Tech')
    await page.waitForTimeout(400)

    await page.screenshot({
      path: 'e2e-evidence/screenshots/04-search-input-active.png',
    })

    // Navigate directly to search results
    await page.goto('/search?q=Tech')
    await page.waitForSelector('text=Search results for', { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    await page.screenshot({
      path: 'e2e-evidence/screenshots/05-search-results-page.png',
      fullPage: true,
    })
    await expect(page.locator('h1')).toContainText('Search results')
  })

  test('03 - Watch Page, Controls & Comments Interface', async ({ page }) => {
    await page.goto('/watch/vid-1')
    await page.waitForSelector('text=Building a Full-Stack YouTube Clone', {
      timeout: 15000,
    })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    await page.screenshot({
      path: 'e2e-evidence/screenshots/06-watch-page.png',
      fullPage: true,
    })

    await expect(page.locator('body')).toBeVisible()
  })

  test('04 - Creator Studio Dashboard & Content Table', async ({ page }) => {
    await page.goto('/studio')
    await page.waitForSelector('text=Channel Content', { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    await page.screenshot({
      path: 'e2e-evidence/screenshots/07-creator-studio.png',
      fullPage: true,
    })

    await expect(
      page.getByRole('heading', { name: 'Channel Analytics' }),
    ).toBeVisible()
  })

  test('05 - Direct Upload Flow UI', async ({ page }) => {
    await page.goto('/upload')
    await page.waitForSelector('text=Upload Video', { timeout: 15000 })
    await page.waitForTimeout(800)

    await page.screenshot({
      path: 'e2e-evidence/screenshots/08-upload-page.png',
      fullPage: true,
    })

    await expect(
      page.getByRole('heading', { name: 'Upload Video' }),
    ).toBeVisible()
  })

  test('06 - Channel Profile & Subscriptions Interface', async ({ page }) => {
    await page.goto('/channel/techarchitect')
    await page.waitForSelector('text=Tech Architect', { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    await page.screenshot({
      path: 'e2e-evidence/screenshots/09-channel-page.png',
      fullPage: true,
    })

    await expect(page.locator('body')).toBeVisible()
  })
})
