# Techdome QA Assessment

A Playwright + TypeScript automation framework created for the **Techdome QA Technical Assessment**.

The project covers functional end-to-end testing, integration testing, responsive UI validation, security checks, and a lightweight load test against the Techdome website.

The assessment focuses not only on automated execution, but also on identifying genuine application issues, documenting findings, maintaining traceability between user stories and tests, and organizing the framework using reusable Page Objects and utilities.

---

## Tech Stack

* Playwright
* TypeScript
* Node.js
* Chromium
* Page Object Model (POM)
* Playwright HTML Reporter
* Git / GitHub

---

## Project Structure

```text
techdome-sdet-assessment/
│
├── pages/
│   ├── HomePage.ts
│   ├── NewsletterPage.ts
│   ├── CareersPage.ts
│   └── ContactPage.ts
│
├── tests/
│   ├── e2e/
│   │   ├── homepage.spec.ts
│   │   ├── navigation.spec.ts
│   │   ├── newsletter.spec.ts
│   │   ├── case-studies.spec.ts
│   │   ├── contact.spec.ts
│   │   ├── careers.spec.ts
│   │   ├── links.spec.ts
│   │   └── responsive.spec.ts
│   │
│   ├── integration/
│   │   ├── newsletter-api.spec.ts
│   │   ├── careers-links.spec.ts
│   │   └── network.spec.ts
│   │
│   ├── security/
│   │   ├── headers.spec.ts
│   │   ├── injection.spec.ts
│   │   └── data-exposure.spec.ts
│   │
│   └── load/
│       └── load.spec.ts
│
├── utils/
│   ├── network.utils.ts
│   ├── responsive.utils.ts
│   ├── security.utils.ts
│   └── performance.utils.ts
│
├── docs/
│   ├── bugs.md
│   ├── user-story-map.md
│   ├── load-test-results.md
│   └── claude-code-log.md
│
├── evidence/
│
├── playwright.config.ts
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

# Test Coverage

The framework is divided into four primary testing layers.

## 1. End-to-End Testing

The E2E suite validates important user journeys and UI behavior across the Techdome website.

Coverage includes:

* Homepage behavior
* Navigation
* Newsletter functionality
* Case studies
* Contact / Calendly scheduling
* Careers
* External and internal links
* Responsive behavior
* Mobile viewport validation
* Tablet viewport validation

---

## 2. Integration Testing

Integration tests validate interactions between Techdome and related services or application endpoints.

Coverage includes:

* Newsletter-related integration behavior
* Careers application links
* Shopify Developer job destination
* First-party network requests
* Core route availability

External destinations are validated separately from the UI so broken integrations can be distinguished from frontend issues.

---

## 3. Security Testing

The security suite contains lightweight, non-destructive security validation.

Coverage includes:

### HTTP Security Headers

The homepage is checked for:

* `Strict-Transport-Security`
* `Content-Security-Policy`
* `X-Frame-Options`

During testing:

```text
Strict-Transport-Security   PRESENT
Content-Security-Policy    MISSING
X-Frame-Options            PRESENT
```

The missing `Content-Security-Policy` header is documented as a security-hardening finding.

This finding should not be interpreted by itself as proof of an exploitable XSS vulnerability.

### Input Injection Check

A controlled script-like input is used to verify that the tested newsletter input path does not immediately execute user-controlled JavaScript.

### Sensitive Data Exposure

Public page content is checked for obvious credential patterns such as:

* Private keys
* Bearer tokens
* Hardcoded passwords
* AWS secret access keys

These tests are intentionally non-destructive.

---

# Responsive Testing

Responsive tests validate that the document does not unexpectedly exceed the configured viewport width.

The automated suite checks:

### Mobile

```text
Viewport: 375px
```

### Tablet

```text
Viewport: 768px
```

Horizontal overflow detected by these tests is retained as a failing regression rather than weakening the assertions to force the suite green.

Detailed findings are documented in:

```text
docs/bugs.md
```

---

# Load Testing

A lightweight load test was implemented using Playwright API request contexts.

## Scenario

Exactly **5 concurrent virtual users** access:

```text
/
↓
/contact
```

Each virtual user performs two sequential requests.

Therefore:

```text
5 users × 2 requests = 10 total requests
```

The test intentionally does not exceed five concurrent virtual-user flows.

## Acceptance Criteria

```text
Concurrent users = exactly 5
HTTP 5xx responses = 0
P95 response time < 3000 ms
```

## Recorded Result

| Metric                |    Result |
| --------------------- | --------: |
| Concurrent Users      |         5 |
| Total Requests        |        10 |
| Minimum Response Time |    519 ms |
| Average Response Time | 874.30 ms |
| Maximum Response Time |   2379 ms |
| P95 Response Time     |   2379 ms |
| HTTP 4xx              |         0 |
| HTTP 5xx              |         0 |
| Result                |      PASS |

All 10 requests returned HTTP `200`.

The slowest observed request was `/contact` at **2379 ms**, which remained within the defined 3000 ms threshold.

These measurements represent the recorded assessment execution and should not be interpreted as production-scale capacity or stress-test results.

Full results are available in:

```text
docs/load-test-results.md
```

---

# Defect Handling

The framework intentionally keeps regression assertions that expose genuine application issues.

A failing test is therefore not automatically considered an automation failure.

Failures are classified as:

```text
Test Failure
    │
    ├── Reproducible application/security finding
    │       ↓
    │   Retain assertion
    │   Document defect
    │   Attach evidence where available
    │
    └── Automation/framework issue
            ↓
        Correct automation
        Re-run test
