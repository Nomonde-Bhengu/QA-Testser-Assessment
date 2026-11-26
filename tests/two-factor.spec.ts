import { test, expect } from '@playwright/test';
import { TwoFactorPage } from './pages/TwoFactorPage';

/** Valid username for the two-factor login flow. */
const VALID_USER = 'tomsmith';

/** Valid password for the two-factor login flow. */
const VALID_PASS = 'SuperSecretPassword!';

test.describe('Two-Factor Login', () => {

  /**
   * TC01: Verifies the login page renders correctly.
   * Checks that the username field, password field, and Next button
   * are all visible on initial page load.
   */
  test('TC01: Login page loads with labelled fields and Next button', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await expect(await tf.getUsernameField()).toBeVisible();
    await expect(await tf.getPasswordField()).toBeVisible();
    await expect(await tf.getNextButton()).toBeVisible();
  });

  /**
   * TC02: Verifies invalid credentials are rejected.
   * Submits a wrong username/password combination and asserts that an
   * "invalid" error is shown and the user remains on the login page.
   */
  test('TC02: Invalid credentials show error and stay on login page', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials('wronguser', 'wrongpass');
    await tf.expectError(/invalid/i);
    await tf.expectOnLoginPage();
  });

  /**
   * TC03: Verifies empty credentials are rejected.
   * Submits blank username and password fields and asserts that an
   * "invalid" or "required" error is shown and the user stays on the login page.
   */
  test('TC03: Empty credentials show error', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials('', '');
    await tf.expectError(/invalid|required/i);
    await tf.expectOnLoginPage();
  });

  /**
   * TC04: Verifies valid credentials advance to the OTP step.
   * Submits valid credentials and asserts the user lands on the code page
   * with a visible OTP input field.
   */
  test('TC04: Valid credentials lead to OTP step', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials(VALID_USER, VALID_PASS);
    await tf.expectOnCodePage();
    await expect(await tf.getCodeField()).toBeVisible();
  });

  /**
   * TC05: Verifies OTP field input constraints.
   * Asserts the OTP field uses password masking (type="password") and that
   * over-length input is truncated to a maximum of 6 characters.
   */
  test('TC05: OTP field masks input and limits to 6 chars', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials(VALID_USER, VALID_PASS);
    const codeField = await tf.getCodeField();
    // Masking check
    await expect(codeField).toHaveAttribute('type', 'password');
    // Over-length input truncated to 6
    await codeField.fill('1234567890');
    const value = await codeField.inputValue();
    expect(value.length).toBeLessThanOrEqual(6);
  });

  /**
   * TC06: Verifies an incorrect OTP is rejected.
   * Submits a wrong 6-digit code and asserts an "invalid"/"incorrect" error
   * is shown while the user remains on the code page.
   */
  test('TC06: Wrong code shows error', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials(VALID_USER, VALID_PASS);
    await tf.submitCode('000000');
    await tf.expectError(/invalid|incorrect/i);
    await tf.expectOnCodePage();
  });

  /**
   * TC07: Verifies non-numeric OTP input is rejected.
   * Submits an alphabetic string as the code and asserts an
   * "invalid"/"incorrect" error is shown.
   */
  test('TC07: Non-numeric code shows error', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials(VALID_USER, VALID_PASS);
    await tf.submitCode('abcdef');
    await tf.expectError(/invalid|incorrect/i);
  });

  /**
   * TC08: Verifies a correct OTP grants access to the secure area.
   * Reads the displayed code, submits it, and asserts the success state
   * (secure area with success message) is reached.
   */
  test('TC08: Correct code opens secure area with success message', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials(VALID_USER, VALID_PASS);
    const code = await tf.readDisplayedCode();
    await tf.submitCode(code);
    await tf.expectSuccess();
  });

  /**
   * TC09: Verifies the secure area cannot be accessed without authentication.
   * Navigates directly to the secure URL in a fresh context and asserts the
   * user is redirected away with a "not authorized"/"must log in" error.
   */
  test('TC09: Secure area not reachable via direct URL', async ({ page }) => {
    // Fresh context: no auth
    await page.goto('/two_factor/secure');
    await expect(page).not.toHaveURL(/\/secure/);
    await expect(page.locator('.flash.error')).toContainText(/not authorized|must log in/i);
  });

  /**
   * TC10: Verifies logout terminates the session.
   * Logs in successfully, logs out, asserts a "logged out" success flash,
   * then attempts to re-enter the secure area directly and confirms access is denied.
   */
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

  /**
   * TC11: Verifies username matching is case-sensitive.
   * Attempts login with 'TomSmith' (wrong case) and asserts an "invalid" error.
   * Tagged @security.
   */
  test('TC11: Wrong letter case in username fails @security', async ({ page }) => {
    const tf = new TwoFactorPage(page);
    await tf.goto();
    await tf.submitCredentials('TomSmith', VALID_PASS);
    await tf.expectError(/invalid/i);
  });

  /**
   * TC12: Verifies OTP codes expire after 3 minutes.
   * Logs in, reads the code, waits ~3 minutes plus a buffer, then submits the
   * code and asserts an "expired" error. Tagged @slow.
   */
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

  /**
   * TC13: Verifies OTP codes are single-use and cannot be replayed.
   * Logs in with a valid code, logs out, logs back in, and attempts to reuse
   * the same code, asserting an "invalid"/"expired"/"already used" error.
   * Tagged @slow.
   */
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
