1. Objective
Verify that the two-factor authentication (2FA) flow at
https://the-internet.herokuapp.com/two_factor behaves according to the stated requirements:
credential validation, OTP masking and length limits, code expiry and single-use enforcement, secure area protection, and session termination on logout.

3. Scope
In scope:

Step 1: Username/Password login page (labels, error handling, valid credential transition).

Step 2: OTP entry page (masking, 6-character limit, wrong code error, correct code success).

Security behaviors: code expiry (3 min), code reuse, direct URL access to secure area, logout session termination.

Boundary/edge cases: empty fields, wrong case, non-numeric codes, over-length input.

Out of scope:

Load/performance testing (prohibited on shared public site).

Brute-force or repeated-attempt testing beyond 10 attempts.

Testing of actual SMS/email delivery (practice site displays code on-screen).

3. Environment
Item	                                                  Detail
Application                                              URL	https://the-internet.herokuapp.com/two_factor
Credentials	                                             tomsmith / SuperSecretPassword!
Automation Stack	                                       Playwright + TypeScript (Node.js 18+)
Browsers	                                               Chromium (primary), Firefox (cross-browser)
OS	                                                      Any (local or CI)
