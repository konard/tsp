/**
 * Test file for Space-Filling Tree TSP algorithm
 * Works with Bun test runner
 */

import { describe, it, expect } from 'bun:test';
import {
  spaceFillingTreeAlgorithmSteps,
  spaceFillingTreeSolution,
} from '../lib/algorithms/progressive/solution/space-filling-tree.js';

// ============================================================
// Space-Filling Tree Algorithm Tests
// ============================================================

describe('spaceFillingTreeAlgorithmSteps', () => {
  it('should return empty array for empty points', () => {
    expect(spaceFillingTreeAlgorithmSteps([])).toEqual([]);
  });

  it('should generate tree step first', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 10, id: 1 },
    ];
    const steps = spaceFillingTreeAlgorithmSteps(points);
    expect(steps[0].type).toBe('tree');
  });

  it('should include all points in final tour', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 8, y: 8, id: 1 },
      { x: 4, y: 12, id: 2 },
    ];
    const steps = spaceFillingTreeAlgorithmSteps(points);
    const finalTour = steps[steps.length - 1].tour;
    expect(finalTour.length).toBe(points.length);
    expect(new Set(finalTour).size).toBe(points.length);
  });

  it('should include tree edges in each step', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 10, id: 1 },
      { x: 5, y: 5, id: 2 },
    ];
    const steps = spaceFillingTreeAlgorithmSteps(points);
    steps.forEach((step) => {
      expect(step.treeEdges !== undefined).toBe(true);
      expect(Array.isArray(step.treeEdges)).toBe(true);
    });
  });

  it('should have visit type for non-tree steps', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 10, id: 1 },
    ];
    const steps = spaceFillingTreeAlgorithmSteps(points);
    // First step is tree, rest are visit
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].type).toBe('visit');
    }
  });
});

describe('spaceFillingTreeSolution', () => {
  it('should return empty tour for empty points', () => {
    const result = spaceFillingTreeSolution([]);
    expect(result.tour).toEqual([]);
    expect(result.treeEdges).toEqual([]);
  });

  it('should return single-element tour for one point', () => {
    const result = spaceFillingTreeSolution([{ x: 5, y: 5, id: 0 }]);
    expect(result.tour).toEqual([0]);
  });

  it('should return tour with all point indices', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const result = spaceFillingTreeSolution(points);
    expect(result.tour.length).toBe(points.length);
    expect(new Set(result.tour).size).toBe(points.length);
  });

  it('should return tree edges for visualization', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 0, y: 10, id: 2 },
      { x: 10, y: 10, id: 3 },
    ];
    const result = spaceFillingTreeSolution(points);
    expect(result.treeEdges.length).toBeGreaterThan(0);
    result.treeEdges.forEach((edge) => {
      expect(edge.from).toBeDefined();
      expect(edge.to).toBeDefined();
      expect(typeof edge.depth).toBe('number');
    });
  });

  it('should preserve spatial locality', () => {
    // Points in a grid — nearby points should tend to be near each other in tour
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 1, y: 0, id: 1 },
      { x: 0, y: 1, id: 2 },
      { x: 1, y: 1, id: 3 },
      { x: 10, y: 10, id: 4 },
      { x: 11, y: 10, id: 5 },
      { x: 10, y: 11, id: 6 },
      { x: 11, y: 11, id: 7 },
    ];
    const result = spaceFillingTreeSolution(points);
    // Check that points 0-3 (cluster 1) are grouped together in the tour
    const positions = {};
    result.tour.forEach((idx, pos) => {
      positions[idx] = pos;
    });
    // Points in cluster 1 (0,1,2,3) should all be within 4 positions of each other
    const cluster1Positions = [0, 1, 2, 3].map((i) => positions[i]);
    const minPos = Math.min(...cluster1Positions);
    const maxPos = Math.max(...cluster1Positions);
    expect(maxPos - minPos).toBeLessThanOrEqual(3);
  });
});
