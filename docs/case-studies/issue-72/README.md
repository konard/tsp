# Case Study: Issue #72 - Fix Theme Switching Button Jump

## Summary

**Issue**: [GitHub Issue #72](https://github.com/konard/tsp/issues/72)
**Date**: 2026-03-14
**Component**: Theme toggle button (`.theme-toggle`) in `src/app/ui/styles.css`
**Root Cause**: CSS `transform` property conflict — the generic `button:active` rule overrides the `.theme-toggle` button's positional `transform: translateY(-50%)` with `transform: scale(0.98)`, causing the button to visually jump/shift on click.

## Timeline of Events

| Step | Event                                                                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | User reports that the theme-switching button (moon/sun icon in the top-right header) visually "jumps" when clicked in both light and dark themes |
| 2    | Screenshots attached to the issue confirm visible button position shift on click                                                                 |
| 3    | Root cause identified: CSS `transform` overwrite on `:active` state                                                                              |
| 4    | Fix applied: Add `.theme-toggle:active` override that combines both transforms                                                                   |
| 5    | Fix verified: button no longer jumps on click                                                                                                    |

## Root Cause Analysis

### The Bug

The theme toggle button is positioned absolutely inside the header, vertically centered using `transform: translateY(-50%)`:

```css
/* src/app/ui/styles.css, lines 95-116 */
.theme-toggle {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%); /* <-- centers the button vertically */
  /* ... */
}
```

There is also a generic `button:active` rule that applies a click animation to all buttons:

```css
/* src/app/ui/styles.css, lines 204-206 */
button:active:not(:disabled) {
  transform: scale(0.98); /* <-- applied to ALL buttons on click */
}
```

### Why CSS `transform` Is Not Additive

In CSS, the `transform` property is **not additive** — assigning a new value **completely replaces** the previous one. So when the user clicks the `.theme-toggle` button:

1. At rest: `transform: translateY(-50%)` — button is vertically centered
2. On click (`:active`): `transform: scale(0.98)` — button loses its `translateY(-50%)` centering

This causes the button to snap back to `top: 50%` (uncentered by half its own height) while also scaling down, creating a visible jump.

### Visualization

```
At rest:                    On click (before fix):       On click (after fix):
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│       Header         │    │       Header         │    │       Header         │
│              [🌙]    │    │                      │    │              [🌙]    │
│                      │    │              [🌙]    │    │                      │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
translateY(-50%)             scale(0.98) only             translateY(-50%) scale(0.98)
(centered)                   (drops down, jumps)          (centered + slight shrink)
```

### References

- [MDN: CSS `transform` property](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) — explains that assigning a new value replaces the previous one; multiple functions must be listed in the same declaration
- [MDN: CSS `transform-function: scale()`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scale)
- [MDN: CSS `transform-function: translateY()`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/translateY)
- [CSS Tricks: Multiple Transforms](https://css-tricks.com/almanac/properties/t/transform/) — demonstrates that multiple transform functions must be space-separated in one `transform` declaration to combine them

## Solution

### The Fix

Add a specific `:active` override for `.theme-toggle` that combines both the positional and scale transforms:

```css
/* src/app/ui/styles.css */
.theme-toggle:active:not(:disabled) {
  transform: translateY(-50%) scale(0.98);
}
```

Because CSS cascades in order, this more-specific rule (targeting `.theme-toggle:active`) takes precedence over the generic `button:active` rule, and by including `translateY(-50%)` in the combined transform value, the button stays centered while still providing the click animation.

### Alternative Solutions Considered

| Option                                          | Description                                                                        | Pros                                      | Cons                                                                         |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| **Chosen: Add `.theme-toggle:active` override** | Override with combined `translateY(-50%) scale(0.98)`                              | Minimal change; preserves click animation | Slightly duplicates the `-50%` value                                         |
| Exclude from generic rule                       | Change to `button:not(.theme-toggle):active:not(:disabled)`                        | Single place of truth                     | Fragile — future absolutely-positioned buttons would need the same exclusion |
| Use `will-change: transform` + layout shift     | Alternative centering with `flexbox` instead of `position: absolute` + `transform` | Avoids the transform conflict entirely    | Larger refactor; potential layout side-effects                               |

## Files Changed

- `src/app/ui/styles.css` — Added `.theme-toggle:active:not(:disabled)` rule after the existing `.theme-toggle:hover` rule

## Testing

### Manual Testing

1. Open the app in the browser
2. Click the theme toggle button (moon/sun icon in top-right of header)
3. Observe that the button no longer jumps on click — it stays in position with only a subtle scale animation

### Automated Tests

Existing Playwright e2e tests in `src/tests/e2e/` cover theme switching behavior.

## Lessons Learned

1. **CSS `transform` overwrites, does not accumulate**: When overriding `transform` in a selector that builds on a base rule, always include all required transform functions in the new declaration.

2. **Absolute positioning + `transform` for centering is fragile with overrides**: A centering technique like `top: 50%; transform: translateY(-50%)` works correctly at rest but can break if any other rule overrides `transform`. Consider using flexbox centering for elements that may also need other transform effects.

3. **Generic button rules need care**: Global rules like `button:active { transform: scale(0.98) }` affect all buttons, including those with special positioning. When writing such rules, check for any buttons that use `transform` for layout purposes.

4. **Specificity is the remedy**: Using a more specific selector (`.theme-toggle:active`) that includes the combined value is the cleanest, most targeted fix when a specific element needs a different behavior.
