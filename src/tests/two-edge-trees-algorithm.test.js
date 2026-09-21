/**
 * Tests for the Two-Edge-Trees TSP heuristic.
 */

import { describe, expect, it } from 'bun:test';

import { twoEdgeTreesSolution } from '../lib/algorithms/atomic/solution/two-edge-trees.js';
import { twoEdgeTreesAlgorithmSteps } from '../lib/algorithms/progressive/solution/two-edge-trees.js';

const POINTS = [
  { x: 0, y: 0, id: 0 },
  { x: 10, y: 0, id: 1 },
  { x: 1, y: 1, id: 2 },
  { x: 9, y: 1, id: 3 },
  { x: 4, y: 2, id: 4 },
  { x: 6, y: 2, id: 5 },
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
    const square = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 10, y: 10, id: 2 },
      { x: 0, y: 10, id: 3 },
    ];

    const result = twoEdgeTreesSolution(square);

    expect(result.rootIndices).toEqual([0, 2]);
    expect(result.treeANodes).toEqual([0, 1]);
    expect(result.treeBNodes).toEqual([2, 3]);
    expect(result.tour).toEqual([0, 1, 3, 2]);
  });

  it('handles empty and single-point inputs', () => {
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
