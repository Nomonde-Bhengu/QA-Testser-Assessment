import { Page, expect } from '@playwright/test';

export class TwoFactorPage {
  constructor(private page: Page) {}

  // Step 1: Login form at /login
  async goto() {
    await this.page.goto('/login');
  }

  async getUsernameField() {
    return this.page.getByLabel('Username');
  }

  async getPasswordField() {
    return this.page.getByLabel('Password');
  }

  async getNextButton() {
    // The practice site uses "Login" as the button text, not "Next"
    return this.page.getByRole('button', { name: /Login|Next/i });
  }

  async submitCredentials(username: string, password: string) {
    await (await this.getUsernameField()).fill(username);
    await (await this.getPasswordField()).fill(password);
    await (await this.getNextButton()).click();
  }

  // Step 2: Code form — same page, revealed after credentials
  async getCodeField() {
    // Find the OTP input by type or label
    return this.page.locator('input[type="password"], input[name*="code" i], input[id*="code" i]').last();
  }

  async readDisplayedCode(): Promise<string> {
    // The practice site displays the code in a success flash or body text
    // Try multiple strategies: the flash message, or any standalone 6-digit text
    const flashLocator = this.page.locator('.flash.success, .flash.error');
    const flashText = await flashLocator.textContent().catch(() => null);
    if (flashText) {
      const match = flashText.match(/\d{6}/);
      if (match) return match[0];
    }

    // Fallback: scan body text for a 6-digit number
    const body = await this.page.locator('body').textContent();
    const match = body?.match(/\b\d{6}\b/);
    if (!match) throw new Error('No 6-digit code found on page');
    return match[0];
  }

  async submitCode(code: string) {
    const field = await this.getCodeField();
    await field.fill(code);
    await this.page.getByRole('button', { name: /Verify|Submit/i }).click();
  }

  // Assertions
  async expectError(message: string | RegExp) {
    await expect(this.page.locator('.flash.error')).toContainText(message);
  }

  async expectSuccess() {
    await expect(this.page.locator('.flash.success')).toContainText(/secure area/i);
    // Or check for URL change to /secure if that's the practice site behavior
    // await expect(this.page).toHaveURL(/\/secure/);
  }

  async expectOnLoginPage() {
    await expect(this.page).toHaveURL(/\/login/);
  }

  async expectOnCodePage() {
    // The code step may be on the same /login URL — just verify the code field is visible
    const codeField = await this.getCodeField();
    await expect(codeField).toBeVisible();
  }
}

// // import { Page, expect } from '@playwright/test';

// export class TwoFactorPage {
//   constructor(private page: Page) {}

//   // Step 1
//   async goto() {
//     await this.page.goto('/two_factor');
//   }

//   async getUsernameField() {
//     return this.page.getByLabel('Username');
//   }

//   async getPasswordField() {
//     return this.page.getByLabel('Password');
//   }

//   async getNextButton() {
//     return this.page.getByRole('button', { name: 'Next' });
//   }

//   async submitCredentials(username: string, password: string) {
//     await (await this.getUsernameField()).fill(username);
//     await (await this.getPasswordField()).fill(password);
//     await (await this.getNextButton()).click();
//   }

//   // Step 2
//   async getCodeField() {
//     return this.page.getByLabel(/one-time code|code/i);
//   }

//   async readDisplayedCode(): Promise<string> {
//     // Practice site displays the code on-screen
//     const codeElement = this.page.locator('text=/\\d{6}/').first();
//     const text = await codeElement.textContent();
//     const match = text?.match(/\d{6}/);
//     if (!match) throw new Error('No 6-digit code found on page');
//     return match[0];
//   }

//   async submitCode(code: string) {
//     await (await this.getCodeField()).fill(code);
//     await this.page.getByRole('button', { name: /Verify|Submit/i }).click();
//   }

//   // Assertions
//   async expectError(message: string | RegExp) {
//     await expect(this.page.locator('.flash.error')).toContainText(message);
//   }

//   async expectSuccess() {
//     await expect(this.page.locator('.flash.success')).toContainText(/secure area/i);
//   }

//   async expectOnLoginPage() {
//     await expect(this.page).toHaveURL(/\/two_factor$/);
//   }

//   async expectOnCodePage() {
//     await expect(this.page).toHaveURL(/\/two_factor\/code/);
//   }
// }
