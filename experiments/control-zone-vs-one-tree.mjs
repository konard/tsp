import {
  controlZoneLowerBound,
  oneTreeLowerBound,
} from '../src/lib/algorithms/verification/index.js';

let seed = 62;
const random = () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 2 ** 32;
};

let bestGap = -Infinity;
let bestCase = null;
for (let n = 3; n <= 10; n++) {
  for (let trial = 0; trial < 10000; trial++) {
    const points = Array.from({ length: n }, () => ({
      x: Math.round(random() * 100),
      y: Math.round(random() * 100),
    }));
    const zone = controlZoneLowerBound(points).lowerBound;
    const tree = oneTreeLowerBound(points).lowerBound;
    if (zone - tree > bestGap) {
      bestGap = zone - tree;
      bestCase = { points, zone, tree };
    }
  }
}
console.log(JSON.stringify({ bestGap, bestCase }, null, 2));
