# Techdome SDET Assessment — Bugs & Findings

## Scope
Findings below reflect the latest manual observations and automated Playwright results discussed during the assessment. Items that could not be reproduced in the latest automation run are explicitly marked as such.

## BUG-001 — Newsletter accepts invalid email input
**Area:** Newsletter  
**Type:** Functional / Validation  
**Status:** Manually reproduced  
**Severity:** Medium

### Description
The newsletter subscription flow accepts an invalid or incorrectly formatted email address instead of rejecting it with validation feedback.

### Steps to Reproduce
1. Open the Techdome newsletter subscription flow.
2. Enter an invalid email address.
3. Submit the form.

### Expected Result
The invalid email should be rejected and the user should receive a clear validation message.

### Actual Result
The invalid email is accepted/subscribed.

### Recommended Fix
Validate email format on both client and server side and return a user-friendly validation error for malformed addresses.

---

## BUG-002 — Proof of Execution / Case Studies advances unexpectedly
**Area:** Proof of Execution / Case Studies  
**Type:** UX / Interaction  
**Status:** Manually observed; latest automation requires alignment with the current DOM/interaction design  
**Severity:** Medium

### Description
After refreshing the page and interacting/scrolling around the Proof of Execution / Case Studies section, the displayed case study was observed advancing without an intentional manual case-study navigation action.

### Expected Result
The case study should change only according to the intended interaction model and should not unexpectedly advance because of ordinary page interaction.

### Actual Result
A case study was observed moving to the next state without an explicit case-study navigation action.

### Automation Note
The initial automated implementation relied on an `[aria-current="true"]` element that is not present in the current DOM. This manual finding should not be represented as automation-reproduced until the current scroll-driven behavior is unambiguously mapped to an acceptance criterion.

---

## BUG-003 — Calendly privacy acknowledgement disappears during scrolling
**Area:** Contact / Calendly embed  
**Type:** UX / Third-party integration  
**Status:** Manually observed; automation corrected to operate inside Calendly iframe  
**Severity:** Medium

### Description
A new user opening the Contact scheduling flow sees Calendly's privacy acknowledgement. During the observed flow, scrolling within the Calendly widget caused the acknowledgement UI to disappear without the user explicitly selecting **I understand**.

### Expected Result
The privacy acknowledgement should remain available until the user explicitly acknowledges or dismisses it according to Calendly's intended behavior.

### Actual Result
The acknowledgement was observed disappearing during scrolling.

### Automation Note
Calendly content is rendered inside an iframe. The original parent-page locator was invalid; the regression test must use `frameLocator` before this issue can be classified as automation-reproduced.

---

## BUG-004 — Newsletter dispatch numbering/dates and duplicate titles are inconsistent
**Area:** Newsletter  
**Type:** Content / Data consistency  
**Status:** Manually reproduced  
**Severity:** Medium

### Description
Newsletter dispatch numbering and dates do not follow a clear chronological sequence. Examples observed include a "Latest Edition" labelled Dispatch #15 dated Oct 29, 2024 while Dispatch #01 is dated Jan 1, 2026. Duplicate/similar titles were also observed across different dispatches despite different content.

### Expected Result
Dispatch numbering, publication dates, latest-edition labeling, and titles should be internally consistent and allow users to understand chronology without ambiguity.

### Actual Result
Numbering and dates appear inconsistent, and different dispatches can share the same/similar titles.

---

## BUG-006 — Shopify Developer categorized under Business Development
**Area:** Careers  
**Type:** Functional / Content classification  
**Status:** Reproduced by Playwright  
**Severity:** Medium

### Steps to Reproduce
1. Open `/careers`.
2. Locate the **Shopify Developer** vacancy.
3. Inspect its category/job metadata.

### Expected Result
The Shopify Developer vacancy should be placed under an appropriate engineering/development category rather than Business Development.

### Actual Result
The job card contains **Business Development** together with the Shopify Developer role.

### Automated Evidence
`US-013 | BUG-006 | Shopify Developer should have appropriate category` fails because the Shopify Developer card contains `Business Development`.

---

## BUG-007 — Shopify Developer application destination previously unavailable
**Area:** Careers / Keka  
**Type:** External integration  
**Status:** Not reproducible in latest automation run  
**Severity:** Historical observation

### Original Observation
The Shopify Developer role was advertised on Techdome, but its application destination was observed showing that the job did not exist.

### Latest Automated Result
The careers integration suite passed. Playwright located the Shopify Developer **Apply for role** link, opened the Keka destination, and did not detect a missing-job state.

---

## BUG-008 — Horizontal overflow at 375px mobile viewport
**Area:** Homepage / Responsive layout  
**Type:** Responsive UI  
**Status:** Reproduced by Playwright  
**Severity:** Medium

### Test Conditions
- Viewport: 375 × 812
- Responsive navigation active

### Expected Result
The document width should not exceed the 375px viewport and the page should not introduce unintended horizontal scrolling.

### Actual Result
- Viewport/client width: **375px**
- Document width: **400px**
- Horizontal overflow: **25px**

### Automated Evidence
`US-017` fails because `document.documentElement.scrollWidth` is greater than `clientWidth`.

---

## BUG-009 — Horizontal overflow at 768px tablet viewport
**Area:** Homepage / Responsive layout  
**Type:** Responsive UI  
**Status:** Reproduced by Playwright  
**Severity:** Low–Medium

### Test Conditions
- Viewport: 768 × 1024

### Expected Result
The document width should not exceed the 768px viewport.

### Actual Result
- Viewport/client width: **768px**
- Document width: **774px**
- Horizontal overflow: **6px**

### Automated Evidence
`US-018` fails because the page is wider than the configured viewport.

---

## BUG-SEC-001 — Content-Security-Policy response header missing
**Area:** Security / HTTP headers  
**Type:** Security hardening  
**Status:** Reproduced by Playwright  
**Severity:** Medium

### Expected Result
The homepage should return the recommended security headers checked by the assessment: HSTS, Content-Security-Policy, and X-Frame-Options.

### Actual Result
- `Strict-Transport-Security`: Present (`max-age=63072000; includeSubDomains; preload`)
- `Content-Security-Policy`: **Missing**
- `X-Frame-Options`: Present (`SAMEORIGIN`)

### Impact
A missing CSP removes a defense-in-depth control that can limit the impact of content-injection attacks. This finding alone does **not** prove that the application has an exploitable XSS vulnerability.

### Automated Evidence
`SEC-001 | homepage should expose recommended security headers` fails with `Missing recommended security headers: Content-Security-Policy`.

---

## Current Automated Defect Summary
| Finding                  | Latest automation status |
|--------------------------|--------------------------|
| BUG-006 Careers category | FAIL — defect reproduced |
| BUG-007 Careers destination | PASS — currently not reproducible |
| BUG-008 375px overflow | FAIL — defect reproduced |
| BUG-009 768px overflow | FAIL — defect reproduced |
| BUG-SEC-001 CSP missing | FAIL — finding reproduced |
