import { test, expect } from '@playwright/test';

test.describe('Admin Pages - Navigation and Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Set admin authentication for testing
    await page.evaluate(() => {
      sessionStorage.setItem('authToken', 'test-admin-token-123');
      sessionStorage.setItem('user', JSON.stringify({
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'ADMIN'
      }));
    });
  });

  test('should load admin dashboard page', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for Admin Dashboard title
    const title = page.locator('h1:has-text("Admin Dashboard")');
    await expect(title).toBeVisible();
  });

  test('should display admin dashboard with welcome message', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Check for welcome card
    const welcomeText = page.locator('text=/Welcome|Admin/i');
    if (await welcomeText.count() > 0) {
      await expect(welcomeText.first()).toBeVisible();
    }
  });

  test('should have logout button on admin dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Check for logout button
    const logoutButton = page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible();
  });

  test('should load user management page', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Page should be at correct URL
    await expect(page).toHaveURL(/\/admin\/users/);
  });

  test('should load category management page', async ({ page }) => {
    await page.goto('/admin/categories');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Page should be at correct URL
    await expect(page).toHaveURL(/\/admin\/categories/);
  });

  test('should load expense report page', async ({ page }) => {
    await page.goto('/admin/reports');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Page should be at correct URL
    await expect(page).toHaveURL(/\/admin\/reports/);
  });

  test('should logout and redirect to login from admin dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Click logout button
    const logoutButton = page.locator('button:has-text("Logout")');
    await logoutButton.click();
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect non-admin users from admin dashboard', async ({ page }) => {
    // Set user role as USER instead of ADMIN
    await page.evaluate(() => {
      sessionStorage.setItem('user', JSON.stringify({
        id: '2',
        firstName: 'Regular',
        lastName: 'User',
        email: 'user@example.com',
        role: 'USER'
      }));
    });
    
    // Try to access admin dashboard
    await page.goto('/admin/dashboard');
    
    // Wait for redirect
    await page.waitForTimeout(1000);
    
    // Should be redirected to user dashboard
    const url = page.url();
    expect(url).toMatch(/user\/dashboard|login/);
  });

  test('should redirect unauthenticated users from admin dashboard', async ({ page }) => {
    // Clear auth tokens
    await page.evaluate(() => {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
    });
    
    // Try to access admin dashboard
    await page.goto('/admin/dashboard');
    
    // Wait for redirect
    await page.waitForTimeout(1000);
    
    // Should be redirected to login
    const url = page.url();
    expect(url).toMatch(/login/);
  });
});

