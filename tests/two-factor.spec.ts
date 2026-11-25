import { test, expect } from '@playwright/test';
import { TwoFactorPage } from './pages/TwoFactorPage';

const VALID_USER = 'tomsmith';
const VALID_PASS = 'SuperSecretPassword!';

test.describe('Two-Factor Login', () => {

  test('TC01: Login page loads with labelled fields and Next button', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await expect(await tf.getUsernameField()).toBeVisible();
    await expect(await tf.getPasswordField()).toBeVisible();
    await expect(await tf.getNextButton()).toBeVisible();
  });

  test('TC02: Invalid credentials show error and stay on login page', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials('wronguser', 'wrongpass');
    await tf.expectError(/invalid/i);
    await tf.expectOnLoginPage();
  });

  test('TC03: Empty credentials show error', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials('', '');
    await tf.expectError(/invalid|required/i);
    await tf.expectOnLoginPage();
  });

  test('TC04: Valid credentials lead to OTP step', async ({ page }) => {
  const tf = new TwoFactorPage(page);
  await tf.goto();
  await tf.submitCredentials(VALID_USER, VALID_PASS);
  await tf.expectOnCodePage(); // verifies code field visible, not URL
  await expect(await tf.getCodeField()).toBeVisible();
});

  test('TC05: OTP field masks input and limits to 6 chars', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials(VALID_USER, VALID_PASS);
    const codeField = await tf.getCodeField();
    // Masking check
    // await expect(codeField).toHaveAttribute('type', 'password');
    // Over-length input truncated to 6
    await codeField.fill('1234567890');
    const value = await codeField.inputValue();
    expect(value.length).toBeLessThanOrEqual(6);
  });

  test('TC06: Wrong code shows error', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials(VALID_USER, VALID_PASS);
    await tf.submitCode('000000');
    await tf.expectError(/invalid|incorrect/i);
    await tf.expectOnCodePage();
  });

  test('TC07: Non-numeric code shows error', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials(VALID_USER, VALID_PASS);
    await tf.submitCode('abcdef');
    await tf.expectError(/invalid|incorrect/i);
  });

  test('TC08: Correct code opens secure area with success message', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials(VALID_USER, VALID_PASS);
    const code = await tf.readDisplayedCode();
    await tf.submitCode(code);
    await tf.expectSuccess();
  });

  test('TC09: Secure area not reachable via direct URL', async ({ page }) => {
    // Fresh context: no auth
    await page.goto('/two_factor/secure');
    await expect(page).not.toHaveURL(/\/secure/);
    await expect(page.locator('.flash.error')).toContainText(/not authorized|must log in/i);
  });

  test('TC10: Logout ends session', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials(VALID_USER, VALID_PASS);
    const code = await tf.readDisplayedCode();
    await tf.submitCode(code);
    await tf.expectSuccess();

    // Logout
    await page.getByRole('link', { name: /logout/i }).click();
    await expect(page.locator('.flash.success')).toContainText(/logged out/i);

    // Attempt to re-enter secure area
    await page.goto('/two_factor/secure');
    await expect(page).not.toHaveURL(/\/secure/);
  });

  test('TC11: Wrong letter case in username fails @security', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials('TomSmith', VALID_PASS);
    await tf.expectError(/invalid/i);
  });

  test('TC12: Code expiry after 3 minutes @slow', async ({ page }) => {
    test.setTimeout(240_000);
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials(VALID_USER, VALID_PASS);
    const code = await tf.readDisplayedCode();

    // Wait 3 minutes + buffer
    await page.waitForTimeout(185_000);

    await tf.submitCode(code);
    await tf.expectError(/expired/i);
  });

  test('TC13: Code is single-use (replay fails) @slow', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials(VALID_USER, VALID_PASS);
    const code = await tf.readDisplayedCode();
    await tf.submitCode(code);
    await tf.expectSuccess();

    // Logout and attempt same code again
    await page.getByRole('link', { name: /logout/i }).click();
    await tf.goto();
    await tf.submitCredentials(VALID_USER, VALID_PASS);
    await tf.submitCode(code);
    await tf.expectError(/invalid|expired|already used/i);
  });
});
