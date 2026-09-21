/**
 * Compare the legacy diameter-root join with the current minimum-cost cycle
 * splice, which still derives the final tour exclusively from the two trees.
 *
 * Run with: bun experiments/two-edge-trees-quality.mjs
 */

import { twoEdgeTreesSolution } from '../src/lib/algorithms/atomic/solution/two-edge-trees.js';
import { mooreSolution } from '../src/lib/algorithms/atomic/solution/moore.js';
import { sonarSolution } from '../src/lib/algorithms/atomic/solution/sonar.js';
import { twoOpt } from '../src/lib/algorithms/atomic/optimization/two-opt.js';
import { calculateTotalDistance } from '../src/lib/algorithms/utils.js';

const depthFirstOrder = (root, edges) => {
  const order = [];
  const pending = [root];
  while (pending.length > 0) {
    const node = pending.pop();
    order.push(node);
    const children = edges
      .filter((edge) => edge.from === node)
      .map((edge) => edge.to);
    for (let index = children.length - 1; index >= 0; index--) {
      pending.push(children[index]);
    }
  }
  return order;
};

const mulberry32 = (seed) => () => {
  let value = (seed += 0x6d2b79f5);
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

const generatePoints = (count, seed) => {
  const random = mulberry32(seed);
  const points = [];
  const used = new Set();
  while (points.length < count) {
    const x = Math.floor(random() * 128);
    const y = Math.floor(random() * 128);
    const key = `${x},${y}`;
    if (used.has(key)) continue;
    used.add(key);
    points.push({ x, y, id: points.length });
  }
  return points;
};

for (const count of [10, 25, 50, 100]) {
  const totals = { legacy: 0, splice: 0, optimized: 0, moore: 0, sonar: 0 };
  let improved = 0;
  for (let seed = 1; seed <= 100; seed++) {
    const points = generatePoints(count, seed);
    const result = twoEdgeTreesSolution(points);
    const cycleA = depthFirstOrder(result.rootIndices[0], result.treeAEdges);
    const cycleB = depthFirstOrder(result.rootIndices[1], result.treeBEdges);
    const legacyTour = [...cycleA, ...cycleB.reverse()];
    const spliceDistance = calculateTotalDistance(result.tour, points);
    const legacyDistance = calculateTotalDistance(legacyTour, points);
    totals.legacy += legacyDistance;
    totals.splice += spliceDistance;
    totals.optimized += calculateTotalDistance(
      twoOpt(points, result.tour).tour,
      points,
    );
    totals.moore += calculateTotalDistance(
      mooreSolution(points, 128).tour,
      points,
    );
    totals.sonar += calculateTotalDistance(sonarSolution(points).tour, points);
    if (spliceDistance < legacyDistance - 1e-9) improved++;
  }

  console.log({
    points: count,
    samples: 100,
    improved,
    legacyAverage: (totals.legacy / 100).toFixed(2),
    spliceAverage: (totals.splice / 100).toFixed(2),
    reduction: `${((1 - totals.splice / totals.legacy) * 100).toFixed(1)}%`,
    afterTwoOpt: (totals.optimized / 100).toFixed(2),
    mooreAverage: (totals.moore / 100).toFixed(2),
    sonarAverage: (totals.sonar / 100).toFixed(2),
  });
}
