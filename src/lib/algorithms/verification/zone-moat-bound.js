import { distance } from '../utils.js';
import { solveLinearProgram } from './simplex.js';
import { solveTspRelaxation } from './tsp-lp.js';

const pack = (points, cuts) => {
  const n = points.length;
  if (n < 2) {
    return { lowerBound: 0, radii: new Array(n).fill(0), moats: [] };
  }
  const sets = cuts.map(({ vertices }) => new Set(vertices));
  const A = [];
  const b = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const row = new Array(n + cuts.length).fill(0);
      row[i] = 1;
      row[j] = 1;
      sets.forEach((set, k) => {
        if (set.has(i) !== set.has(j)) {
          row[n + k] = 1;
        }
      });
      A.push(row);
      b.push(distance(points[i], points[j]));
    }
  }
  const lp = solveLinearProgram(A, b, new Array(n + cuts.length).fill(2));
  if (lp.status !== 'optimal') {
    throw new Error(`zone and moat LP failed: ${lp.status}`);
  }
  const widths = lp.values.map((value) => Math.max(0, value));
  // Project approximate simplex output back into the feasible packing region.
  let scale = 1;
  for (let row = 0; row < A.length; row++) {
    const used = A[row].reduce(
      (sum, coefficient, k) => sum + coefficient * widths[k],
      0
    );
    if (used > b[row]) {
      scale = Math.min(scale, b[row] / used);
    }
  }
  scale *= 1 - 1e-10;
  const radii = widths.slice(0, n).map((width) => width * scale);
  const moats = cuts.map((cut, k) => ({
    vertices: cut.vertices,
    width: widths[n + k] * scale,
  }));
  return {
    lowerBound:
      2 *
      [...radii, ...moats.map((moat) => moat.width)].reduce((a, b) => a + b, 0),
    radii,
    moats,
  };
};

/** Maximum non-overlapping control-zone packing from an LP. */
export const optimalControlZoneLowerBound = (points) => ({
  ...pack(points, []),
  method: 'optimal control zones',
});

/** Feasible zone and moat packing using subtour cuts separated by the TSP LP. */
export const zoneAndMoatLowerBound = (points) => {
  if (points.length < 3) {
    return { ...pack(points, []), method: 'zones and moats' };
  }
  const relaxation = solveTspRelaxation(points, { cuts: 'full' });
  if (relaxation.status !== 'optimal') {
    throw new Error(`subtour separation failed: ${relaxation.status}`);
  }
  return {
    ...pack(
      points,
      relaxation.cuts.filter((cut) => cut.type === 'subtour')
    ),
    method: 'zones and moats',
  };
};
