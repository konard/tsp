/**
 * A geometric TSP lower bound from disjoint control zones.
 *
 * Give each point a disk. For every pair of points i and j, the disks
 * cannot overlap when radius[i] + radius[j] <= distance(i, j). Every tour
 * edge is at least the sum of its endpoint radii, so twice the sum of all
 * radii is a lower bound on any complete tour.
 *
 * Try the half-nearest-distance packing and several greedy maximal
 * packings, then retain the strongest. These are feasible packings, not
 * the optimal LP packing used in Waterloo's TSP DIY app.
 *
 * Time: O(n^2). Space: O(n^2) for pairwise distances.
 *
 * @param {Array<{x: number, y: number}>} points
 * @returns {{lowerBound: number, radii: number[], method: string}}
 */
import { distance } from '../utils.js';

export const controlZoneLowerBound = (points) => {
  const n = points.length;
  const distances = Array.from({ length: n }, () => new Array(n).fill(0));
  const nearest = new Array(n).fill(Infinity);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = distance(points[i], points[j]);
      distances[i][j] = d;
      distances[j][i] = d;
      nearest[i] = Math.min(nearest[i], d);
      nearest[j] = Math.min(nearest[j], d);
    }
  }

  const indices = points.map((_, i) => i);
  const pack = (order) => {
    const radii = new Array(n).fill(0);
    const assigned = [];
    for (const i of order) {
      let radius = nearest[i] === Infinity ? 0 : nearest[i];
      for (const j of assigned) {
        radius = Math.min(radius, distances[i][j] - radii[j]);
      }
      radii[i] = Math.max(0, radius);
      assigned.push(i);
    }
    return radii;
  };

  const halfNearest = nearest.map((d) => (d === Infinity ? 0 : d / 2));
  const packings = [
    halfNearest,
    pack(indices),
    pack([...indices].reverse()),
    pack([...indices].sort((a, b) => nearest[a] - nearest[b] || a - b)),
    pack([...indices].sort((a, b) => nearest[b] - nearest[a] || a - b)),
  ];
  const weight = (radii) => 2 * radii.reduce((sum, radius) => sum + radius, 0);
  const radii = packings.reduce((best, candidate) =>
    weight(candidate) > weight(best) ? candidate : best
  );

  return {
    lowerBound: weight(radii),
    radii,
    method: 'control zones',
  };
};

export default controlZoneLowerBound;
