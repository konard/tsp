---
'tsp-algorithms': patch
---

Fix CI/CD release pipeline by correcting PACKAGE_NAME in release scripts

- Fix PACKAGE_NAME placeholder in merge-changesets.mjs ('my-package' -> 'tsp-algorithms')
- Fix PACKAGE_NAME placeholder in create-manual-changeset.mjs ('my-package' -> 'tsp-algorithms')
- Fix PACKAGE_NAME placeholder in format-release-notes.mjs ('my-package' -> 'tsp-algorithms')
- Regenerate bun.lock with correct package name
