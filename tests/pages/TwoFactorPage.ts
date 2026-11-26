import { Page, expect } from '@playwright/test';

/**
 * Page Object Model for the two-factor authentication flow.
 *
 * Encapsulates navigation and interactions for the login page
 * (username/password) and the OTP verification page.
 */
export class TwoFactorPage {
  /**
   * @param page - Playwright `Page` instance used to drive the browser.
   */
  constructor(private page: Page) {}

  /**
   * Navigates to the two-factor login page.
   */
  async goto() {
    await this.page.goto('/two_factor');
  }

  /**
   * Returns the locator for the username input field (matched by its label).
   */
  async getUsernameField() {
    return this.page.getByLabel('Username');
  }

  /**
   * Returns the locator for the password input field (matched by its label).
   */
  async getPasswordField() {
    return this.page.getByLabel('Password');
  }

  /**
   * Returns the locator for the "Next" button that submits credentials.
   */
  async getNextButton() {
    return this.page.getByRole('button', { name: 'Next' });
  }

  /**
   * Fills in the username and password fields and clicks the "Next" button
   * to submit the first step of the login flow.
   *
   * @param username - Username to enter.
   * @param password - Password to enter.
   */
  async submitCredentials(username: string, password: string) {
    await (await this.getUsernameField()).fill(username);
    await (await this.getPasswordField()).fill(password);
    await (await this.getNextButton()).click();
  }

  /**
   * Returns the locator for the one-time code input field on the OTP page.
   */
  async getCodeField() {
    return this.page.getByRole('textbox', { name: 'One-time code' });
  }

  /**
   * Scrapes the page body for a 6-digit code and returns the first match.
   *
   * Intended for test environments where the OTP is rendered on the page
   * for debugging/testing purposes.
   *
   * @returns The first 6-digit numeric string found on the page.
   * @throws Error if no 6-digit code is present on the page.
   */
  async readDisplayedCode(): Promise<string> {
    const pageText = await this.page.locator('body').textContent();
    const match = pageText?.match(/\b\d{6}\b/);
    if (!match) throw new Error('Could not find a 6-digit code on the page.');
    return match[0];
  }

  /**
   * Fills the OTP field with the given code and clicks the "Verify" button.
   *
   * @param code - The one-time code to submit.
   */
  async submitCode(code: string) {
    await (await this.getCodeField()).fill(code);
    await this.page.getByRole('button', { name: 'Verify' }).click();
  }

  /**
   * Asserts that an error flash message is visible and matches the given
   * text or regular expression.
   *
   * @param message - Expected error text or pattern.
   */
  async expectError(message: string | RegExp) {
    await expect(this.page.locator('.flash.error')).toContainText(message);
  }

  /**
   * Asserts that the user has reached the secure area, indicated by a success
   * flash message referencing the "secure area".
   */
  async expectSuccess() {
    await expect(this.page.locator('.flash.success')).toContainText(/secure area/i);
  }

  /**
   * Asserts that the current URL is the two-factor login page.
   */
  async expectOnLoginPage() {
    await expect(this.page).toHaveURL(/\/two_factor$/);
  }

  /**
   * Asserts that the OTP input field is visible, confirming the user is on
   * the code verification page.
   */
  async expectOnCodePage() {
    await expect(await this.getCodeField()).toBeVisible();
  }
}
