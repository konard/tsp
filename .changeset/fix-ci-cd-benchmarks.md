---
'tsp-algorithms': patch
---

Fix CI/CD benchmarks pipeline failures

- Fix PACKAGE_NAME placeholder in publish-to-npm.mjs ('my-package' -> 'tsp-algorithms')
- Fix changeset merged-quick-frog.md referencing wrong package name
- Fix screenshot/benchmark commit race condition by discarding unstaged changes before rebase
- Add publishConfig to package.json for consistent npm publish settings
