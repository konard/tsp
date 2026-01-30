---
'tsp-algorithms': minor
---

Fix misleading "Tour is already optimal" message and add verification

- Add brute-force verification algorithm to compute true optimal tour for small point sets (<=12 points)
- Replace single "Optimize" button with separate "2-opt" and "Zigzag" buttons for independent optimization
- Show tour distance as percentage of verified optimal distance in visualization header
- Fix false "already optimal" claims by comparing against brute-force ground truth
- Rename `solutions` to `solution` and `optimizations` to `optimization` folders
- Add case study documentation with root cause analysis

Fixes #31