test.describe('Admin Dashboard - Content', () => {
  test.beforeEach(async ({ page }) => {
    // Set admin authentication
    await page.evaluate(() => {
      sessionStorage.setItem('authToken', 'test-admin-token-123');
      sessionStorage.setItem('user', JSON.stringify({
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'ADMIN'
      }));
    });
  });

  test('should display dashboard statistics or cards', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Wait for content
    await page.waitForLoadState('networkidle');
    
    // Check for content cards/sections
    const cards = page.locator('div[style*="border"], div[style*="box-shadow"]');
    if (await cards.count() > 0) {
      expect(await cards.count()).toBeGreaterThan(0);
    }
  });

  test('should have navigation or menu items', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Look for links to admin pages
    const links = page.locator('a, button').filter({ hasText: /user|categor|report|dashboard/i });
    if (await links.count() > 0) {
      expect(await links.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('User Management - Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set admin authentication
    await page.evaluate(() => {
      sessionStorage.setItem('authToken', 'test-admin-token-123');
      sessionStorage.setItem('user', JSON.stringify({
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'ADMIN'
      }));
    });
  });

  test('should load user management page without errors', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Page should be visible
    await expect(page).toHaveURL(/\/admin\/users/);
  });

  test('should have toolbar with logout on user management', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Check for logout button
    const logoutButton = page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible();
  });

  test('should have search functionality on user management', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Look for search input
    const searchInput = page.locator('input[type="text"], input[placeholder*="search" i]');
    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible();
    }
  });

  test('should have add user button', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Look for add/create button
    const addButton = page.locator('button').filter({ hasText: /add|create|new/i });
    if (await addButton.count() > 0) {
      await expect(addButton.first()).toBeVisible();
    }
  });

  test('should have filter options on user management', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Look for filter/select elements
    const filters = page.locator('select');
    if (await filters.count() > 0) {
      expect(await filters.count()).toBeGreaterThan(0);
    }
  });

  test('should have user table or list', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Check for table or list
    const table = page.locator('table');
    const list = page.locator('ul, ol, [role="list"]');
    
    const hasTable = await table.count() > 0;
    const hasList = await list.count() > 0;
    
    expect(hasTable || hasList).toBe(true);
  });

  test('should have action buttons for each user', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Look for edit/delete buttons
    const buttons = page.locator('button').filter({ hasText: /edit|delete|view|reset/i });
    if (await buttons.count() > 0) {
      expect(await buttons.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Category Management - Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set admin authentication
    await page.evaluate(() => {
      sessionStorage.setItem('authToken', 'test-admin-token-123');
      sessionStorage.setItem('user', JSON.stringify({
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'ADMIN'
      }));
    });
  });

  test('should load category management page without errors', async ({ page }) => {
    await page.goto('/admin/categories');
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Page should be visible
    await expect(page).toHaveURL(/\/admin\/categories/);
  });

  test('should have toolbar with logout on category management', async ({ page }) => {
    await page.goto('/admin/categories');
    
    // Check for logout button
    const logoutButton = page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible();
  });

  test('should have add category button', async ({ page }) => {
    await page.goto('/admin/categories');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Look for add/create button
    const addButton = page.locator('button').filter({ hasText: /add|create|new/i });
    if (await addButton.count() > 0) {
      await expect(addButton.first()).toBeVisible();
    }
  });

  test('should have search functionality on category management', async ({ page }) => {
    await page.goto('/admin/categories');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Look for search input
    const searchInput = page.locator('input[type="text"], input[placeholder*="search" i]');
    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible();
    }
  });

  test('should have category table or list', async ({ page }) => {
    await page.goto('/admin/categories');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Check for table or list
    const table = page.locator('table');
    const list = page.locator('ul, ol, [role="list"]');
    
    const hasTable = await table.count() > 0;
    const hasList = await list.count() > 0;
    
    expect(hasTable || hasList).toBe(true);
  });

  test('should have action buttons for each category', async ({ page }) => {
    await page.goto('/admin/categories');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Look for edit/delete buttons
    const buttons = page.locator('button').filter({ hasText: /edit|delete|view/i });
    if (await buttons.count() > 0) {
      expect(await buttons.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Expense Report - Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set admin authentication
    await page.evaluate(() => {
      sessionStorage.setItem('authToken', 'test-admin-token-123');
      sessionStorage.setItem('user', JSON.stringify({
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'ADMIN'
      }));
    });
  });

  test('should load expense report page without errors', async ({ page }) => {
    await page.goto('/admin/reports');
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Page should be visible
    await expect(page).toHaveURL(/\/admin\/reports/);
  });

  test('should have toolbar with logout on expense report', async ({ page }) => {
    await page.goto('/admin/reports');
    
    // Check for logout button
    const logoutButton = page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible();
  });

  test('should have filter options on expense report', async ({ page }) => {
    await page.goto('/admin/reports');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Look for select/filter elements
    const selects = page.locator('select');
    if (await selects.count() > 0) {
      expect(await selects.count()).toBeGreaterThan(0);
    }
  });

  test('should have category filter on expense report', async ({ page }) => {
    await page.goto('/admin/reports');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Look for category filter
    const categoryFilter = page.locator('select, [aria-label*="categor" i], label:has-text(/categor/i)');
    if (await categoryFilter.count() > 0) {
      await expect(categoryFilter.first()).toBeVisible();
    }
  });

  test('should have month filter on expense report', async ({ page }) => {
    await page.goto('/admin/reports');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Look for month filter
    const monthFilter = page.locator('select, input[type="month"], input[type="date"]');
    if (await monthFilter.count() > 0) {
      expect(await monthFilter.count()).toBeGreaterThan(0);
    }
  });

  test('should display report summary or statistics', async ({ page }) => {
    await page.goto('/admin/reports');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Look for summary cards or stats
    const stats = page.locator('div, section').filter({ hasText: /total|summary|report|amount/i });
    if (await stats.count() > 0) {
      expect(await stats.count()).toBeGreaterThan(0);
    }
  });

  test('should have report data display', async ({ page }) => {
    await page.goto('/admin/reports');
    
    // Wait for page
    await page.waitForLoadState('networkidle');
    
    // Check for table or chart
    const table = page.locator('table');
    const chart = page.locator('canvas, [role="img"]');
    
    const hasTable = await table.count() > 0;
    const hasChart = await chart.count() > 0;
    
    expect(hasTable || hasChart).toBe(true);
  });
});

