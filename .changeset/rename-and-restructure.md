---
'tsp-algorithms': minor
---

Rename package to tsp-algorithms and restructure source code

- Rename package from `tsp-solver` to `tsp-algorithms` in package.json and all references
- Move `lib/`, `app/`, and `tests/` directories into `src/` folder
- Update all path references in package.json, eslint.config.js, bunfig.toml, benchmarks, and examples
- Include `dist/` directory in repository for local development with index.html
- Fix changeset package name from `my-package` to `tsp-algorithms`
