# Claude Code / AI Assistance Log
**Assessment:** Techdome SDET Take-Home Assignment  
**Framework:** Playwright + TypeScript  
**Suite result:** 26 tests total — 22 passed, 4 failing (all 4 are genuine product defects, not framework failures)

> **How this log was kept:** Every meaningful AI interaction is recorded below with the exact prompt, what the AI produced, and — critically — what I changed and why.

---

## Prompt #1 — Project scaffold and folder structure

**What I asked:**
> "I'm building a Playwright TypeScript test suite for a venture-studio website (techdome.io) as part of an SDET take-home assessment. The brief requires tests in four layers: E2E, integration, security, and load. Suggest a folder structure and a base `playwright.config.ts` that supports all four layers with separate projects or at least logical separation."

**What Claude did:**
Suggested a structure with `tests/e2e/`, `tests/integration/`, `tests/security/`, and `tests/load/`, a `pages/` directory for page objects, a `utils/` directory for helpers, and a `docs/` directory for deliverables. Produced a `playwright.config.ts` with a single default project and `testDir: './tests'`.

**What I changed:**
- Accepted the folder structure as-is — it matched what the brief specified, so no reason to deviate.
- Rejected the single-project config. I split it into named Playwright projects (`e2e`, `integration`, `security`, `load`) so each layer can be run independently with `--project=e2e` etc., while `npx playwright test` still runs the whole suite as the brief required.
- Added `fullyParallel: false` for the load project specifically to enforce the five-concurrent-user constraint — Claude's initial config didn't address this at all.
- Set `workers: 1` for the load project. Claude's default would have allowed multiple workers and could have silently exceeded the hard limit the brief flags three times.

---

## Prompt #2 — Page object for the homepage

**What I asked:**
> "Generate a Playwright page object class for the Techdome homepage (https://techdome.io). It should expose methods to: check the page title, check the meta description, verify the hero heading is visible, and return the document scroll width vs client width for overflow detection."

**What Claude did:**
Produced a `HomePage` class with a `goto()` method, a `getTitle()` method, and a `heroHeading` locator using `page.locator('h1')`. For overflow detection it suggested `page.evaluate(() => document.body.scrollWidth)`.

**What I changed:**
- Rejected `page.locator('h1')` as the hero heading selector. The Techdome homepage has multiple `h1`-level elements across sections. I inspected the DOM and scoped the locator to the hero section specifically to avoid the test latching onto the wrong heading as the page evolves.
- Changed `document.body.scrollWidth` to `document.documentElement.scrollWidth` in the overflow evaluation. The `body` measurement can miss overflow caused by absolutely-positioned children that extend beyond `body` but are still inside `html`. This distinction mattered: the 375px test was measuring a 400px document — 25px overflow — and I needed the measurement to be correct before deciding whether to file it as a bug.
- Accepted the overall class structure and `goto()` pattern.

---

## Prompt #3 — Responsive overflow tests (US-017 and US-018)

**What I asked:**
> "Write two Playwright tests: one at 375×812 (mobile) and one at 768×1024 (tablet). Each should set the viewport, navigate to the homepage, and assert that `document.documentElement.scrollWidth` does not exceed `window.innerWidth`. If it does, log which elements extend beyond the viewport."

**What Claude did:**
Produced both tests with `page.setViewportSize()` and the `scrollWidth <= clientWidth` assertion. Added a diagnostic `page.evaluate()` block that queried all elements and filtered those with `getBoundingClientRect().right > window.innerWidth`.

**What I changed:**
- Accepted the overflow assertion logic — it was exactly right.
- Rejected adding any tolerance (e.g. `scrollWidth <= clientWidth + 5`). Claude briefly suggested this "to reduce flakiness." A tolerance would have hidden the 6px overflow at 768px entirely. If there's overflow, the test should fail and the product team should fix it — not the test.
- Kept the diagnostic logging but wrapped it in a try/catch so a DOM query failure doesn't obscure the actual assertion failure.
- Both tests now fail correctly: **US-017 → 400px document at 375px viewport (25px overflow)** and **US-018 → 774px document at 768px viewport (6px overflow)**. These are BUG-008 and BUG-009 respectively.

---

## Prompt #4 — Careers page: category classification and Keka destination (BUG-006 / BUG-007)

