import { test, expect } from '@playwright/test';

test.describe('Authentication - Navigation', () => {
  test('should navigate to login page on root', async ({ page }) => {
    await page.goto('/');
    // Root redirects to /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    
    // Check for Expense Tracker title
    await expect(page.locator('h1:has-text("Expense Tracker")')).toBeVisible();
    
    // Check for Sign in form
    await expect(page.locator('h1:has-text("Sign in")')).toBeVisible();
    
    // Check for email input
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Check for password input
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Check for submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should navigate to register page when clicking create account', async ({ page }) => {
    await page.goto('/login');
    
    // Find and click the "Create one" button
    const createButton = page.locator('button:has-text("Create one")');
    await createButton.click();
    
    // Verify navigation to register page
    await expect(page).toHaveURL(/\/register/);
  });

  test('should display register form on register page', async ({ page }) => {
    await page.goto('/register');
    
    // Check for Create Account form title
    const title = page.locator('h1:has-text("Create Account")');
    await expect(title).toBeVisible();
    
    // Check for all required fields
    await expect(page.locator('input[placeholder="John"]')).toBeVisible(); // First name
    await expect(page.locator('input[placeholder="Doe"]')).toBeVisible();  // Last name
    await expect(page.locator('input[type="email"]')).toBeVisible();       // Email
    await expect(page.locator('input[type="password"]')).toBeVisible();    // Password inputs
  });
});

test.describe('Login - Form Validation', () => {
  test('should show error when submitting empty email', async ({ page }) => {
    await page.goto('/login');
    
    // Fill only password
    await page.locator('input[type="password"]').fill('password123');
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Check for error message
    const errorDiv = page.locator('div').filter({ hasText: /Email is required/ });
    await expect(errorDiv).toBeVisible();
  });

  test('should show error when submitting empty password', async ({ page }) => {
    await page.goto('/login');
    
    // Fill only email
    await page.locator('input[type="email"]').fill('test@example.com');
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Check for error message
    const errorDiv = page.locator('div').filter({ hasText: /Password is required/ });
    await expect(errorDiv).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/login');
    
    // Fill with invalid email
    await page.locator('input[type="email"]').fill('notanemail');
    await page.locator('input[type="password"]').fill('password123');
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Check for error message
    const errorDiv = page.locator('div').filter({ hasText: /valid email/ });
    await expect(errorDiv).toBeVisible();
  });

  test('should show error for password less than 6 characters', async ({ page }) => {
    await page.goto('/login');
    
    // Fill with short password
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('12345');
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Check for error message
    const errorDiv = page.locator('div').filter({ hasText: /at least 6 characters/ });
    await expect(errorDiv).toBeVisible();
  });

  test('should allow valid login form submission', async ({ page }) => {
    await page.goto('/login');
    
    // Fill valid credentials
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('password123');
    
    // Check that submit button is enabled
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
  });
});

test.describe('Register - Form Validation', () => {
  test('should show error when submitting empty first name', async ({ page }) => {
    await page.goto('/register');
    
    // Fill other fields but not first name
    await page.locator('input[placeholder="Doe"]').fill('Doe');
    await page.locator('input[type="email"]').fill('test@example.com');
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[0].fill('password123');
    await passwordInputs[1].fill('password123');
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Check for error message
    const errorDiv = page.locator('div').filter({ hasText: /First name is required/ });
    await expect(errorDiv).toBeVisible();
  });

  test('should show error when submitting empty last name', async ({ page }) => {
    await page.goto('/register');
    
    // Fill other fields but not last name
    await page.locator('input[placeholder="John"]').fill('John');
    await page.locator('input[type="email"]').fill('test@example.com');
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[0].fill('password123');
    await passwordInputs[1].fill('password123');
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Check for error message
    const errorDiv = page.locator('div').filter({ hasText: /Last name is required/ });
    await expect(errorDiv).toBeVisible();
  });

  test('should show error when passwords do not match', async ({ page }) => {
    await page.goto('/register');
    
    // Fill form with non-matching passwords
    await page.locator('input[placeholder="John"]').fill('John');
    await page.locator('input[placeholder="Doe"]').fill('Doe');
    await page.locator('input[type="email"]').fill('test@example.com');
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[0].fill('password123');
    await passwordInputs[1].fill('password456');
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Check for error message
    const errorDiv = page.locator('div').filter({ hasText: /do not match/ });
    await expect(errorDiv).toBeVisible();
  });

  test('should show error for invalid email in register', async ({ page }) => {
    await page.goto('/register');
    
    // Fill form with invalid email
    await page.locator('input[placeholder="John"]').fill('John');
    await page.locator('input[placeholder="Doe"]').fill('Doe');
    await page.locator('input[type="email"]').fill('invalidemail');
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[0].fill('password123');
    await passwordInputs[1].fill('password123');
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Check for error message
    const errorDiv = page.locator('div').filter({ hasText: /valid email/ });
    await expect(errorDiv).toBeVisible();
  });

  test('should allow valid register form submission', async ({ page }) => {
    await page.goto('/register');
    
    // Fill form with valid data
    await page.locator('input[placeholder="John"]').fill('John');
    await page.locator('input[placeholder="Doe"]').fill('Doe');
    await page.locator('input[type="email"]').fill('newuser@example.com');
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[0].fill('password123');
    await passwordInputs[1].fill('password123');
    
    // Check that submit button is enabled
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
  });
});