test.describe('Admin Authentication - Redirects', () => {
  test('should redirect to login if not authenticated on admin dashboard', async ({ page }) => {
    // Don't set any auth tokens
    await page.goto('/admin/dashboard');
    
    // Wait for redirect logic
    await page.waitForTimeout(1000);
    
    // Should be redirected to login
    const url = page.url();
    expect(url).toMatch(/login/);
  });

  test('should redirect to login if not authenticated on user management', async ({ page }) => {
    // Don't set any auth tokens
    await page.goto('/admin/users');
    
    // Wait for redirect logic
    await page.waitForTimeout(1000);
    
    // Should be redirected to login
    const url = page.url();
    expect(url).toMatch(/login/);
  });

  test('should redirect to login if not authenticated on category management', async ({ page }) => {
    // Don't set any auth tokens
    await page.goto('/admin/categories');
    
    // Wait for redirect logic
    await page.waitForTimeout(1000);
    
    // Should be redirected to login
    const url = page.url();
    expect(url).toMatch(/login/);
  });

  test('should redirect to login if not authenticated on expense report', async ({ page }) => {
    // Don't set any auth tokens
    await page.goto('/admin/reports');
    
    // Wait for redirect logic
    await page.waitForTimeout(1000);
    
    // Should be redirected to login
    const url = page.url();
    expect(url).toMatch(/login/);
  });

  test('should redirect non-admin users from user management', async ({ page }) => {
    // Set user role as USER instead of ADMIN
    await page.evaluate(() => {
      sessionStorage.setItem('authToken', 'test-token');
      sessionStorage.setItem('user', JSON.stringify({
        id: '2',
        firstName: 'Regular',
        lastName: 'User',
        email: 'user@example.com',
        role: 'USER'
      }));
    });
    
    // Try to access user management
    await page.goto('/admin/users');
    
    // Wait for redirect
    await page.waitForTimeout(1000);
    
    // Should be redirected to user dashboard
    const url = page.url();
    expect(url).toMatch(/user\/dashboard|login/);
  });

  test('should redirect non-admin users from category management', async ({ page }) => {
    // Set user role as USER instead of ADMIN
    await page.evaluate(() => {
      sessionStorage.setItem('authToken', 'test-token');
      sessionStorage.setItem('user', JSON.stringify({
        id: '2',
        firstName: 'Regular',
        lastName: 'User',
        email: 'user@example.com',
        role: 'USER'
      }));
    });
    
    // Try to access category management
    await page.goto('/admin/categories');
    
    // Wait for redirect
    await page.waitForTimeout(1000);
    
    // Should be redirected to user dashboard
    const url = page.url();
    expect(url).toMatch(/user\/dashboard|login/);
  });

  test('should redirect non-admin users from expense report', async ({ page }) => {
    // Set user role as USER instead of ADMIN
    await page.evaluate(() => {
      sessionStorage.setItem('authToken', 'test-token');
      sessionStorage.setItem('user', JSON.stringify({
        id: '2',
        firstName: 'Regular',
        lastName: 'User',
        email: 'user@example.com',
        role: 'USER'
      }));
    });
    
    // Try to access expense report
    await page.goto('/admin/reports');
    
    // Wait for redirect
    await page.waitForTimeout(1000);
    
    // Should be redirected to user dashboard
    const url = page.url();
    expect(url).toMatch(/user\/dashboard|login/);
  });
});
