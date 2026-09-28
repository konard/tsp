import { directedTourLength } from '../src/lib/algorithms/atomic/solution/directed-tsp.js';

let seed = 62;
const random = () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 2 ** 32;
};
const tour = [0, 1, 2, 3, 4, 5];
for (let trial = 0; trial < 100000; trial++) {
  const costs = tour.map((i) =>
    tour.map((j) => (i === j ? 0 : 1 + Math.floor(random() * 20)))
  );
  const base = directedTourLength(tour, costs);
  let simplerMove = false;
  for (let from = 1; from < 6; from++) {
    for (let size = 1; size <= 3 && from + size <= 6; size++) {
      for (let to = 1; to <= 6 - size; to++) {
        const candidate = [...tour];
        candidate.splice(to, 0, ...candidate.splice(from, size));
        if (directedTourLength(candidate, costs) < base) simplerMove = true;
      }
    }
    for (let end = from + 1; end < 6; end++) {
      const candidate = [...tour];
      candidate.splice(from, end - from + 1, ...candidate.slice(from, end + 1).reverse());
      if (directedTourLength(candidate, costs) < base) simplerMove = true;
    }
  }
  if (simplerMove) continue;
  for (let i = 1; i < 6; i++) {
    for (let j = i + 2; j < 6; j++) {
      const candidate = [...tour];
      [candidate[i], candidate[j]] = [candidate[j], candidate[i]];
      if (directedTourLength(candidate, costs) < base) {
        console.log(JSON.stringify({ trial, costs, base, candidate, improved: directedTourLength(candidate, costs) }));
        process.exit(0);
      }
    }
  }
}
console.log('No isolated pair-swap case found');
