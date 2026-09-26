/**
 * Two-phase simplex for max c*x subject to A*x <= b and x >= 0.
 * Adapted from the MIT-licensed Stanford/KACTL simplex implementation:
 * https://github.com/kth-competitive-programming/kactl/blob/main/content/numerical/Simplex.h
 * Copyright (c) Stanford University ACM team and KACTL contributors.
 * Floating-point LP values are approximate; callers must retain a safety
 * margin when using them as mathematical lower bounds.
 */
/* eslint-disable complexity -- The tableau phases require several pivot cases. */

const EPS = 1e-9;

export const solveLinearProgram = (A, b, c) => {
  const m = b.length;
  const n = c.length;
  const basis = Array.from({ length: m }, (_, i) => n + i);
  const nonBasis = Array.from({ length: n + 1 }, (_, i) => (i === n ? -1 : i));
  const tableau = Array.from({ length: m + 2 }, () => new Array(n + 2).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      tableau[i][j] = A[i][j];
    }
    tableau[i][n] = -1;
    tableau[i][n + 1] = b[i];
  }
  for (let j = 0; j < n; j++) {
    tableau[m][j] = -c[j];
  }
  tableau[m + 1][n] = 1;

  const pivot = (r, s) => {
    const inverse = 1 / tableau[r][s];
    for (let i = 0; i < m + 2; i++) {
      if (i === r || Math.abs(tableau[i][s]) <= EPS) {
        continue;
      }
      const factor = tableau[i][s] * inverse;
      for (let j = 0; j < n + 2; j++) {
        tableau[i][j] -= tableau[r][j] * factor;
      }
      tableau[i][s] = tableau[r][s] * factor;
    }
    for (let j = 0; j < n + 2; j++) {
      if (j !== s) {
        tableau[r][j] *= inverse;
      }
    }
    for (let i = 0; i < m + 2; i++) {
      if (i !== r) {
        tableau[i][s] *= -inverse;
      }
    }
    tableau[r][s] = inverse;
    [basis[r], nonBasis[s]] = [nonBasis[s], basis[r]];
  };

  const simplex = (phase) => {
    const objectiveRow = m + phase - 1;
    for (;;) {
      let entering = -1;
      for (let j = 0; j <= n; j++) {
        if (nonBasis[j] === -phase) {
          continue;
        }
        if (
          entering === -1 ||
          tableau[objectiveRow][j] < tableau[objectiveRow][entering] - EPS ||
          (Math.abs(
            tableau[objectiveRow][j] - tableau[objectiveRow][entering]
          ) <= EPS &&
            nonBasis[j] < nonBasis[entering])
        ) {
          entering = j;
        }
      }
      if (tableau[objectiveRow][entering] >= -EPS) {
        return true;
      }
      let leaving = -1;
      for (let i = 0; i < m; i++) {
        if (tableau[i][entering] <= EPS) {
          continue;
        }
        const ratio = tableau[i][n + 1] / tableau[i][entering];
        const best =
          leaving < 0
            ? Infinity
            : tableau[leaving][n + 1] / tableau[leaving][entering];
        if (
          ratio < best - EPS ||
          (Math.abs(ratio - best) <= EPS && basis[i] < basis[leaving])
        ) {
          leaving = i;
        }
      }
      if (leaving < 0) {
        return false;
      }
      pivot(leaving, entering);
    }
  };

  if (m > 0) {
    let row = 0;
    for (let i = 1; i < m; i++) {
      if (tableau[i][n + 1] < tableau[row][n + 1]) {
        row = i;
      }
    }
    if (tableau[row][n + 1] < -EPS) {
      pivot(row, n);
      if (!simplex(2) || tableau[m + 1][n + 1] < -EPS) {
        return { status: 'infeasible' };
      }
      for (let i = 0; i < m; i++) {
        if (basis[i] !== -1) {
          continue;
        }
        let entering = 0;
        for (let j = 1; j <= n; j++) {
          if (
            tableau[i][j] < tableau[i][entering] - EPS ||
            (Math.abs(tableau[i][j] - tableau[i][entering]) <= EPS &&
              nonBasis[j] < nonBasis[entering])
          ) {
            entering = j;
          }
        }
        pivot(i, entering);
      }
    }
  }

  if (!simplex(1)) {
    return { status: 'unbounded' };
  }
  const values = new Array(n).fill(0);
  for (let i = 0; i < m; i++) {
    if (basis[i] < n) {
      values[basis[i]] = tableau[i][n + 1];
    }
  }
  return { status: 'optimal', objective: tableau[m][n + 1], values };
};
