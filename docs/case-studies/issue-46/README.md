# Case Study: Issue #46 - What went wrong with our benchmarks CI/CD?

## Problem Statement

Multiple CI/CD pipeline runs on the `main` branch were failing with three distinct but interrelated issues:

1. **npm publish failing with E404** - The Release job's "Publish to npm" step consistently failed with `npm error code E404` when attempting to publish `tsp-algorithms@0.5.0`
2. **Changeset package name mismatch** - Some changesets referenced `my-package` instead of the actual package name `tsp-algorithms`, causing `changeset version` to error with "Found changeset for package my-package which is not in the workspace"
3. **Screenshot commit race condition** - The "Update README Screenshot" job failed with `error: cannot pull with rebase: You have unstaged changes` due to concurrent modifications to the working tree

These failures cascaded: the Release failure caused the "Update Benchmarks" job to be cancelled, meaning benchmark results were never updated.

## Timeline of Events

### Phase 1: Initial Failures (2026-01-30)

| Time (UTC) | Event                                                                                                                                           | Run ID    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 12:36:17   | PR #17 merged to main                                                                                                                           | -         |
| 12:45:08   | CI run: `changeset version` bumps to 0.5.0, but publish fails with E404                                                                         | (implied) |
| 13:03:33   | Commit `956adf5`: "Add CI timeout configuration and improve E2E test resilience" with changeset `merged-quick-frog.md` referencing `my-package` | -         |

### Phase 2: Repeated Failures (2026-01-31)

| Time (UTC)   | Event                                                                                                                                                                            | Run ID          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| 00:44:04     | PR #38 merged (`212f2ee`)                                                                                                                                                        | -               |
| 00:44:07     | **CI FAILURE**: `changeset version` errors on `merged-good-frog` changeset for `my-package` not in workspace; npm publish E404                                                   | 21535682377     |
| 19:29:17     | PR #39 merged (`200f68e`)                                                                                                                                                        | -               |
| 19:29:20     | **CI FAILURE**: `changeset version` errors on `merged-wise-leaf` changeset for `my-package`; npm publish E404                                                                    | 21549710862     |
| 19:30:46     | Version commit `84d0a46`: 0.5.0 (duplicate)                                                                                                                                      | -               |
| 19:35:54     | PR #41 merged (`33c1afc`)                                                                                                                                                        | -               |
| 19:35:57     | **CI FAILURE**: npm publish E404 for `tsp-algorithms@0.5.0` (changeset error was gone for this run)                                                                              | 21549792782     |
| 19:37:17     | Version commit `f722c30`: 0.5.0 (duplicate)                                                                                                                                      | -               |
| 19:38:04     | Screenshot update commit `b84cb5a` succeeds                                                                                                                                      | -               |
| 20:19:43     | PR #43 merged (`ec0ba03`)                                                                                                                                                        | -               |
| 20:19:46     | **CI FAILURE**: `changeset version` errors on `merged-quick-apple` for `my-package`; npm publish E404                                                                            | 21550340423     |
| 20:21:03     | Version commit `df443a3`: 0.5.0 (duplicate)                                                                                                                                      | -               |
| 20:21:45     | Benchmark update commit `a40737f` succeeds this time                                                                                                                             | -               |
| 20:21:50     | Screenshot update commit `a87373c` succeeds this time                                                                                                                            | -               |
| 22:18:21     | PR #45 merged (`2f3a1e2`)                                                                                                                                                        | -               |
| **22:18:24** | **CI FAILURE (referenced in issue)**: npm publish E404 with "Access token expired or revoked"; screenshot commit fails with "cannot pull with rebase: You have unstaged changes" | **21551846736** |
| 22:19:46     | Version commit `620787f`: 0.5.0 (yet another duplicate)                                                                                                                          | -               |

### Key Observation

The version `0.5.0` was committed to main **at least 6 times** (commits `9902209`, `ffa1516`, `84d0a46`, `f722c30`, `df443a3`, `620787f`) because:

