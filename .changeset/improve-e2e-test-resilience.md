---
'my-package': patch
---

Add CI timeout configuration and improve E2E test resilience

- Add job-level timeout (15 minutes) and step-level timeout (10 minutes) for E2E tests
- Add health check before E2E tests to fail fast if server or app is not ready
- Share browser instance across tests to eliminate ~30 second overhead per test
- Reduce E2E test runtime from ~52 seconds per test to ~17 seconds total
