# Changelog

## 0.7.1

### Patch Changes

- c137231: Replace U-fork L-system with boustrophedon meander algorithm
  - Replace incorrect L-system curve generation with boustrophedon meander space-filling curve
  - Implement recursive center embedding: step N+1 embeds circularly-shifted step N in center region
  - Add zigzag spiral path generation for base cases (orders 1-3)
  - Add frame path generation (boustrophedon spiral connecting center to outer perimeter)
  - Regenerate SVG visualizations for steps 1-5 matching all 4 target patterns

## 0.7.0

### Minor Changes

- Add Manual Drawing algorithm for interactive TSP tour creation with mouse, touch, and stylus support, plus SVG download

  Cancel in-progress CI runs when a new commit is pushed to the same branch, preventing deploy delays caused by long-running benchmark jobs blocking subsequent workflow runs

## 0.6.1

### Patch Changes

- bcc25b5: Fix space-filling tree structure to render with uniform color by applying SVG group-level opacity instead of per-element alpha

## 0.6.0

### Minor Changes

- Add U-fork fractal algorithm for solving TSP
  - Implement U-fork fractal (Hilbert curve variant) as a new space-filling curve algorithm
  - L-system with 90-degree turns on 2^n grid pattern
  - Both atomic and progressive (step-by-step visualization) implementations
  - Integrated into CLI with comprehensive test suite

  Rewrite space-filling tree algorithm with proper Z-order curve generation and tree visualization matching the reference pattern, with curve-based progress animation like Moore curve.

  Improve performance benchmarks with 60-second time budget methodology
  - Rewrite benchmark to find max points solvable per algorithm within 60 seconds
  - Use O-notation scaling from 10-point calibration to estimate max points
  - Run 10 random point configurations per test for statistical reliability
  - Measure execution time growth at 50-point intervals
  - Generate SVG graphs for execution time and tour distance
  - Auto-update BENCHMARK.md and README.md with benchmark results
  - Add CI/CD job to run benchmarks on push to main and commit results

  Fix misleading "Tour is already optimal" message and add verification
  - Add brute-force verification algorithm to compute true optimal tour for small point sets (<=12 points)
  - Replace single "Optimize" button with separate "2-opt" and "Zigzag" buttons for independent optimization
  - Show tour distance as percentage of verified optimal distance in visualization header
  - Fix false "already optimal" claims by comparing against brute-force ground truth
  - Rename `solutions` to `solution` and `optimizations` to `optimization` folders
  - Add case study documentation with root cause analysis

  Fixes #31

  Add Comb (Serpentine Scan) solution algorithm for TSP
  - Add comb algorithm that visits points in a serpentine row-by-row pattern
  - Implement both atomic (all-at-once) and progressive (step-by-step) versions
  - Add comb algorithm to CLI with `--algorithm comb` option
  - Add comb algorithm to web UI with side-by-side comparison support
  - Add i18n translations for all 20 supported languages
  - Add 12 unit tests for comb algorithm correctness

  Fix optimization failure when tour is already optimal
  - Handle empty optimization results by creating a fallback step that preserves the existing tour
  - Prevents path disappearing and distances showing 0 when no improvements are found
  - Add comprehensive tests (unit, component, e2e) for already-optimal tour edge cases

  Fix CI/CD benchmarks pipeline failures
  - Fix PACKAGE_NAME placeholder in publish-to-npm.mjs ('my-package' -> 'tsp-algorithms')
  - Fix changeset merged-quick-frog.md referencing wrong package name
  - Fix screenshot/benchmark commit race condition by discarding unstaged changes before rebase
  - Add publishConfig to package.json for consistent npm publish settings

  Add 3-opt, k-opt, Lin-Kernighan, and LKH optimization algorithms
  - Add 3-opt optimization using three-edge exchange with 7 reconnection types
  - Add k-opt generalized optimization combining 2-opt and 3-opt iteratively
  - Add Lin-Kernighan heuristic with variable-depth edge exchange and Or-opt moves
  - Add Lin-Kernighan-Helsgaun extending LK with double-bridge perturbation
  - All algorithms available in both atomic and progressive (step-by-step) versions
  - Integrate into CLI, UI, and benchmarks
  - Add 24 new tests with cross-algorithm quality comparison

  Add Space-Filling Tree algorithm for TSP tour construction based on recursive quadtree subdivision with Z-order (Morton order) DFS traversal, preserving spatial locality for better tour quality on clustered point sets.

  Add Double Spiral algorithm for TSP tour construction

  UI/UX improvements for consistent algorithm comparison experience
  - Show % of optimal path and exact length for all algorithms (using brute-force for small sets, lower bound for larger)
  - Move algorithm selection dropdowns into panel titles for more minimalistic UI
  - Display point coordinates in parentheses wherever point numbers are shown (SVG labels + step descriptions)
  - Enforce points count limit based on selected grid size (max N×N)
  - Allow continued optimization on top of previous results until optimal path is reached
  - Show progress % for all algorithms; Sonar also shows sweep angle
  - Disable Start button when brute-force algorithm is selected with too many points
  - Update tests to match new component interfaces

  Fixes #34

  UI/UX improvements: i18n, theme, tooltips, optimization highlights
  - Theme switcher defaults to system preference, fixed-size button eliminates layout jump
  - Uniform 36px input control heights across all controls
  - Point labels shown as SVG tooltips only (no inline text on grid)
  - Speed slider spans full width with no gaps at ends
  - Green highlight only on swapped/modified edges during optimization
  - Sonar centroid rendered as semi-transparent dashed purple circle
  - Grid size limited to 32×32 max (removed 64×64)
  - i18n with language selector supporting top 20 languages
  - Tooltip on disabled Start button explaining restriction
  - Points input allows clearing below 3, resets on blur

  Fixes #37

  Fix README screenshot update race condition and use raw image URL
  - Fix CI race condition where screenshot push fails when release job pushes first
  - Add git pull --rebase before push in update-screenshot workflow
  - Use fetch-depth: 0 for full clone to support rebase
  - Change README screenshot link to raw.githubusercontent.com URL

  Fixes #40

  Add UI support for U-fork algorithm
  - Add U-fork algorithm to the web interface for visual comparison
  - Add translations for all 20 supported languages
  - Integrate with existing curve visualization and legend components

  Fix benchmark data updating race condition in CI/CD
  - Fix CI race condition where benchmark push fails when another job pushes first
  - Add git pull --rebase before push in update-benchmarks workflow step
  - Use fetch-depth: 0 for full clone to support rebase

  Fixes #42

  Fix Moore curve normalization to correctly fill grid
  - Fix off-by-one error in mooreCurveToPoints normalization (scale to gridSize-1, not gridSize)
  - Fix calculateMooreGridSize to return smallest valid power-of-2 grid size
  - Add VALID_GRID_SIZES constant [2, 4, 8, 16, 32, 64]
  - Replace grid size number input with dropdown selector for valid Moore curve sizes
  - Fix generateRandomPoints to use [0, gridSize-1] coordinate range
  - Add 58 comprehensive tests for point-by-point and edge verification

  Add Gosper curve algorithm for solving TSP
  - Implement Gosper curve (flowsnake/Peano-Gosper) as a new space-filling curve algorithm
  - L-system with 60-degree turns on hexagonal grid pattern
  - Both atomic and progressive (step-by-step visualization) implementations
  - Integrated into CLI, React UI, and i18n (20 languages)
  - Comprehensive test suite

  Add Koch snowflake fractal curve as a new TSP solution algorithm
  - Implement Koch snowflake curve generation with recursive subdivision
  - Map points to nearest position on the Koch curve and sort by curve position to form a tour
  - Add both atomic and progressive (step-by-step visualization) versions
  - Add Koch Snowflake as a selectable algorithm in the UI
  - Add translations for all 20 supported languages
  - Add 15 tests covering curve generation, normalization, order calculation, and solution

  Fix CI/CD release pipeline by correcting PACKAGE_NAME in release scripts
  - Fix PACKAGE_NAME placeholder in merge-changesets.mjs ('my-package' -> 'tsp-algorithms')
  - Fix PACKAGE_NAME placeholder in create-manual-changeset.mjs ('my-package' -> 'tsp-algorithms')
  - Fix PACKAGE_NAME placeholder in format-release-notes.mjs ('my-package' -> 'tsp-algorithms')
  - Regenerate bun.lock with correct package name

  Add Self-Avoiding Walk (SAW) algorithm for TSP tour construction

  Scale benchmarks to 128x128 grid and add new algorithm configurations
  - Increase Moore grid size from 32x32 to 128x128 (up to 16384 points)
  - Add VALID_GRID_SIZES support for 64 and 128
  - Add brute force algorithm to benchmark configurations
  - Add combined optimization (alternating zigzag + 2-opt) algorithm
  - Add Sonar + Combined and Moore + Combined benchmark configurations
  - Adapt benchmark step sizing for larger point counts
  - Add more SVG chart colors for 10 algorithm configurations

  Add Peano curve algorithm for TSP
  - Add Peano space-filling curve algorithm using L-system generation (3^n grids)
  - Available in both atomic and progressive (step-by-step) versions
  - Integrate into CLI, UI with visualization, benchmarks, and i18n (20 languages)
  - Add comprehensive test suite (55+ tests) covering curve generation, verification, and solution quality

  Add Sierpiński curve algorithm for solving TSP
  - Add Sierpiński curve space-filling algorithm using L-system generation
  - Available in both atomic and progressive (step-by-step) versions
  - Integrate into CLI, UI visualization, and algorithm selection
  - Add i18n translations for all 20 supported languages
  - Add 18 new tests for curve generation, progressive steps, and atomic solution

  Fix tree structure pattern alignment with grid points by correcting the half-extent calculation in generateTreeEdges(), add clickable legend toggle for tree visibility, and reduce tree opacity for better blending.

  Fix benchmark TDZ error by reordering MOORE_GRID_SIZE and PEANO_GRID_SIZE declarations

  The benchmark script was failing due to a JavaScript Temporal Dead Zone (TDZ) error
  where PEANO_GRID_SIZE tried to use MOORE_GRID_SIZE before it was declared.

  Rename package to tsp-algorithms and restructure source code
  - Rename package from `tsp-solver` to `tsp-algorithms` in package.json and all references
  - Move `lib/`, `app/`, and `tests/` directories into `src/` folder
  - Update all path references in package.json, eslint.config.js, bunfig.toml, benchmarks, and examples
  - Include `dist/` directory in repository for local development with index.html
  - Fix changeset package name from `my-package` to `tsp-algorithms`

  Add globally installable CLI for running TSP algorithms
  - Add `tsp-algorithms` CLI command with `bin` field in package.json
  - Support algorithm selection: sonar, moore, brute-force (atomic algorithms)
  - Support optimization selection: none, 2-opt, zigzag, combined
  - Support random point generation with configurable grid size and point count
  - Support manual point input via coordinate pairs
  - Support lower-bound verification with --verify flag
  - Support JSON output with --json flag
  - Integrate lino-arguments for unified CLI/environment configuration
  - Add 42 comprehensive CLI integration tests

  Add CI timeout configuration and improve E2E test resilience
  - Add job-level timeout (15 minutes) and step-level timeout (10 minutes) for E2E tests
  - Add health check before E2E tests to fail fast if server or app is not ready
  - Share browser instance across tests to eliminate ~30 second overhead per test
  - Reduce E2E test runtime from ~52 seconds per test to ~17 seconds total

  Refactor monolithic index.html into modular structure
  - Create `src/algorithms/` directory with progressive and atomic variants for TSP algorithms
  - Create `src/ui/` directory with React.js components (TSPVisualization, Controls, Legend)
  - Add shared utility functions (distance, calculateTotalDistance, generateRandomPoints)
  - Add barrel exports for clean imports at each level
  - Add comprehensive tests for all algorithm functions (39 test cases)
  - Update README.md with new project structure and JavaScript library usage examples

