---
'tsp-algorithms': minor
---

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
