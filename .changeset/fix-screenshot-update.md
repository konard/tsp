---
'tsp-algorithms': patch
---

Fix README screenshot update race condition and use raw image URL

- Fix CI race condition where screenshot push fails when release job pushes first
- Add git pull --rebase before push in update-screenshot workflow
- Use fetch-depth: 0 for full clone to support rebase
- Change README screenshot link to raw.githubusercontent.com URL

Fixes #40
