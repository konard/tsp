# Case Study: Issue #63 - CI/CD Bug Benchmarks

## Summary

**Issue**: [GitHub Issue #63](https://github.com/konard/tsp/issues/63)
**Workflow Run**: [#21667543150](https://github.com/konard/tsp/actions/runs/21667543150/job/62466903562)
**Failed Job**: Update Benchmarks (Job ID: 62466903562)
**Date**: 2026-02-04
**Root Cause**: JavaScript Temporal Dead Zone (TDZ) error in `benchmarks/run.js`

## Timeline of Events

| Time (UTC) | Event |
|------------|-------|
| 10:17:47 | CI workflow triggered on push to main branch |
| 10:17:52 | Detect Changes job completes successfully |
| 10:18:10 | Lint and Format Check job completes successfully |
| 10:18:56 | Update Benchmarks job starts |
| 10:19:00 | Benchmark script fails with ReferenceError |
| 10:19:00 | Job exits with code 1 |

## Error Details

### Error Message

```
ReferenceError: Cannot access 'MOORE_GRID_SIZE' before initialization.
      at /home/runner/work/tsp/tsp/benchmarks/run.js:44:63
```

### Stack Trace

```
39 |   combinedOpt,
40 |   linKernighan,
41 |   lkHelsgaun,
42 | } = atomic;
43 |
44 | const PEANO_GRID_SIZE = calculatePeanoGridSize(MOORE_GRID_SIZE);
                                                                   ^
ReferenceError: Cannot access 'MOORE_GRID_SIZE' before initialization.
      at /home/runner/work/tsp/tsp/benchmarks/run.js:44:63
      at loadAndEvaluateModule (2:1)

Bun v1.3.8 (Linux x64)
```

## Root Cause Analysis

### The Bug

In `benchmarks/run.js`, the constant `PEANO_GRID_SIZE` is calculated using `MOORE_GRID_SIZE` on line 44, but `MOORE_GRID_SIZE` is not declared until line 50:

```javascript
// Line 44 - uses MOORE_GRID_SIZE before it's declared
const PEANO_GRID_SIZE = calculatePeanoGridSize(MOORE_GRID_SIZE);

// Line 46-50 - MOORE_GRID_SIZE is declared here
// Configuration
const TIME_BUDGET_SECONDS = 60;
const SAMPLES_PER_TEST = 10;
const CALIBRATION_POINTS = 10;
const MOORE_GRID_SIZE = 128;  // <-- declared on line 50
```

### What is the Temporal Dead Zone (TDZ)?

The **Temporal Dead Zone** is a behavior in JavaScript (introduced in ES6/ECMAScript 2015) that applies to variables declared with `let` and `const`. Key points:

1. **Hoisting but not initialization**: Unlike `var`, `let` and `const` declarations are hoisted to the top of their scope but are NOT initialized until the actual declaration line is reached.

2. **The "dead zone"**: From the beginning of the scope until the declaration is processed, the variable is in a "temporal dead zone". Any attempt to access it during this period throws a `ReferenceError`.

3. **Why it exists**: TDZ was introduced to catch bugs that would otherwise silently use `undefined` values (as happened with `var`), making code more predictable and easier to debug.

### How Variables Differ

| Declaration | Hoisted | Initialized | TDZ |
|-------------|---------|-------------|-----|
| `var` | Yes | `undefined` | No |
| `let` | Yes | No | Yes |
| `const` | Yes | No | Yes |
| `function` | Yes | Yes | No |

### References

- [MDN: ReferenceError - can't access lexical declaration before initialization](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_access_lexical_declaration_before_init)
- [GeeksforGeeks: Temporal Dead Zone in JavaScript](https://www.geeksforgeeks.org/javascript/temporal-dead-zone-in-javascript/)
- [Dmitri Pavlutin: Don't Use JavaScript Variables Without Knowing Temporal Dead Zone](https://dmitripavlutin.com/javascript-variables-and-temporal-dead-zone/)

## Impact Assessment

### Jobs Affected

| Job | Status | Impact |
|-----|--------|--------|
| Detect Changes | ✅ Success | None |
| Lint and Format Check | ✅ Success | None |
| Build | ✅ Success | None |
| Test (Bun) | ✅ Success | None |
| Deploy to GitHub Pages | ✅ Success | None |
| **Update Benchmarks** | ❌ **Failure** | **Benchmarks not updated** |
| Release | ❌ Failure | Blocked by benchmark failure |
| Update README Screenshot | ✅ Success | None |

### Consequences

1. **Benchmark data not updated**: The benchmark results and graphs were not regenerated
2. **Release blocked**: The Release job depends on successful benchmark completion
3. **Main branch affected**: This bug exists in the main branch code

## Solution

### The Fix

Move `MOORE_GRID_SIZE` declaration before its first use:

```javascript
// Configuration - MUST be declared before PEANO_GRID_SIZE calculation
const TIME_BUDGET_SECONDS = 60;
const SAMPLES_PER_TEST = 10;
const CALIBRATION_POINTS = 10;
const MOORE_GRID_SIZE = 128;
const FIXED_STEP = 50;

// Now PEANO_GRID_SIZE can safely use MOORE_GRID_SIZE
const PEANO_GRID_SIZE = calculatePeanoGridSize(MOORE_GRID_SIZE);
```

### Best Practices to Prevent Similar Issues

1. **Declare constants at the top of the scope**: Group all configuration constants together at the beginning of the module, before any code that uses them.

2. **Use linting rules**: Enable ESLint rule `no-use-before-define` to catch TDZ errors at development time:
   ```json
   {
     "rules": {
       "no-use-before-define": ["error", { "variables": true }]
     }
   }
   ```

3. **Consider TypeScript**: TypeScript can catch many "use before declaration" errors at compile time.

4. **Code review**: Check that newly added constants are declared before use, especially when refactoring.

## Prevention

### Recommended ESLint Configuration

Add to `eslint.config.js`:

```javascript
export default [
  {
    rules: {
      'no-use-before-define': ['error', {
        variables: true,
        functions: false, // function declarations are hoisted
        classes: true,
        allowNamedExports: false
      }]
    }
  }
];
```

### Testing Strategy

Consider adding a "smoke test" step in CI that validates benchmark scripts can be loaded without errors before running full benchmarks:

```yaml
- name: Validate benchmark script
  run: bun --print "import('./benchmarks/run.js')"
```

## Files Affected

- `benchmarks/run.js` - Contains the TDZ bug

## Artifacts

- [CI failure logs](./ci-logs/update-benchmarks-62466903562.txt)

## Lessons Learned

1. **JavaScript hoisting is nuanced**: While `const` and `let` are hoisted, they are not initialized, creating the TDZ.

2. **Linting is essential**: The `no-use-before-define` rule would have caught this error before it reached CI.

3. **Test script loading**: A simple import test can catch load-time errors before running expensive benchmark operations.

4. **Declaration order matters**: Unlike some other languages, JavaScript's execution model means declaration order is critical for module-level constants.