**What I asked:**
> "Write two Playwright tests for the /careers page. First: verify the Shopify Developer vacancy is NOT categorized under 'Business Development'. Second: verify the 'Apply for role' link for the Shopify Developer role leads to an active Keka page rather than a missing-job state."

**What Claude did:**
For the first test, located the Shopify Developer card with `page.locator('text=Shopify Developer')` and then read `innerText()` of its parent container to check for the string `Business Development`. For the second test, it tried to find an anchor that was an ancestor of the `Shopify Developer` heading.

**What I changed:**
- Accepted the category assertion approach for BUG-006. Running the test confirmed the job card's container does contain the text `Business Development` alongside the Shopify Developer role — the defect is real. I kept the test failing intentionally. **Test US-013 / BUG-006 remains a failing regression test.**
- Rejected the ancestor-anchor approach for BUG-007. Playwright's element snapshot showed the `Apply for role` link is a sibling element in the card container, not an ancestor of the heading. I reworked the locator to find the card container first, then locate the `Apply for role` link by its accessible name within that container.
- Added an explicit navigation to the Keka destination and checked for a missing-job indicator in the page content. The test passed — the destination is currently live. BUG-007 is retained as regression coverage, not flagged as a current defect.

---

## Prompt #5 — Security headers test (SEC-001 / BUG-SEC-001)

**What I asked:**
> "Write a Playwright test that makes a plain HTTP request to https://techdome.io, reads the response headers, and asserts the presence of: Strict-Transport-Security, Content-Security-Policy, and X-Frame-Options. If any are missing, fail with a single consolidated message listing all absent headers."

**What Claude did:**
Initially produced three separate `expect` calls, one per header. Each would fail independently and stop the test at the first missing header, so you'd only ever see one failure message per run.

**What I changed:**
- Rejected the three separate assertions. Collecting all missing headers and failing once with a combined message is strictly better: a single run tells you everything that's missing rather than requiring re-runs to discover each absent header.
- Rewrote the assertion to collect missing headers into an array and call `expect(missing).toHaveLength(0)` once with a descriptive message.
- Accepted Claude's suggestion to use `page.request.get()` rather than a full browser navigation — it's faster and sufficient for header inspection.
- The test now fails with the message: **`Missing recommended security headers: Content-Security-Policy`**. HSTS and X-Frame-Options are present. This is **BUG-SEC-001** — a genuine security-hardening gap, not a Claude output artefact.

---

## Prompt #6 — Script injection test (SEC-002)

**What I asked:**
> "Write a non-destructive Playwright test that submits a script-like payload (`<script>alert(1)</script>`) into the Techdome newsletter subscription input and asserts the input is not executed as JavaScript in the browser."

**What Claude did:**
Generated a test that typed the payload into the email input, submitted the form, and then asserted `page.evaluate(() => typeof window.__xss_triggered__)` was `undefined`.

**What I changed:**
- Accepted the `window.__xss_triggered__` sentinel approach — it's a well-known non-destructive XSS probe pattern.
- Added an explicit note in the test description that this tests **one specific input path with one specific payload** and passing this test is not represented as a comprehensive XSS assessment or penetration test.
- Did not add any assertion on whether the form accepted or rejected the input as a subscription — that's a separate concern (BUG-001). The scope of this test is only execution, not validation behavior.
- **Test SEC-002 passes.** The payload was not executed.

---

## Prompt #7 — Calendly iframe test (US-007 / BUG-003)

**What I asked:**
> "The Techdome /contact page embeds a Calendly widget inside an iframe. Write a Playwright test that confirms the Calendly iframe loads, then locates the privacy acknowledgement inside the iframe using frameLocator, and asserts it is visible before any interaction."

**What Claude did:**
First produced a locator that searched for the privacy acknowledgement text directly on the parent page — `page.locator('text=I understand')`. This would find nothing because the content is inside the iframe.

**What I changed :**
- Rejected the parent-page locator immediately. A Playwright snapshot of the contact page confirmed the Calendly content renders inside an `<iframe>` with a `src` pointing to `calendly.com`. Any locator on the parent page cannot see iframe-internal content.
- Corrected to `page.frameLocator('iframe[src*="calendly.com"]').getByRole('button', { name: /I understand/i })`.
- This correction also clarifies BUG-003: the original manual observation (privacy notice disappearing during scroll) is a behavioral issue inside the Calendly embed, not a Playwright locator problem. The test now correctly isolates Calendly's iframe and the **test passes** — the notice is visible on load. The scroll-disappearance behavior requires a separate, more targeted investigation inside the iframe scroll context.

