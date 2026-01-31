---
'tsp-algorithms': minor
---

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
