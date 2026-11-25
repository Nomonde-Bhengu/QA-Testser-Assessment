import { Page, expect } from '@playwright/test';

export class TwoFactorPage {
  constructor(private page: Page) {}

  // Step 1
  async goto() {
    await this.page.goto('/two_factor');
  }

  async getUsernameField() {
    return this.page.getByLabel('Username');
  }

  async getPasswordField() {
    return this.page.getByLabel('Password');
  }

  async getNextButton() {
    return this.page.getByRole('button', { name: 'Next' });
  }

  async submitCredentials(username: string, password: string) {
    await (await this.getUsernameField()).fill(username);
    await (await this.getPasswordField()).fill(password);
    await (await this.getNextButton()).click();
  }

  // Step 2
  async getCodeField() {
    return this.page.getByLabel(/one-time code|code/i);
  }

  async readDisplayedCode(): Promise<string> {
    // Practice site displays the code on-screen
    const codeElement = this.page.locator('text=/\\d{6}/').first();
    const text = await codeElement.textContent();
    const match = text?.match(/\d{6}/);
    if (!match) throw new Error('No 6-digit code found on page');
    return match[0];
  }

  async submitCode(code: string) {
    await (await this.getCodeField()).fill(code);
    await this.page.getByRole('button', { name: /Verify|Submit/i }).click();
  }

  // Assertions
  async expectError(message: string | RegExp) {
    await expect(this.page.locator('.flash.error')).toContainText(message);
  }

  async expectSuccess() {
    await expect(this.page.locator('.flash.success')).toContainText(/secure area/i);
  }

  async expectOnLoginPage() {
    await expect(this.page).toHaveURL(/\/two_factor$/);
  }

  async expectOnCodePage() {
    await expect(this.page).toHaveURL(/\/two_factor\/code/);
  }
}
