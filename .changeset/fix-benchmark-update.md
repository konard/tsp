---
'tsp-algorithms': patch
---

Fix benchmark data updating race condition in CI/CD

- Fix CI race condition where benchmark push fails when another job pushes first
- Add git pull --rebase before push in update-benchmarks workflow step
- Use fetch-depth: 0 for full clone to support rebase

Fixes #42
