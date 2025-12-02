import { test, expect } from '@playwright/test';

const PAGE_URL = 'http://localhost:3005/control-center';

test.describe('Job Tracking Flow (User role)', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('/api/auth/token-swap', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'short-test-123', expiresInSec: 300 }) });
    });
    await page.route('/api/firestore/pending-jobs', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [ { id: 'job-1', prompt: 'Test prompt', model: 'gpt-4', user_wallet: 'demo-wallet-1', received_at: new Date().toISOString(), status: 'pending' } ] })
      });
    });

    await page.route('/api/router/submit-job', async route => {
      const req = await route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'queued', job_id: 'job-new-123' }) });
    });

    await page.goto(PAGE_URL);
  });

  test('User can submit a job and view pending jobs', async ({ page }) => {
    // Select User
    await page.selectOption('select[title="Select your current user role"]', 'User');

    // Open Job Tracking
    await page.getByRole('button', { name: 'Job Tracking Dashboard' }).click();

    await expect(page.getByText('Job Tracking Dashboard')).toBeVisible();

    // Fill form fields
    await page.fill('input[placeholder="Job name"]', 'Test Job from E2E');
    await page.fill('input[placeholder="Model (e.g. gpt-4)"]', 'gpt-4');
    await page.fill('textarea[placeholder^="Write the prompt for your decentralized job"]', 'Please summarize NeuroSwarm');

    // Click submit
    await page.click('text=Submit Decentralized Job');

    // Expect a success message (queued)
    await expect(page.locator('text=Job submitted')).toBeVisible();

    // Pending jobs list should show the mocked job
    await expect(page.getByText('Test prompt')).toBeVisible();
  });

});
