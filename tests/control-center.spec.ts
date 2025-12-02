import { test, expect } from '@playwright/test';

const PAGE_URL = 'http://localhost:3000/control-center';

test.describe('NeuroSwarm Ops Hub - RBAC & Integration', () => {

    test.beforeEach(async ({ page }) => {
        // Mock the metrics API to return consistent data
        await page.route('/api/metrics', async route => {
            const headers = route.request().headers();
            if (headers['x-admin-metrics-token'] === 'test-admin-token') {
                await route.fulfill({
                    status: 200,
                    contentType: 'text/plain',
                    body: `
# HELP router_refund_retries_total Total refund retries
# TYPE router_refund_retries_total counter
router_refund_retries_total 42
# HELP router_refund_alerts_total Total critical alerts
# TYPE router_refund_alerts_total counter
router_refund_alerts_total 0
          `
                });
            } else {
                await route.fulfill({ status: 401, body: 'Unauthorized' });
            }
        });

        await page.goto(PAGE_URL);
    });

    test('Default View: Loads as User role', async ({ page }) => {
        await expect(page.getByText('NeuroSwarm Operations Hub')).toBeVisible();
        // Verify "User" role is active by default (based on button style)
        const userRoleBtn = page.getByRole('button', { name: 'User' }).first();
        await expect(userRoleBtn).toHaveClass(/bg-indigo-600/);
    });

    test('Client-Side Guard: Admin module is disabled for User', async ({ page }) => {
        // Ensure we are User
        await page.getByRole('button', { name: 'User' }).first().click();

        // Find the Admin module button
        const adminModuleBtn = page.getByRole('button', { name: 'Admin & Reconciliation Ops' });

        // Should be disabled
        await expect(adminModuleBtn).toBeDisabled();
    });

    test('Admin Flow: Can access Admin module and view metrics', async ({ page }) => {
        // Switch to Admin role
        await page.getByRole('button', { name: 'Admin' }).first().click();

        // Click Admin module
        const adminModuleBtn = page.getByRole('button', { name: 'Admin & Reconciliation Ops' });
        await expect(adminModuleBtn).toBeEnabled();
        await adminModuleBtn.click();

        // Verify Admin View loaded
        await expect(page.getByText('Admin & Reconciliation Ops')).toBeVisible();

        // Verify Metrics Loaded (Mocked value 42)
        // The component displays the value in a specific element
        await expect(page.getByText('42')).toBeVisible();
        await expect(page.getByText('Total Refund Retries')).toBeVisible();
    });

    test('Forbidden Path: Switching to User while in Admin view triggers restriction', async ({ page }) => {
        // 1. Enter as Admin
        await page.getByRole('button', { name: 'Admin' }).first().click();
        await page.getByRole('button', { name: 'Admin & Reconciliation Ops' }).click();
        await expect(page.getByText('Admin & Reconciliation Ops')).toBeVisible();

        // 2. Switch role to User via Navbar
        await page.getByRole('button', { name: 'User' }).first().click();

        // 3. Verify Access Restricted message appears
        await expect(page.getByText('Access Restricted')).toBeVisible();
        await expect(page.getByText('You do not have sufficient privileges')).toBeVisible();

        // 4. Verify Metrics are GONE
        await expect(page.getByText('Total Refund Retries')).not.toBeVisible();
    });

});