## 0.5.0

### Minor Changes

- 66211b5: Add fresh merge simulation to CI/CD to prevent stale merge preview issues
  - Add "Simulate fresh merge with base branch" step to lint and test jobs
  - This ensures PR CI validates the actual merge result, not a stale snapshot
  - Prevents CI failures on main branch after merging PRs that sat open for days
  - Add case study documentation for issue #23 with root cause analysis
  - Add ignore patterns for case study data files in ESLint and Prettier

  See docs/case-studies/issue-23 for detailed analysis of the stale merge preview problem.

  Fixes #23

## 0.4.0

### Minor Changes

- e6c2691: Add multi-language repository support for CI/CD scripts
  - Add `scripts/js-paths.mjs` utility for automatic JavaScript package root detection
  - Support both `./package.json` (single-language) and `./js/package.json` (multi-language repos)
  - Add `--legacy-peer-deps` flag to npm install commands in release scripts to fix ERESOLVE errors
  - Save and restore working directory after `cd` commands to fix `command-stream` library's `process.chdir()` behavior
  - Add case study documentation with root cause analysis in `docs/case-studies/issue-21/`

## 0.3.0

### Minor Changes

- 80d9c84: Add CI check to prevent manual version modification in package.json
  - Added `check-version.mjs` script that detects manual version changes in PRs
  - Added `check-changesets.mjs` script to check for pending changesets (converted from inline shell)
  - Added `version-check` job to release.yml workflow
  - Automated release PRs (changeset-release/_ and changeset-manual-release-_) are automatically skipped

