import {
  directedConstraintPenalty,
  directedTourLength,
  solveDirectedTsp,
} from '../src/lib/algorithms/atomic/solution/directed-tsp.js';

let seed = 62;
const random = () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 2 ** 32;
};
const options = {
  zones: ['depot', 'A', 'B', 'A', 'B', 'C'],
  clusterLevels: [['depot', 'X', 'Y', 'X', 'Y', 'Y']],
  precedence: [['B', 'C']],
};
for (let trial = 0; trial < 40; trial++) {
  const costs = Array.from({ length: 6 }, (_, i) =>
    Array.from({ length: 6 }, (_, j) =>
      i === j ? 0 : 1 + Math.floor(20 * random())
    )
  );
  const exact = solveDirectedTsp(costs, { ...options, exact: true });
  let best = Infinity;
  const visit = (tour, unused) => {
    if (!unused.length) {
      if (directedConstraintPenalty(tour, options) === 0) {
        best = Math.min(best, directedTourLength(tour, costs));
      }
      return;
    }
    for (const v of unused) visit([...tour, v], unused.filter((u) => u !== v));
  };
  visit([0], [1, 2, 3, 4, 5]);
  if (best !== exact.distance || !exact.isOptimal) {
    throw new Error(JSON.stringify({ trial, costs, best, exact }));
  }
}
console.log('40 seeded directed instances: constrained exact search matches enumeration');
