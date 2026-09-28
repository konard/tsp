import { solveDirectedTsp } from '../src/lib/algorithms/atomic/solution/directed-tsp.js';

const n = 150;
const costs = Array.from({ length: n }, (_, i) =>
  Array.from({ length: n }, (_, j) =>
    i === j ? 0 : 1 + ((i * 53 + j * 97 + i * j * 11) % 100)
  )
);
const zones = Array.from({ length: n }, (_, i) =>
  i === 0 ? 'Depot' : `Z${Math.floor((i - 1) / 8)}`
);
const start = performance.now();
const result = solveDirectedTsp(costs, { zones, maxPasses: 5 });
console.log({
  stops: n,
  feasible: result.feasible,
  distance: result.distance,
  milliseconds: Math.round(performance.now() - start),
});
