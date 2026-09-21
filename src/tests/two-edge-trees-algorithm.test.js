/**
 * Tests for the Two-Edge-Trees TSP heuristic.
 */

import { describe, expect, it } from 'bun:test';

import { twoEdgeTreesSolution } from '../lib/algorithms/atomic/solution/two-edge-trees.js';
import { twoOpt } from '../lib/algorithms/atomic/optimization/two-opt.js';
import { calculateTotalDistance } from '../lib/algorithms/utils.js';
import { twoEdgeTreesAlgorithmSteps } from '../lib/algorithms/progressive/solution/two-edge-trees.js';

const POINTS = [
  { x: 0, y: 0, id: 0 },
  { x: 10, y: 0, id: 1 },
  { x: 1, y: 1, id: 2 },
  { x: 9, y: 1, id: 3 },
  { x: 4, y: 2, id: 4 },
  { x: 6, y: 2, id: 5 },
];

const SQUARE = [
  { x: 0, y: 0, id: 0 },
  { x: 10, y: 0, id: 1 },
  { x: 10, y: 10, id: 2 },
  { x: 0, y: 10, id: 3 },
];

describe('twoEdgeTreesSolution', () => {
  it('grows independent trees from the furthest pair and synthesizes a tour', () => {
    const result = twoEdgeTreesSolution(POINTS);

    expect(result.rootIndices).toEqual([0, 1]);
    expect(result.treeANodes).toEqual([0, 2, 4]);
    expect(result.treeBNodes).toEqual([1, 3, 5]);
    expect(result.treeAEdges).toEqual([
      { from: 0, to: 2 },
      { from: 2, to: 4 },
    ]);
    expect(result.treeBEdges).toEqual([
      { from: 1, to: 3 },
      { from: 3, to: 5 },
    ]);
    expect(result.tour).toEqual([0, 2, 4, 5, 3, 1]);
    expect(new Set(result.tour).size).toBe(POINTS.length);
  });

  it('balances points that are equally close to both trees', () => {
    const result = twoEdgeTreesSolution(SQUARE);

    expect(result.rootIndices).toEqual([0, 2]);
    expect(result.treeANodes).toEqual([0, 1]);
    expect(result.treeBNodes).toEqual([2, 3]);
    expect(result.tour).toEqual([1, 0, 3, 2]);
  });

  it('joins the two tree traversals using the shortest cross-tree bridges', () => {
    const { tour } = twoEdgeTreesSolution(SQUARE);

    expect(calculateTotalDistance(tour, SQUARE)).toBe(40);
  });

  it('handles empty, single-point, and two-point inputs', () => {
    expect(twoEdgeTreesSolution([])).toEqual({
      tour: [],
      rootIndices: [],
      treeANodes: [],
      treeBNodes: [],
      treeAEdges: [],
      treeBEdges: [],
    });

    expect(twoEdgeTreesSolution([POINTS[0]])).toEqual({
      tour: [0],
      rootIndices: [0],
      treeANodes: [0],
      treeBNodes: [],
      treeAEdges: [],
      treeBEdges: [],
    });

    expect(twoEdgeTreesSolution(POINTS.slice(0, 2)).tour).toEqual([0, 1]);
  });

  it('produces a standard tour accepted by post-optimization', () => {
    const { tour } = twoEdgeTreesSolution(POINTS);
    const optimized = twoOpt(POINTS, tour);

    expect(optimized.tour).toHaveLength(POINTS.length);
    expect(new Set(optimized.tour).size).toBe(POINTS.length);
    expect(calculateTotalDistance(optimized.tour, POINTS)).toBeLessThanOrEqual(
      calculateTotalDistance(tour, POINTS)
    );
  });
});

describe('twoEdgeTreesAlgorithmSteps', () => {
  it('emits initialization, concurrent growth, and synthesis phases', () => {
    const steps = twoEdgeTreesAlgorithmSteps(POINTS);

    expect(steps.map((step) => step.phase)).toEqual([
      'initialization',
      'growth',
      'growth',
      'synthesis',
    ]);
    expect(steps[0].rootIndices).toEqual([0, 1]);
    expect(steps[1].addedToTreeA).toBe(2);
    expect(steps[1].addedToTreeB).toBe(3);
    expect(steps.at(-1).tour).toEqual([0, 2, 4, 5, 3, 1]);
    expect(steps.at(-1).tour.length).toBe(POINTS.length);
  });
});
