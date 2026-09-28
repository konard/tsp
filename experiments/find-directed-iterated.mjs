import { directedLocalSearch } from '../src/lib/algorithms/atomic/solution/directed-tsp.js';

let seed = 62;
const random = () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 2 ** 32;
};

for (let trial = 0; trial < 1000; trial++) {
  const n = 7;
  const costs = Array.from({ length: n }, (_, u) =>
    Array.from({ length: n }, (_, v) =>
      u === v ? 0 : 1 + Math.floor(random() * 30)
    )
  );
  const initial = Array.from({ length: n }, (_, i) => i);
  const local = directedLocalSearch(costs, initial);
  const perturbed = [...local.tour];
  [perturbed[1], perturbed[3]] = [perturbed[3], perturbed[1]];
  [perturbed[2], perturbed[4]] = [perturbed[4], perturbed[2]];
  const second = directedLocalSearch(costs, perturbed);
  if (second.distance < local.distance) {
    console.log({ costs, local, second });
    break;
  }
}
