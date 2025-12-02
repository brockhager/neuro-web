import { test, expect } from '@playwright/test';

const PAGE_URL = 'http://localhost:3005/control-center';

test.describe('Control Center RBAC for JobTracking and Validator dashboards', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('/api/auth/token-swap', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'short-test-123', expiresInSec: 300 }) });
    });
    await page.goto(PAGE_URL);
  });

  test('Job Tracking: accessible to User and denied if role changes', async ({ page }) => {
    // Switch to User role
    await page.selectOption('select[title="Select your current user role"]', 'User');

    // Click Job Tracking module
    await page.getByRole('button', { name: 'Job Tracking Dashboard' }).click();
    await expect(page.getByText('Job Tracking Dashboard')).toBeVisible();

    // Now change role to Validator (should restrict access)
    await page.selectOption('select[title="Select your current user role"]', 'Validator');
    await expect(page.getByText('Access Restricted')).toBeVisible();
  });

  test('Validator Dashboard: accessible only to Validator', async ({ page }) => {
    // Start as Admin first
    await page.selectOption('select[title="Select your current user role"]', 'Admin');

    // Validator module should be disabled for Admin (since Admin passes through isModuleAccessible but not the required Role)
    const validatorBtn = page.getByRole('button', { name: 'Validator Dashboard' });
    // Admin can access everything per design, but for Validator content we specifically require Validator role to display
    await expect(validatorBtn).toBeEnabled();
    await validatorBtn.click();

    // Should be blocked because Admin is not Validator for content access
    await expect(page.getByText('Access Restricted')).toBeVisible();

    // Switch role to Validator and try again
    await page.selectOption('select[title="Select your current user role"]', 'Validator');
    await page.getByRole('button', { name: 'Validator Dashboard' }).click();
    await expect(page.getByText('Validator Dashboard')).toBeVisible();
  });

});