1. Each CI run's `changeset version` step bumps the version and commits it
2. The subsequent `npm publish` step fails
3. On the next merge, the changesets are still present (they weren't consumed by a successful publish)
4. The cycle repeats with another version bump to the same 0.5.0

## Root Cause Analysis

### Root Cause 1: npm Publish E404 - Package Never Published, OIDC Not Configured

**Error message:**

```
npm error 404 Not Found - PUT https://registry.npmjs.org/tsp-algorithms - Not found
npm notice Access token expired or revoked. Please try logging in again.
npm notice Security Notice: Classic tokens have been revoked.
```

**Analysis:**

The package `tsp-algorithms` has **never been published to npm**. As of 2026-02-01, running `npm view tsp-algorithms` returns E404. This is the fundamental blocker.

npm's OIDC trusted publishing requires the package to **already exist** on the npm registry before it can be configured. This is a [known limitation](https://github.com/npm/cli/issues/8544) - unlike PyPI, npm does not support configuring OIDC for packages that don't yet exist.

The CI/CD pipeline correctly:

- Uses Node.js 20.x with npm upgraded to 11.8.0 (>= 11.5.1 requirement met)
- Has `id-token: write` permission for OIDC
- Has `registry-url: 'https://registry.npmjs.org'` configured

But without the package existing on npm and OIDC trusted publishing configured in the npm package settings, the OIDC handshake fails silently and npm treats the request as unauthenticated, resulting in a misleading E404.

**Additional issue:** The `NODE_AUTH_TOKEN` environment variable is set by `actions/setup-node@v4` with a value of `XXXXX-XXXXX-XXXXX-XXXXX` (the `${{ secrets.GITHUB_TOKEN }}` placeholder). For OIDC trusted publishing, `NODE_AUTH_TOKEN` [should not be set at all](https://dev.to/zhangjintao/from-deprecated-npm-classic-tokens-to-oidc-trusted-publishing-a-cicd-troubleshooting-journey-4h8b) - its presence can interfere with the OIDC flow, causing npm to attempt token-based auth instead.

### Root Cause 2: Changeset Package Name Mismatch (`my-package`)

**Error message:**

```
Error: Found changeset merged-good-frog for package my-package which is not in the workspace
```

**Analysis:**

The file `scripts/publish-to-npm.mjs` contains a template placeholder on line 35:

```javascript
const PACKAGE_NAME = 'my-package';
```

This was never updated from the template default to `'tsp-algorithms'`. While this constant is used for verification checks (not the changeset itself), the real issue is that **changesets were created with the wrong package name**.

The changeset file `.changeset/merged-quick-frog.md` (still present in the repository) contains:

```yaml
---
'my-package': minor
---
Add CI timeout configuration and improve E2E test resilience
```

This happened because the changeset was created (likely by an automated AI agent) using the `PACKAGE_NAME` constant from the publish script template, rather than the actual package name `tsp-algorithms` from `package.json`. All other changesets correctly reference `'tsp-algorithms'`.

When `changeset version` encounters a changeset for a package not in the workspace, it throws an error and fails to version any packages. The CI workflow's `version-and-commit.mjs` script catches this but proceeds anyway, leading to the publish attempt with the existing version.

### Root Cause 3: Screenshot Commit Race Condition (Recurring)

**Error message:**

```
error: cannot pull with rebase: You have unstaged changes.
error: Please commit or stash them.
```

**Analysis:**

The `update-screenshot` job workflow step (lines 349-359 of `release.yml`):

```bash
git commit -m "Update README screenshot [skip ci]"
git pull --rebase origin main
git push
```

The commit succeeds, but `git pull --rebase` fails because there are unstaged changes in the working directory. These unstaged changes come from:

1. The `bun install` step earlier in the job modifies `node_modules/` files
2. The `bun run build` step generates files in `dist/`
3. The `bun run scripts/generate-screenshot.mjs` step may modify additional files

After the `git commit` (which only staged `screenshot.png`), these other modified files remain unstaged. When `git pull --rebase` detects unstaged changes, it refuses to proceed.

This is the same race condition documented in [Issue #40](../issue-40/README.md), but with a different failure mode. The fix from Issue #40 (adding `git pull --rebase`) introduced this new failure when unstaged changes are present.

The `update-benchmarks` job has the same pattern and is vulnerable to the same issue, though it happened to succeed in some runs.

## Impact

1. **No npm releases**: Version 0.5.0 was never published to npm despite 6+ version bump commits
2. **Benchmark updates intermittent**: Sometimes succeeded, sometimes cancelled due to Release job failure
3. **Screenshot updates intermittent**: Sometimes succeeded, sometimes failed due to race condition
4. **Repository pollution**: Multiple identical `0.5.0` version bump commits cluttering the git history
5. **Stale changesets accumulating**: Failed changesets persist and cause errors in subsequent runs

## Proposed Solutions

### Solution 1: Initial npm Publish (Critical - Unblocks Everything)

The package must first be published manually to npm before OIDC trusted publishing can work.

**Option A: Manual first publish**

```bash
cd /path/to/tsp
npm login
npm publish --access public
```

**Option B: Use setup-npm-trusted-publish tool**

```bash
npx setup-npm-trusted-publish tsp-algorithms
```

Reference: [setup-npm-trusted-publish](https://github.com/azu/setup-npm-trusted-publish)

After the package exists on npm, configure OIDC trusted publishing in npm package settings:

- Organization/User: `konard`
- Repository: `tsp`
- Workflow: `release.yml`
- Environment: (leave blank or set as needed)

### Solution 2: Fix the `PACKAGE_NAME` in publish-to-npm.mjs

Update line 35 of `scripts/publish-to-npm.mjs`:

```javascript
// Before:
const PACKAGE_NAME = 'my-package';

// After:
const PACKAGE_NAME = 'tsp-algorithms';
```

### Solution 3: Fix the Broken Changeset

Remove or fix the changeset `.changeset/merged-quick-frog.md` that references `my-package`:

```yaml
# Before:
---
'my-package': minor
---
# After:
---
'tsp-algorithms': minor
---
```

### Solution 4: Fix Screenshot/Benchmark Commit Race Condition

Add `git checkout -- .` or `git stash` before `git pull --rebase` in both the `update-screenshot` and `update-benchmarks` jobs:

```yaml
- name: Commit screenshot if changed
  run: |
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git add screenshot.png
    if git diff --staged --quiet; then
      echo "No screenshot changes to commit"
    else
      git commit -m "Update README screenshot [skip ci]"
      git checkout -- .  # Discard unstaged changes before rebase
      git pull --rebase origin main
      git push
    fi
```

### Solution 5: Remove `NODE_AUTH_TOKEN` for OIDC Publishing

The `actions/setup-node@v4` with `registry-url` automatically sets `NODE_AUTH_TOKEN` in the `.npmrc`. For OIDC trusted publishing, this should be removed or the `.npmrc` should be overwritten to use only OIDC.

Alternatively, remove the `registry-url` parameter from `actions/setup-node@v4` since npm >= 11.5.1 handles OIDC registration internally.

### Solution 6: Add `publishConfig` to package.json

```json
{
  "publishConfig": {
    "access": "public",
    "provenance": true,
    "registry": "https://registry.npmjs.org"
  }
}
```

This ensures consistent publish settings regardless of the CI environment.

## Affected Components

| Component                            | Issue                                | Fix Priority |
| ------------------------------------ | ------------------------------------ | ------------ |
| npm registry (package doesn't exist) | Blocks all publishing                | Critical     |
| `scripts/publish-to-npm.mjs` line 35 | Wrong PACKAGE_NAME placeholder       | High         |
| `.changeset/merged-quick-frog.md`    | References `my-package`              | High         |
| `release.yml` update-screenshot job  | Race condition with unstaged changes | Medium       |
| `release.yml` update-benchmarks job  | Same race condition pattern          | Medium       |
| `release.yml` NODE_AUTH_TOKEN        | May interfere with OIDC flow         | Medium       |
| `package.json`                       | Missing publishConfig                | Low          |

## External Issues to Report

1. **npm/cli#8544** - Already open: "Allow publishing initial version with OIDC". The tsp-algorithms case is another data point for this limitation.
2. The `publish-to-npm.mjs` script template (from link-foundation libraries) ships with a `my-package` placeholder that is easily missed by users.

## Lessons Learned

1. **OIDC trusted publishing requires the package to already exist on npm.** This is a critical prerequisite that is not well-documented in many CI/CD setup guides. A first publish must be done manually or with a granular token.

2. **Template placeholders must be validated.** The `PACKAGE_NAME = 'my-package'` placeholder in `publish-to-npm.mjs` was never updated. Scripts should validate that the package name matches `package.json` at runtime.

3. **`git pull --rebase` fails with unstaged changes.** When CI jobs modify the working tree (via `bun install`, `bun run build`, etc.), any `git pull --rebase` will fail if those changes aren't committed or discarded first.

4. **Repeated version bump commits indicate a broken publish pipeline.** Having 6+ identical `0.5.0` commits is a clear signal that the version-bump-then-publish cycle is broken. The versioning step should be atomic with the publish step, or changesets should only be consumed after a successful publish.

5. **npm's E404 error for authentication failures is misleading.** The actual problem is unauthenticated access (OIDC not configured), but npm returns E404 instead of E401/E403, making diagnosis difficult.

## References

- [npm Trusted Publishing Documentation](https://docs.npmjs.com/trusted-publishers/)
- [npm Classic Tokens Revoked (Dec 2025)](https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/)
- [npm/cli#8544 - Allow publishing initial version with OIDC](https://github.com/npm/cli/issues/8544)
- [NPM Trusted Publishing: The "Weird" 404 Error and the Node.js 24 Fix](https://medium.com/@kenricktan11/npm-trusted-publishers-the-weird-404-error-and-the-node-js-24-fix-a9f1d717a5dd)
- [setup-npm-trusted-publish tool](https://github.com/azu/setup-npm-trusted-publish)
- [From Deprecated npm Classic Tokens to OIDC Trusted Publishing](https://dev.to/zhangjintao/from-deprecated-npm-classic-tokens-to-oidc-trusted-publishing-a-cicd-troubleshooting-journey-4h8b)
- CI run referenced in issue: https://github.com/konard/tsp/actions/runs/21551846736/job/62101821095
- All failed CI run logs: [ci-logs/](./ci-logs/)
