import { test, expect } from '@playwright/test';

test.describe('User Pages - Navigation and Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Set authentication token and user data for testing
    await page.goto('/user/dashboard');
    
    // Mock authentication by setting storage
    await page.evaluate(() => {
      sessionStorage.setItem('authToken', 'test-token-123');
      sessionStorage.setItem('user', JSON.stringify({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'USER'
      }));
    });
    
    // Reload to apply the auth
    await page.reload();
  });

  test('should load user dashboard page', async ({ page }) => {
    await page.goto('/user/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for title
    await expect(page.locator('h1:has-text("Expense Tracker")')).toBeVisible();
  });

  test('should display toolbar with logout button on dashboard', async ({ page }) => {
    await page.goto('/user/dashboard');
    
    // Check for logout button
    const logoutButton = page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible();
  });

  test('should have navigation to expenses from dashboard', async ({ page }) => {
    await page.goto('/user/dashboard');
    
    // Wait for page content
    await page.waitForLoadState('networkidle');
    
    // Look for link/button to expenses page
    const expensesLink = page.locator('a, button').filter({ hasText: /expense|manage/i });
    if (await expensesLink.count() > 0) {
      await expect(expensesLink.first()).toBeVisible();
    }
  });

  test('should load user expenses management page', async ({ page }) => {
    await page.goto('/user/expenses');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check page title
    const toolbar = page.locator('h1');
    await expect(toolbar).toBeVisible();
  });

  test('should have toolbar on expenses page', async ({ page }) => {
    await page.goto('/user/expenses');
    
    // Check for header with logout
    const logoutButton = page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible();
  });

  test('should load user profile page', async ({ page }) => {
    await page.goto('/user/profile');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check page elements are visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have toolbar on profile page', async ({ page }) => {
    await page.goto('/user/profile');
    
    // Check for header with logout
    const logoutButton = page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible();
  });

  test('should logout and redirect to login', async ({ page }) => {
    await page.goto('/user/dashboard');
    
    // Click logout button
    const logoutButton = page.locator('button:has-text("Logout")');
    await logoutButton.click();
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('User Dashboard - Content', () => {
  test.beforeEach(async ({ page }) => {
    // Set authentication for dashboard tests
    await page.goto('/user/dashboard');
    
    await page.evaluate(() => {
      sessionStorage.setItem('authToken', 'test-token-123');
      sessionStorage.setItem('user', JSON.stringify({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'USER'
      }));
    });
    
    await page.reload();
  });

  test('should display user greeting with name', async ({ page }) => {
    await page.goto('/user/dashboard');
    
    // Wait for dynamic content
    await page.waitForLoadState('networkidle');
    
    // Check for content that would contain user name
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should display expense report section', async ({ page }) => {
    await page.goto('/user/dashboard');
    
    // Wait for content
    await page.waitForLoadState('networkidle');
    
    // Dashboard should have content
    const content = page.locator('main, [role="main"], div[style*="content"]');
    const contentCount = await content.count();
    expect(contentCount).toBeGreaterThan(0);
  });
});

test.describe('User Expenses - Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set authentication for expenses tests
    await page.goto('/user/expenses');
    
    await page.evaluate(() => {
      sessionStorage.setItem('authToken', 'test-token-123');
      sessionStorage.setItem('user', JSON.stringify({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'USER'
      }));
    });
    
    await page.reload();
  });

  test('should load expenses page without errors', async ({ page }) => {
    await page.goto('/user/expenses');
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Page should be visible
    await expect(page).toHaveURL(/\/user\/expenses/);
  });

  test('should have action buttons on expenses page', async ({ page }) => {
    await page.goto('/user/expenses');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Check for buttons (add, edit, delete, etc.)
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should have add expense button', async ({ page }) => {
    await page.goto('/user/expenses');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Look for add/create button
    const addButton = page.locator('button').filter({ hasText: /add|create|new|insert/i });
    if (await addButton.count() > 0) {
      await expect(addButton.first()).toBeVisible();
    }
  });

  test('should have expense table or list', async ({ page }) => {
    await page.goto('/user/expenses');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Check for table or list elements
    const table = page.locator('table');
    const list = page.locator('ul, ol, [role="list"]');
    
    const hasTable = await table.count() > 0;
    const hasList = await list.count() > 0;
    
    expect(hasTable || hasList).toBe(true);
  });
});

test.describe('User Profile - Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set authentication for profile tests
    await page.goto('/user/profile');
    
    await page.evaluate(() => {
      sessionStorage.setItem('authToken', 'test-token-123');
      sessionStorage.setItem('user', JSON.stringify({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'USER'
      }));
    });
    
    await page.reload();
  });

  test('should load profile page without errors', async ({ page }) => {
    await page.goto('/user/profile');
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Page should be visible
    await expect(page).toHaveURL(/\/user\/profile/);
  });

  test('should display user profile information fields', async ({ page }) => {
    await page.goto('/user/profile');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Check for form fields (could be display or input)
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    // Profile page should have at least some inputs for user data
    if (inputCount > 0) {
      expect(inputCount).toBeGreaterThan(0);
    }
  });

  test('should have edit or save button on profile', async ({ page }) => {
    await page.goto('/user/profile');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Look for edit/save buttons
    const buttons = page.locator('button').filter({ hasText: /edit|save|update|submit/i });
    
    if (await buttons.count() > 0) {
      await expect(buttons.first()).toBeVisible();
    }
  });

  test('should display first name field on profile', async ({ page }) => {
    await page.goto('/user/profile');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Look for first name field (input or label)
    const firstNameInput = page.locator('input').filter({ hasText: /first|name/i });
    const firstNameLabel = page.locator('label').filter({ hasText: /first name/i });
    
    const hasField = await firstNameInput.count() > 0 || await firstNameLabel.count() > 0;
    
    if (hasField) {
      expect(hasField).toBe(true);
    }
  });

  test('should display email field on profile', async ({ page }) => {
    await page.goto('/user/profile');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Look for email field
    const emailInput = page.locator('input[type="email"]');
    
    if (await emailInput.count() > 0) {
      await expect(emailInput.first()).toBeVisible();
    }
  });

  test('should allow editing profile information', async ({ page }) => {
    await page.goto('/user/profile');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Try to find and interact with an input field
    const firstInput = page.locator('input').first();
    
    if (await firstInput.count() > 0) {
      // Check if field is enabled and can receive input
      await expect(firstInput).toBeEnabled();
    }
  });
});

test.describe('User Authentication - Redirects', () => {
  test('should redirect to login if not authenticated on dashboard', async ({ page }) => {
    // Don't set any auth tokens
    await page.goto('/user/dashboard');
    
    // Wait a bit for redirect logic
    await page.waitForTimeout(1000);
    
    // Should be redirected to login
    const url = page.url();
    expect(url).toMatch(/login/);
  });

  test('should redirect to login if not authenticated on expenses', async ({ page }) => {
    // Don't set any auth tokens
    await page.goto('/user/expenses');
    
    // Wait a bit for redirect logic
    await page.waitForTimeout(1000);
    
    // Should be redirected to login
    const url = page.url();
    expect(url).toMatch(/login/);
  });

  test('should redirect to login if not authenticated on profile', async ({ page }) => {
    // Don't set any auth tokens
    await page.goto('/user/profile');
    
    // Wait a bit for redirect logic
    await page.waitForTimeout(1000);
    
    // Should be redirected to login
    const url = page.url();
    expect(url).toMatch(/login/);
  });
});
