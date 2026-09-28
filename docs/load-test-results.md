# Techdome Load Test Results

## Test ID
`LOAD-001 | exactly 5 concurrent users should access homepage and contact page`

## Objective
Validate a lightweight load scenario with exactly five concurrent virtual users accessing the Techdome homepage and Contact page, while checking for server errors and the agreed p95 response-time threshold.

## Configuration
- Concurrent virtual users: **5**
- Routes: `/` and `/contact`
- Requests per virtual user: **2**
- Total requests: **10**
- Playwright workers: **1**
- Execution style: HTTP/API request contexts
- Acceptance criteria:
  - Exactly 5 concurrent users
  - HTTP 5xx responses = 0
  - p95 response time < 3000 ms

## Request Results
| User | Route | HTTP status | Duration |
|---:|---|---:|---:|
| 1 | `/` | 200 | 717 ms |
| 1 | `/contact` | 200 | 582 ms |
| 2 | `/` | 200 | 676 ms |
| 2 | `/contact` | 200 | 519 ms |
| 3 | `/` | 200 | 703 ms |
| 3 | `/contact` | 200 | 644 ms |
| 4 | `/` | 200 | 760 ms |
| 4 | `/contact` | 200 | 583 ms |
| 5 | `/` | 200 | 1180 ms |
| 5 | `/contact` | 200 | 2379 ms |

## Summary
| Metric | Result |
|---|---:|
| Concurrent users | 5 |
| Total requests | 10 |
| Minimum response time | 519 ms |
| Average response time | 874.30 ms |
| Maximum response time | 2379 ms |
| P95 response time | 2379 ms |
| HTTP 4xx | 0 |
| HTTP 5xx | 0 |

## Result
**PASS**

All 10 requests returned HTTP 200. No HTTP 4xx or 5xx responses were observed. The measured p95 response time was **2379 ms**, which is below the **3000 ms** acceptance threshold.

## Observation
The slowest request was User 5's `/contact` request at **2379 ms**. It remained within the defined threshold but was noticeably slower than most other requests.

## Scope / Limitation
This is a lightweight assessment load check limited to exactly five concurrent users. It should not be interpreted as a production capacity, stress, soak, or scalability test.