```

This distinction prevents product defects from being hidden simply to obtain a fully green test suite.

---

# Selected Findings

The assessment identified findings including:

### Careers Categorization

The **Shopify Developer** vacancy was observed under the **Business Development** category.

An automated regression test validates this behavior.

### Shopify Developer Destination

The Shopify Developer application destination had been observed as unavailable during exploratory testing.

During the latest automated integration execution, however, the destination was reachable and the missing-job state was not detected.

The regression test is retained to detect recurrence.

### Responsive Layout

Horizontal overflow was detected at the tested mobile and tablet breakpoints.

### Security Headers

The homepage response contained HSTS and X-Frame-Options headers, while a `Content-Security-Policy` response header was not observed during the automated check.

### Calendly Privacy Notice

A privacy-notice behavior was identified during exploratory testing. Automated coverage was added to validate whether the acknowledgement remains available until the user explicitly acknowledges it.

See the latest execution status and evidence in `docs/bugs.md`.

---

# Documentation

Detailed assessment documentation is available under `docs/`.

## Bug Report

```text
docs/bugs.md
```

Contains:

* Bug IDs
* Severity
* Reproduction steps
* Expected results
* Actual results
* Reproduction status
* Automation coverage
* Evidence references

## User Story Map

```text
docs/user-story-map.md
```

Maps user journeys and requirements to automated coverage.

## Load Test Results

```text
docs/load-test-results.md
```

Contains the configuration, request-level measurements, acceptance criteria, observations, and recorded result of the 5-user load test.

## Claude Code Log

```text
docs/claude-code-log.md
```

Documents AI-assisted development activity associated with the assessment.

---

# Setup

## Prerequisites

Install:

* Node.js
* npm
* Git

Verify:

```bash
node --version
npm --version
git --version
```

---

## Clone Repository

```bash
git clone <repository-url>
cd techdome-sdet-assessment
```

---

## Install Dependencies

```bash
npm ci
```

Install Playwright browsers:

```bash
npx playwright install
```

---

# Running Tests

## List Tests

Before execution, test discovery can be verified with:

```bash
npx playwright test --list
```

---

## Run Complete Suite

```bash
npx playwright test
```

---

## Run E2E Tests

```bash
npx playwright test tests/e2e --project=chromium
```

---

## Run Integration Tests

```bash
npx playwright test tests/integration --project=chromium
```

---

## Run Security Tests

```bash
npx playwright test tests/security --project=chromium
```

---

## Run Load Test

The load test should be executed with one Playwright worker:

```bash
npx playwright test tests/load/load.spec.ts \
  --project=chromium \
  --workers=1
```

The load scenario itself creates exactly five concurrent virtual-user flows.

---

## Run a Specific Test

Example:

```bash
npx playwright test tests/e2e/careers.spec.ts --project=chromium
```

---

# Playwright Report

After execution, open the HTML report using:

```bash
npx playwright show-report
```

The report can contain:

* Test results
* Assertion failures
* Screenshots
* Traces
* Videos

depending on the configured Playwright evidence settings.

---

# Debugging

Run a test in headed mode:

```bash
npx playwright test tests/e2e/careers.spec.ts \
  --project=chromium \
  --headed
```

Run using Playwright debug mode:

```bash
npx playwright test tests/e2e/careers.spec.ts \
  --project=chromium \
  --debug
```

Inspect a saved trace:

```bash
npx playwright show-trace path/to/trace.zip
```

---

# Framework Design

The framework separates responsibilities between tests, Page Objects, and utilities.

```text
SPEC
 │
 ├── Page Object
 │      └── Page-specific locators and user interactions
 │
 └── Utilities
        └── Reusable technical and diagnostic logic
```

### Page Objects

Page Objects encapsulate page-specific interactions and locators.

### Utilities

Reusable technical logic is separated into:

```text
network.utils.ts
responsive.utils.ts
security.utils.ts
performance.utils.ts
```

This keeps test specifications focused primarily on scenario intent and assertions.

---

# Test Evidence

Evidence is organized separately from test implementation.

```text
evidence/
├── bugs/
├── responsive/
├── security/
└── load/
```

Where applicable, findings in `docs/bugs.md` reference the corresponding evidence.

Generated Playwright artifacts such as `test-results/` and `playwright-report/` are excluded from source control unless intentionally retained as assessment evidence.

---

# Notes

* Tests are written in TypeScript using Playwright.
* Chromium is used as the primary assessment browser.
* Third-party integrations may change independently of the Techdome website.
* External job destinations can therefore produce different results between executions.
* Performance measurements can vary based on network conditions, server state, and execution environment.
* Security checks included here are lightweight assessment checks and do not constitute a complete penetration test.
* Known application defects are not suppressed merely to produce a fully passing suite.

---

# Author

**Shruti Singh**

SDET / QA Automation Assessment
Techdome
