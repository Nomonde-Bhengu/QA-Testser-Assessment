## Part C — Bug Reports (`C_BugReports.md`)



### Bug 1: OTP code is displayed in plain text on screen (Design/Environment Note)
**Title:** Practice site displays OTP in cleartext — not representative of real 2FA

**Summary:** The one-time code is rendered visibly on the page, eliminating any real security boundary. This is expected for the practice site but means tests cannot verify true out-of-band delivery.

**Steps:**
1. Navigate to '/two_factor' 
2. Enter valid credentials, click Next
3. Observe the 6-digit code displayed on the page

**Expected:** Code should be delivered out-of-band (SMS/email/authenticator).
**Actual:** Code is printed on screen.

**Severity:** Low (by design for practice site)
**Priority:** Low
**Note:** Documented as environment limitation, not a defect in the application under test.
---


