import { bruteForceSolution } from '../src/lib/algorithms/atomic/solution/brute-force.js';
import {
  branchAndCut,
  solveTspRelaxation,
} from '../src/lib/algorithms/verification/index.js';

let seed = 62;
const random = () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 2 ** 32;
};
for (let trial = 0; trial < 80; trial++) {
  const n = 4 + (trial % 4);
  const points = Array.from({ length: n }, () => ({
    x: Math.round(random() * 20),
    y: Math.round(random() * 20),
  }));
  const optimum = bruteForceSolution(points).distance;
  const relaxation = solveTspRelaxation(points, { blossoms: true });
  const exact = branchAndCut(points);
  if (
    relaxation.status !== 'optimal' ||
    relaxation.lowerBound > optimum + 1e-5 ||
    !exact.isOptimal ||
    Math.abs(exact.distance - optimum) > 1e-5
  ) {
    throw new Error(
      JSON.stringify({ trial, points, optimum, relaxation, exact })
    );
  }
}
console.log('80 seeded Euclidean instances: LP bound valid; exact search matches enumeration');