## 0.2.2

### Patch Changes

- 9a12139: Fix CI/CD check differences between pull request and push events

  Changes:
  - Add `detect-changes` job with cross-platform `detect-code-changes.mjs` script
  - Make lint job independent of changeset-check (runs based on file changes only)
  - Allow docs-only PRs without changeset requirement
  - Handle changeset-check 'skipped' state in dependent jobs
  - Exclude `.changeset/`, `docs/`, `experiments/`, `examples/` folders and markdown files from code changes detection

## 0.2.1

### Patch Changes

- 55aef41: Make Bun the primary runtime choice throughout the template
  - Update all shebangs from `#!/usr/bin/env node` to `#!/usr/bin/env bun` in scripts, experiments, and case studies
  - Update README.md to prioritize Bun in all sections (features, development, runtime support, package managers, scripts reference)
  - Update examples to list Bun first
  - Bun now described as "Primary runtime with highest performance" and "Primary choice" for package management
  - Maintains full compatibility with Node.js and Deno

## 0.2.0

### Minor Changes

- d3f7fcd: Improve changeset CI/CD robustness for concurrent PRs
  - Update validate-changeset.mjs to only check changesets ADDED by the current PR (not pre-existing ones)
  - Add merge-changesets.mjs script to combine multiple pending changesets during release
  - Merged changesets use highest version bump type (major > minor > patch) and combine descriptions chronologically
  - Update release workflow to pass SHA environment variables and add merge step
  - Add comprehensive case study documentation for the CI/CD improvement
  - This prevents PR failures when multiple PRs merge before a release cycle completes

