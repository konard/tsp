# Case Study: Issue #40 - README screenshot is not updated

## Problem Statement

The README screenshot was not being updated after deployment. The CI/CD pipeline's `update-screenshot` job successfully generated a new `screenshot.png` but failed to push it to the repository. Additionally, the README referenced the screenshot using a relative path, which links to the GitHub HTML viewer page rather than the raw image file.

## Timeline

1. **2026-01-31T00:44:10Z**: CI/CD pipeline triggered on push to `main` (commit `212f2ee`)
2. **2026-01-31T00:44:14Z**: `Detect Changes` job completed — detected code changes in UI components, i18n, styles, and tests
3. **2026-01-31T00:45:XX**: `lint`, `build`, and `test` jobs ran in parallel
4. **2026-01-31T00:46:XX**: `deploy` job deployed to GitHub Pages successfully
5. **2026-01-31T00:46:26Z**: `update-screenshot` job started
6. **2026-01-31T00:47:07Z**: Screenshot generated successfully (`screenshot.png` created)
7. **2026-01-31T00:47:14Z**: Screenshot committed locally as `77860f8`
8. **2026-01-31T00:47:17Z**: **Push REJECTED** — `! [rejected] main -> main (fetch first)`
9. Concurrently, the `release` job had pushed a version bump commit to `main`, causing the rejection

## Root Cause Analysis

### Primary Issue: Race Condition Between CI Jobs

The `update-screenshot` and `release` jobs both have write access to `main` and can run concurrently after the `deploy` job completes. The CI workflow structure:

```
detect-changes → lint ──→ test ──→ deploy → update-screenshot
                  │                    │
                  └──────→ release ←───┘ (also pushes to main)
```

When the `release` job pushes a version bump commit to `main` before `update-screenshot` attempts its push, the screenshot push fails because the local checkout is behind the remote.

**Key evidence from CI logs (run 21535682377):**

```
Update README Screenshot  2026-01-31T00:47:17.1865618Z To https://github.com/konard/tsp
Update README Screenshot  2026-01-31T00:47:17.1866251Z  ! [rejected]  main -> main (fetch first)
Update README Screenshot  2026-01-31T00:47:17.1882251Z hint: Updates were rejected because the remote contains work that you do not
Update README Screenshot  2026-01-31T00:47:17.1883298Z hint: have locally.
```

The checkout used `fetch-depth: 1` (shallow clone), so it had no way to rebase onto the newly pushed release commit.

### Secondary Issue: README Image URL

The README used a relative path for the screenshot:

```markdown
![TSP Visual Solver](screenshot.png)
```

On GitHub, this generates an HTML page URL like `https://github.com/konard/tsp/blob/main/screenshot.png` which wraps the image in the GitHub file viewer. The raw image URL should be used instead: `https://raw.githubusercontent.com/konard/tsp/main/screenshot.png`.

## Solution

### Fix 1: Add `git pull --rebase` Before Push

Modified the `update-screenshot` workflow step to:

1. Use `fetch-depth: 0` (full clone) instead of the default shallow clone
2. Add `git pull --rebase origin main` before `git push`

This ensures the screenshot commit is rebased on top of any commits pushed by the concurrent `release` job.

### Fix 2: Use Raw Image URL in README

Changed the README screenshot reference from:

```markdown
![TSP Visual Solver](screenshot.png)
```

To:

```markdown
![TSP Visual Solver](https://raw.githubusercontent.com/konard/tsp/main/screenshot.png)
```

This ensures the image is loaded directly from the raw content URL, not wrapped in a GitHub HTML page.

## Lessons Learned

1. **Concurrent CI jobs that push to the same branch create race conditions.** When multiple jobs need to push to the same branch, they should either be serialized or handle push rejections with pull-rebase-retry logic.

2. **Shallow clones cannot rebase.** Using `fetch-depth: 1` prevents `git pull --rebase` from working properly. Jobs that need to push after potential concurrent changes should use `fetch-depth: 0`.

3. **Use raw URLs for images in README files.** GitHub's relative path resolution for images goes through the HTML file viewer, which adds unnecessary overhead and may cause issues for external consumers. Raw URLs (`raw.githubusercontent.com`) serve the image directly.

## References

- [GitHub Actions: Checkout action fetch-depth](https://github.com/actions/checkout#fetch-all-history-for-all-tags-and-branches)
- [Git push rejected: fetch first](https://git-scm.com/docs/git-push#_note_about_fast_forwards)
- [GitHub raw content URLs](https://docs.github.com/en/repositories/working-with-files/using-files/viewing-a-file#viewing-or-copying-the-raw-file-content)
- CI run with failure: https://github.com/konard/tsp/actions/runs/21535682377/job/62060883877
