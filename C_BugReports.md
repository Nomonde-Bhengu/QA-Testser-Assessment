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

*Severity:* Low (by design for practice site)
*Priority:* Low


---

### Bug 2 (Security Observation): No visible rate limiting or attempt counter on OTP entry
**Title:** No rate-limit feedback on repeated wrong OTP submissions

**Summary:** Submitting multiple wrong codes in succession shows an error each time but no lockout or delay feedback. For a real 2FA system, this would enable brute-force (10^6 space).

**Steps:**
1. Complete step 1 with valid credentials
2. Submit wrong code 3–5 times consecutively

**Expected:** After N failures, account should be temporarily locked or submission delayed.
**Actual:** Error shown each time; no throttling observed.

**Severity:** High (if this were production)
**Priority:** High

---


