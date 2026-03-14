# Case Study: Issue #82 — PR #81 Didn't Trigger GitHub Pages Deploy

## Summary

**Issue**: [GitHub Issue #82](https://github.com/konard/tsp/issues/82)
**Date**: 2026-03-14
**Component**: `.github/workflows/release.yml` — `concurrency` configuration
**Root Cause**: Missing `cancel-in-progress: true` in the workflow concurrency group caused new CI runs to queue (pending) behind a long-running benchmark job from the previous merge, preventing PR #81's deploy from executing.

## Timeline of Events

| Step | Timestamp (UTC)     | Event                                                                                                                                                     |
| ---- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 2026-03-14T21:17:56Z | PR #79 ("Fix tree structure uniform color") merged to `main` (commit `1aaaaab`)                                                                          |
| 2    | 2026-03-14T21:17:59Z | CI run `23096557038` triggered for PR #79 merge on `main`                                                                                                 |
| 3    | 2026-03-14T21:20:37Z | `Update Benchmarks` job started in run `23096557038` (60-minute timeout); `Run benchmarks` step began at 21:20:48                                         |
| 4    | 2026-03-14T21:21:29Z | `Release` job in run `23096557038` failed at `Publish to npm` step (npm OIDC publish error); deploy and screenshot jobs succeeded                        |
| 5    | 2026-03-14T21:52:14Z | PR #81 ("Add Manual Drawing algorithm for interactive TSP tour creation") merged to `main` (commit `7d933ff`)                                             |
| 6    | 2026-03-14T21:52:17Z | CI run `23097119942` triggered for PR #81 merge — immediately entered **pending** state; zero jobs started                                               |
| 7    | —                   | Run `23097119942` remained blocked because run `23096557038`'s `Update Benchmarks` job was still running (benchmark `Run benchmarks` step in_progress)   |
| 8    | 2026-03-14T21:59:06Z | Last observed update of run `23096557038` (still in_progress, benchmarks running)                                                                        |
| 9    | —                   | PR #81's changes never deployed to GitHub Pages; the site remained at the PR #79 version                                                                  |

## CI Run Details

### Run `23096557038` — PR #79 merge (blocking run)

| Job                     | Status      | Duration         | Notes                                                             |
| ----------------------- | ----------- | ---------------- | ----------------------------------------------------------------- |
| Detect Changes          | ✅ success  | ~8s              |                                                                   |
| Build                   | ✅ success  | ~8s              |                                                                   |
| Lint and Format Check   | ✅ success  | ~13s             |                                                                   |
| Test (Bun)              | ✅ success  | ~61s             | Unit + E2E tests with Playwright                                  |
| Deploy to GitHub Pages  | ✅ success  | ~22s             | PR #79 changes deployed                                           |
| Update README Screenshot| ✅ success  | ~45s             |                                                                   |
| Release                 | ❌ failure  | ~52s             | Failed at step 10 "Publish to npm" (npm OIDC error)              |
| **Update Benchmarks**   | 🔄 in_progress | >38 min     | `Run benchmarks` step running since 21:20:48 — holding concurrency lock |

### Run `23097119942` — PR #81 merge (blocked run)

| Status  | Jobs started | Created              | Last updated          |
| ------- | ------------ | -------------------- | --------------------- |
| pending | 0            | 2026-03-14T21:52:17Z | 2026-03-14T21:52:18Z  |

Zero jobs started. The run was queued behind run `23096557038` in the concurrency group `CI/CD and Release-refs/heads/main`.

## Root Cause Analysis

### The Bug

Line 32 of `.github/workflows/release.yml` (before fix):

```yaml
concurrency: ${{ github.workflow }}-${{ github.ref }}
```

GitHub Actions' concurrency feature with this single-value syntax defaults to **queueing** new runs rather than cancelling older ones. When two pushes to `main` occur in quick succession, the second run waits for the first to fully complete before it can start.

The `Update Benchmarks` job has a 60-minute timeout and runs computationally intensive benchmark suites. Any merge that happens while benchmarks are running from a previous merge will be blocked for up to an hour before its deploy can execute.

### Why This Is a Problem

The concurrency group `CI/CD and Release-refs/heads/main` acts as a mutex over all CI runs on `main`. When a new commit is pushed to `main`:

1. A new run is created and enters `pending` state
2. It waits for the currently-running run to finish **all jobs** (including benchmarks)
3. Only then does it start executing its own jobs

This means:
- **Deploy is delayed** by the full duration of the blocking run's longest job
- **Resource waste**: the old run continues running benchmarks for code that has already been superseded
- **User-visible impact**: the site doesn't reflect the latest merged code for up to an hour

### Pattern Recurrence

This exact pattern was previously documented in the [Issue #74 case study](../issue-74/README.md):

> CI run `23090230153` for PR #75 merge commit (`300b770`): **PENDING** — blocked by concurrency group with still-running run

The fix was needed then and remained needed because the underlying concurrency configuration was never corrected.

## The Fix

Changed `.github/workflows/release.yml` line 32 from:

```yaml
concurrency: ${{ github.workflow }}-${{ github.ref }}
```

To:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

Adding `cancel-in-progress: true` causes GitHub Actions to **immediately cancel** any currently-running workflow in the same concurrency group when a new run is queued. This means:

- A new push to `main` immediately starts processing (after cancelling the old run)
- The outdated benchmark run is terminated rather than wasting compute time
- Deploy runs happen promptly for each merge
- PR runs on feature branches are also cancelled when new commits are pushed to the same branch (desirable behavior — no need to test stale code)

### Trade-offs

| Concern | Impact |
| ------- | ------ |
| Benchmark data may not be committed if a new merge arrives mid-run | Acceptable — benchmarks will run again for the new commit |
| In-progress deploy may be cancelled | Acceptable — the new deploy will supersede it |
| npm publish may be interrupted | No risk — `publish-to-npm.mjs` checks if version is already published before attempting |

## Files Modified

| File                              | Change                                                    |
| --------------------------------- | --------------------------------------------------------- |
| `.github/workflows/release.yml`   | Added `cancel-in-progress: true` to concurrency group     |
| `docs/case-studies/issue-82/README.md` | This case study                                      |
