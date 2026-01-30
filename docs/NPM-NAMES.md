# NPM Package Name Research

This document contains research on available NPM package names for the TSP (Traveling Salesman Problem) library.

## Research Date

2026-01-30

## Methodology

Names were checked against the official NPM registry using `npm view <package-name>` to verify availability.

## Available Names

| Name                 | Status    | Description                                     | Recommendation |
| -------------------- | --------- | ----------------------------------------------- | -------------- |
| `tsp-algorithms`     | Available | Emphasizes the algorithmic focus                | **Best**       |
| `tsp-solver`         | Available | Clear, descriptive name for TSP solving library | Good           |
| `tsp-js`             | Available | Short, indicates JavaScript implementation      | Good           |
| `tsp-lib`            | Available | Short, indicates it's a library                 | Good           |
| `tsp-algo`           | Available | Short abbreviation                              | Acceptable     |
| `tsp-visual`         | Available | Emphasizes visualization aspect                 | Acceptable     |
| `fast-tsp`           | Available | Emphasizes performance                          | Acceptable     |
| `traveling-salesman` | Available | Full name, very descriptive                     | Acceptable     |
| `route-solver`       | Available | Generic routing term, less specific to TSP      | Less ideal     |

## Unavailable Names

| Name        | Status     | Reason                                     |
| ----------- | ---------- | ------------------------------------------ |
| `tsp`       | Taken      | Used for TypeScript preprocessing (v0.0.1) |
| `salesman`  | Deprecated | npm security hold - no longer usable       |
| `tspsolver` | Taken      | Google Maps TSP solver adaptation (v0.0.2) |

## Recommendation

**Recommended name: `tsp-algorithms`**

### Rationale

1. **Emphasizes algorithmic focus**: Communicates that this package provides multiple TSP algorithms
2. **Short and memorable**: Easy to type and remember
3. **SEO-friendly**: Contains both "tsp" and "algorithms" keywords that users would search for
4. **Consistent with npm conventions**: Uses lowercase with hyphens
5. **Descriptive**: Clearly indicates the package's focus on algorithmic implementations

### Alternative Choices (in order of preference)

1. `tsp-algorithms` - Best overall choice
2. `tsp-solver` - Good if emphasizing solving aspect
3. `tsp-js` - Good if emphasizing JavaScript/TypeScript implementation
4. `tsp-lib` - Good generic library name

## Implementation Notes

When updating package.json:

- Update the `name` field to the chosen name
- Ensure all imports and references are updated accordingly
- Update README.md to reflect the new package name
- Update any documentation that references the old name
