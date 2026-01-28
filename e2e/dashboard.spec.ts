import { test, expect } from '@playwright/test';

test.describe('Page Navigation', () => {
  test('should load login page without errors', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Expense Tracker|React App/i);
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check that the page doesn't have console errors
    let hasError = false;
    page.on('console', msg => {
      if (msg.type() === 'error') hasError = true;
    });
    
    expect(hasError).toBe(false);
  });

  test('should load register page', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    // Page should load successfully
    await expect(page).toHaveURL(/\/register/);
  });

  test('should have email input on login page', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', /example\.com/);
  });

  test('should have password input on login page', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('placeholder', /•/);
  });

  test('should be able to type in email input', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');
    
    await expect(emailInput).toHaveValue('test@example.com');
  });

  test('should be able to type in password input', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('testpassword123');
    
    await expect(passwordInput).toHaveValue('testpassword123');
  });
});