## 0.1.4

### Patch Changes

- e9703b9: Add ESLint complexity rules with reasonable thresholds

## 0.1.3

### Patch Changes

- 0198aaa: Add case study documentation comparing best practices from effect-template

  This changeset adds comprehensive documentation analyzing best practices from
  ProverCoderAI/effect-template repository, identifying gaps in our current setup,
  and providing prioritized recommendations for improvements.

  Key findings include missing best practices like code duplication detection (jscpd),
  ESLint complexity rules, VS Code settings, and test coverage thresholds.

## 0.1.2

### Patch Changes

- 2ea9b78: Enforce strict no-unused-vars ESLint rule without exceptions. All unused variables, arguments, and caught errors must now be removed or used. The `_` prefix no longer suppresses unused variable warnings.

## 0.1.1

### Patch Changes

- 042e877: Fix GitHub release formatting to support Major/Minor/Patch changes

  The release formatting script now correctly handles all changeset types (Major, Minor, Patch) instead of only Patch changes. This ensures that:
  - Section headers are removed from release notes
  - PR detection works for all release types
  - NPM badges are added correctly

## 0.1.0

### Minor Changes

- 65d76dc: Initial template setup with complete AI-driven development pipeline

  Features:
  - Multi-runtime support for Node.js, Bun, and Deno
  - Universal testing with test-anywhere framework
  - Automated release workflow with changesets
  - GitHub Actions CI/CD pipeline with 9 test combinations
  - Code quality tools: ESLint + Prettier with Husky pre-commit hooks
  - Package manager agnostic design

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
