# Techdome SDET Assessment — User Story Map

## Goal
Validate the most important public Techdome journeys across functional behavior, external integrations, responsiveness, security, and lightweight performance.

## Journey 1 — Discover Techdome
### US-001 — View the homepage
**As a visitor, I want the homepage to load successfully so that I can understand Techdome's services and value proposition.**

Acceptance criteria:
- Homepage returns a successful response.
- Primary content is visible.
- Core first-party requests do not produce unexpected server failures.

### US-002 — Navigate primary site content
**As a visitor, I want navigation controls and key sections to be accessible so that I can explore the site.**

Acceptance criteria:
- Primary navigation is usable at supported desktop/responsive breakpoints.
- Mobile navigation is available at responsive widths.

## Journey 2 — Explore Proof / Case Studies
### US-005 — Interact with Proof of Execution / Case Studies
**As a prospective customer, I want case-study content to change predictably so that I can review Techdome's proof of execution without unexpected navigation.**

Acceptance criteria:
- Case-study state changes according to the intended interaction design.
- Ordinary interaction should not produce unintended state changes.

Related finding: **BUG-002** — manually observed; current automated selector/acceptance model requires alignment with the current DOM and scroll-driven behavior.

## Journey 3 — Contact Techdome
### US-007 — Use the Calendly scheduling flow
**As a prospective customer, I want the scheduling widget and privacy acknowledgement to behave predictably so that I can book a meeting confidently.**

Acceptance criteria:
- Calendly loads inside the Contact flow.
- Privacy acknowledgement is accessible inside the embedded iframe.
- Acknowledgement behavior should follow explicit user interaction rather than disappear unexpectedly.

Related finding: **BUG-003** — manually observed; iframe-aware regression coverage prepared.

## Journey 4 — Subscribe to Newsletter
### US-009 — Subscribe with a valid email
**As a visitor, I want to subscribe using a valid email address so that I can receive Techdome updates.**

Acceptance criteria:
- Valid email input is accepted.
- Subscription flow communicates success/failure clearly.

### US-010 — Reject invalid newsletter email
**As a visitor, I want invalid email input to be rejected so that I can correct mistakes before subscribing.**

Acceptance criteria:
- Malformed email input is not accepted as a valid subscription.
- Validation feedback is shown.

Related finding: **BUG-001** — invalid email was manually observed being accepted.

### US-011 — Understand newsletter chronology
**As a newsletter reader, I want dispatch numbers, dates, latest-edition labels, and titles to be consistent so that I can understand publication order.**

Acceptance criteria:
- Dispatch numbering and dates are chronologically understandable.
- Latest-edition labeling matches the latest content.
- Distinct editions use unambiguous titles.

Related finding: **BUG-004**.

## Journey 5 — Explore Careers
### US-013 — See a correctly classified vacancy
**As a job seeker, I want each vacancy to appear under an appropriate job category so that I can understand the role quickly.**

Acceptance criteria:
- Shopify Developer is not categorized as Business Development.

Automation status: **FAIL — BUG-006 reproduced.**

### US-014 — Open an active application destination
**As a job seeker, I want an advertised vacancy to lead to an active application page so that I can apply for the role.**

Acceptance criteria:
- Advertised role exposes an application URL.
- External destination is reachable.
- Destination does not show a missing-job state.

Automation status: **PASS.** BUG-007 was previously observed manually but is not reproducible in the latest automated run; regression coverage is retained.

### US-020 — Validate advertised career links
**As a job seeker, I want advertised application links to resolve successfully so that I am not sent to broken destinations.**

Automation status: **PASS** for the current careers integration checks.

## Journey 6 — Use the Site on Responsive Devices
### US-017 — Use homepage at 375px
**As a mobile visitor, I want the homepage to fit a 375px viewport without unintended horizontal scrolling.**

Acceptance criteria:
- `scrollWidth <= clientWidth` at 375px.
- Mobile navigation is available.

Automation status: **FAIL.** 375px viewport produced a 400px document width (**25px overflow**). Related finding: **BUG-008**.

### US-018 — Use homepage at 768px
**As a tablet visitor, I want the homepage to fit a 768px viewport without unintended horizontal scrolling.**

Acceptance criteria:
- `scrollWidth <= clientWidth` at 768px.

Automation status: **FAIL.** 768px viewport produced a 774px document width (**6px overflow**). Related finding: **BUG-009**.

## Journey 7 — Integration Reliability
### US-021 — Avoid first-party network failures
**As a visitor, I want the site to load without first-party server/network failures so that core content remains available.**

Acceptance criteria:
- Homepage responds successfully.
- No unexpected first-party HTTP 5xx responses.
- No unexpected failed first-party requests.

### US-022 — Core routes remain reachable
**As a visitor, I want core public routes to return successful HTTP responses.**

Routes covered include `/`, `/careers`, `/contact`, and `/newsletter`.

## Journey 8 — Security
### SEC-001 — Recommended response headers
**As a security-conscious stakeholder, I want recommended browser security headers to be present so that common browser-side risks have defense-in-depth controls.**

Acceptance criteria:
- HSTS present.
- CSP present.
- X-Frame-Options present.

Automation status: **FAIL** because `Content-Security-Policy` is missing. HSTS and X-Frame-Options are present. Related finding: **BUG-SEC-001**.

### SEC-002 — Script-like input does not execute
**As a visitor, I want untrusted form input to remain data rather than execute as browser script.**

Automation status: **PASS for the tested newsletter input path/payload.** This does not constitute a comprehensive XSS assessment.

### SEC-003 — Public page does not expose obvious private credentials
**As a stakeholder, I want public HTML to avoid obvious private credential patterns.**

Automation status: **PASS for the tested patterns.**

## Journey 9 — Lightweight Load
### LOAD-001 — Five concurrent users access core routes
**As a stakeholder, I want the homepage and Contact route to remain responsive during a small five-user concurrent load check.**

Acceptance criteria:
- Exactly 5 concurrent users.
- 0 HTTP 5xx responses.
- p95 < 3000 ms.

Automation status: **PASS.** p95 = **2379 ms**, average = **874.30 ms**, HTTP 4xx = **0**, HTTP 5xx = **0**.
