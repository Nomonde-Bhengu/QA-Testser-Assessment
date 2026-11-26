# Two-Factor Login — Playwright Test Suite

Automated tests for the two-step login at
https://the-internet.herokuapp.com/two_factor
(step 1: username + password, step 2: 6-digit one-time code).

## What is in this repo

| Path | Purpose |
|---|---|
| `A_TestPlan.md` | Part A: test plan, test cases, risks (including 2FA-specific risks) |
| `tests/two-factor.spec.ts` | Part B: Playwright tests (IDs TC01 to TC13) |
| `tests/pages/TwoFactorPage.ts` | Page object wrapping both login steps |
|  `C_BugReports.md` | Part C: bug reports and security observations  (- To be changed to pdf form in future)| 

## Prerequisites

- Node.js 18 or newer
- npm

## Install

```bash
npm install
npx playwright install
```

## Run the tests

```bash
npm test                            # default run: Chromium + Firefox
npx playwright show-report          # open the HTML report from the last run

```

Run a single test by name, for example:

```bash
npx playwright test -g "TC09" --project=chromium
```

Run tagged groups:

```bash
npx playwright test --grep @security
```

> Windows, macOS and Linux are all supported; the slow-test switch uses `cross-env`, which is installed by `npm install`.

## How the tests work

- **Independent tests:** each test starts in a fresh browser context and does its own login steps, so any test can be run alone.
- **Wrong code is always wrong:** the "wrong code" test takes the real code and changes it.
- **Config:** `baseURL` is set in `playwright.config.ts`; screenshots are kept on failure only.
- **Slow test:** 3-minute expiry is tagged `@slow` and skipped.

## Test coverage

| Test | What it checks | Requirement |
|---|---|---|
| TC01 | Page loads; labelled Username/Password fields; Next button | Login page |
| TC02 | Invalid credentials: error, stays on login page | Invalid credentials |
| TC03 | Empty / username-only / password-only: error | Missing credentials |


## Evidence

Tests running
<img width="1438" height="867" alt="image" src="https://github.com/user-attachments/assets/12a7c4b2-5126-4673-a51e-2e04f8cc527e" />

OTP Code showing on site:
<img width="1150" height="460" alt="image" src="https://github.com/user-attachments/assets/625adcfb-d81f-4293-9158-ecd473d3ef1c" />

No visible rate limiting on OTP entry
<img width="1117" height="462" alt="image" src="https://github.com/user-attachments/assets/fe3de3e4-c939-4b12-8510-26e31f198143" />


## Findings summary

Details, steps and severity are in `C_BugReports.pdf`.

| ID | Finding | Severity |
|---|---|---|
| BUG-01 | One-time code displayed in plain text on the page | Low (by design on practice site) |
| BUG-02 | No attempt limit or lockout observed on code entry (within 10 attempts) | High in a real system |







