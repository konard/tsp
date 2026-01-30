---
'tsp-algorithms': patch
---

Fix optimization failure when tour is already optimal

- Handle empty optimization results by creating a fallback step that preserves the existing tour
- Prevents path disappearing and distances showing 0 when no improvements are found
- Add comprehensive tests (unit, component, e2e) for already-optimal tour edge cases