---

## Prompt #8 — Load test with exactly 5 concurrent users (LOAD-001)

**What I asked:**
> "Implement a Playwright load test that fires exactly 5 concurrent API request contexts simultaneously — each hitting / and /contact in sequence. Measure response times per request, calculate min, average, max, and p95, and assert: (1) zero HTTP 5xx responses, (2) p95 < 3000ms. Hard constraint: never exceed 5 concurrent users."

**What Claude did:**
Suggested using `Promise.all` with an array of 5 `request.newContext()` calls, each making 2 requests sequentially. Produced timing logic using `Date.now()` before and after each `apiRequestContext.get()`. Calculated p95 by sorting the times array and reading the 95th-percentile index.

**What I changed :**
- Accepted the `Promise.all` + `request.newContext()` pattern. It correctly models 5 concurrent users without opening browser windows, and stays within the constraint.
- Verified the concurrency explicitly: `Promise.all` launches all 5 contexts in the same event-loop tick — they are genuinely concurrent, not sequential.
- Rejected Claude's first p95 calculation which used `Math.ceil(times.length * 0.95) - 1` as the index. For 10 data points this produces index 9 (the maximum), which is technically correct but semantically identical to `max` with this sample size. Kept it but added a comment acknowledging the sample size limitation.
- Added per-user, per-route logging to the test output so results can be pasted directly into `docs/load-test-results.md` without manual reformatting.
- Set `workers: 1` in the load project config to ensure Playwright itself doesn't introduce additional parallelism beyond the 5 `Promise.all` branches.

**Measured result:** p95 = **2379ms**, average = **874ms**, 0 × 4xx, 0 × 5xx. **LOAD-001 PASSES.**

---

## Prompt #9 — Newsletter integration test (US-019)

**What I asked:**
> "Write an integration test that intercepts the outgoing network request when the newsletter subscription form is submitted with a valid email, and asserts the request payload contains an email field and targets an expected endpoint."

**What Claude did:**
Used `page.route()` to intercept and inspect the outgoing request, asserting on the request body and URL.

**What I changed :**
- Accepted the approach. `page.route()` is the right Playwright mechanism for asserting on outbound payload structure without depending on the server response.
- Added `page.waitForRequest()` as a fallback in case the route handler fires before the assertion is ready — Claude's initial version had a race condition where the request could fire before the route was registered if navigation happened too quickly.
- The test captures the subscription request structure. **US-019 passes.**

---

## Prompt #10 — Newsletter invalid-email test (US-009 / BUG-001)

**What I asked:**
> "Write a test that submits a clearly malformed email (e.g. 'notanemail@@') into the newsletter subscription and asserts the form does NOT silently succeed — either a validation error appears, or the submission is visibly rejected."

**What Claude did:**
Suggested asserting `expect(page.locator('.error-message')).toBeVisible()` after submission.

**What I changed :**
- Rejected the hardcoded `.error-message` class selector. There is no guarantee the Techdome newsletter form uses that class — using it would produce a false failure even if the form correctly rejects the input via a different UI pattern.
- Rewrote to assert that no success confirmation appears within 3 seconds of submitting the invalid input, rather than asserting a specific error element exists.
- The test **passes** — the invalid email does not trigger a visible success state in the automated flow. However, BUG-001 was **manually observed**: an invalid email was processed without rejection in the live flow. The automated test covers the "no false success" assertion; the manual finding covers the missing validation message. Both are retained separately in the bug report.

---

## General principle applied throughout

AI-generated code was treated as a first draft, not ground truth. Every selector was cross-checked against Playwright element snapshots or live DOM inspection before being committed. Product assertions were never weakened to make a test green — if the assertion exposed a real gap in the product, the test was kept failing and the finding was logged as a bug. Conversely, when a test failed due to a framework or selector problem (not a product problem), the implementation was fixed rather than the assertion softened.

The four tests that currently fail — **US-013 (BUG-006)**, **US-017 (BUG-008)**, **US-018 (BUG-009)**, and **SEC-001 (BUG-SEC-001)** — all reflect genuine product issues confirmed independently of the AI-generated code.
