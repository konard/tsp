/**
 * Test file for Space-Filling Tree TSP algorithm
 * Works with Bun test runner
 */

import { describe, it, expect } from 'bun:test';
import {
  spaceFillingTreeAlgorithmSteps,
  spaceFillingTreeSolution,
  generateSpaceFillingTreeCurve,
  generateTreeEdges,
} from '../lib/algorithms/progressive/solution/space-filling-tree.js';

// ============================================================
// generateSpaceFillingTreeCurve Tests
// ============================================================

describe('generateSpaceFillingTreeCurve', () => {
  it('should generate 4 points for order 1', () => {
    const curve = generateSpaceFillingTreeCurve(1);
    expect(curve.length).toBe(4);
  });

  it('should generate 16 points for order 2', () => {
    const curve = generateSpaceFillingTreeCurve(2);
    expect(curve.length).toBe(16);
  });

  it('should generate 64 points for order 3', () => {
    const curve = generateSpaceFillingTreeCurve(3);
    expect(curve.length).toBe(64);
  });

  it('should visit all grid positions', () => {
    const order = 2;
    const gridSize = Math.pow(2, order);
    const curve = generateSpaceFillingTreeCurve(order);
    const visited = new Set(curve.map((p) => `${p.x},${p.y}`));
    expect(visited.size).toBe(gridSize * gridSize);
  });

  it('should follow counter-clockwise square: BL→TL→TR→BR at order 1', () => {
    const curve = generateSpaceFillingTreeCurve(1);
    // Counter-clockwise square: BL(0,1), TL(0,0), TR(1,0), BR(1,1)
    expect(curve[0]).toEqual({ x: 0, y: 1 }); // BL
    expect(curve[1]).toEqual({ x: 0, y: 0 }); // TL
    expect(curve[2]).toEqual({ x: 1, y: 0 }); // TR
    expect(curve[3]).toEqual({ x: 1, y: 1 }); // BR
  });

  it('should follow correct pinwheel pattern at order 2', () => {
    const curve = generateSpaceFillingTreeCurve(2);
    // Expected sequence from user's specification
    const expected = [
      // BL quadrant
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 0, y: 3 },
      { x: 0, y: 2 },
      // TL quadrant
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      // TR quadrant
      { x: 2, y: 1 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      // BR quadrant
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 2, y: 3 },
    ];
    expect(curve).toEqual(expected);
  });

  it('should follow correct pattern at order 3', () => {
    const curve = generateSpaceFillingTreeCurve(3);
    // Expected order 3 sequence from user's reference SVG (converted to 0-based)
    const expected = [
      // BL quadrant (16 points)
      { x: 3, y: 4 },
      { x: 3, y: 5 },
      { x: 2, y: 6 },
      { x: 3, y: 6 },
      { x: 3, y: 7 },
      { x: 2, y: 7 },
      { x: 1, y: 6 },
      { x: 1, y: 7 },
      { x: 0, y: 7 },
      { x: 0, y: 6 },
      { x: 1, y: 5 },
      { x: 0, y: 5 },
      { x: 0, y: 4 },
      { x: 1, y: 4 },
      { x: 2, y: 5 },
      { x: 2, y: 4 },
      // TL quadrant (16 points)
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 0, y: 3 },
      { x: 0, y: 2 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      // TR quadrant (16 points)
      { x: 4, y: 3 },
      { x: 4, y: 2 },
      { x: 5, y: 1 },
      { x: 4, y: 1 },
      { x: 4, y: 0 },
      { x: 5, y: 0 },
      { x: 6, y: 1 },
      { x: 6, y: 0 },
      { x: 7, y: 0 },
      { x: 7, y: 1 },
      { x: 6, y: 2 },
      { x: 7, y: 2 },
      { x: 7, y: 3 },
      { x: 6, y: 3 },
      { x: 5, y: 2 },
      { x: 5, y: 3 },
      // BR quadrant (16 points)
      { x: 4, y: 4 },
      { x: 5, y: 4 },
      { x: 6, y: 5 },
      { x: 6, y: 4 },
      { x: 7, y: 4 },
      { x: 7, y: 5 },
      { x: 6, y: 6 },
      { x: 7, y: 6 },
      { x: 7, y: 7 },
      { x: 6, y: 7 },
      { x: 5, y: 6 },
      { x: 5, y: 7 },
      { x: 4, y: 7 },
      { x: 4, y: 6 },
      { x: 5, y: 5 },
      { x: 4, y: 5 },
    ];
    expect(curve).toEqual(expected);
  });
});

// ============================================================
// generateTreeEdges Tests
// ============================================================

describe('generateTreeEdges', () => {
  it('should generate edges for order 1', () => {
    const edges = generateTreeEdges(1, 2);
    expect(edges.length).toBe(4); // center connects to 4 quadrants
  });

  it('should generate edges for order 2', () => {
    const edges = generateTreeEdges(2, 4);
    // Order 2: 4 edges at depth 0, 4*4=16 edges at depth 1 = 20 total
    expect(edges.length).toBe(20);
  });

  it('should have from/to/depth properties', () => {
    const edges = generateTreeEdges(1, 2);
    edges.forEach((edge) => {
      expect(edge.from).toBeDefined();
      expect(edge.from.x).toBeDefined();
      expect(edge.from.y).toBeDefined();
      expect(edge.to).toBeDefined();
      expect(edge.to.x).toBeDefined();
      expect(edge.to.y).toBeDefined();
      expect(typeof edge.depth).toBe('number');
    });
  });
});

// ============================================================
// spaceFillingTreeAlgorithmSteps Tests
// ============================================================

describe('spaceFillingTreeAlgorithmSteps', () => {
  it('should return empty array for empty points', () => {
    expect(spaceFillingTreeAlgorithmSteps([], 16)).toEqual([]);
  });

  it('should generate curve step first', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 10, id: 1 },
    ];
    const steps = spaceFillingTreeAlgorithmSteps(points, 16);
    expect(steps[0].type).toBe('curve');
    expect(steps[0].curvePoints).toBeDefined();
    expect(steps[0].treeEdges).toBeDefined();
  });

  it('should include all points in final tour', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 8, y: 8, id: 1 },
      { x: 4, y: 12, id: 2 },
    ];
    const steps = spaceFillingTreeAlgorithmSteps(points, 16);
    const finalTour = steps[steps.length - 1].tour;
    expect(finalTour.length).toBe(points.length);
    expect(new Set(finalTour).size).toBe(points.length);
  });

  it('should include tree edges and curve points in each step', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 10, id: 1 },
      { x: 5, y: 5, id: 2 },
    ];
    const steps = spaceFillingTreeAlgorithmSteps(points, 16);
    steps.forEach((step) => {
      expect(Array.isArray(step.treeEdges)).toBe(true);
      expect(Array.isArray(step.curvePoints)).toBe(true);
    });
  });

  it('should have visit type for non-curve steps', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 10, id: 1 },
    ];
    const steps = spaceFillingTreeAlgorithmSteps(points, 16);
    // First step is curve, rest are visit
    expect(steps[0].type).toBe('curve');
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].type).toBe('visit');
    }
  });

  it('should track curvePosition for progress', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 15, y: 15, id: 1 },
    ];
    const steps = spaceFillingTreeAlgorithmSteps(points, 16);
    // Visit steps should have curvePosition
    for (let i = 1; i < steps.length; i++) {
      expect(typeof steps[i].curvePosition).toBe('number');
      expect(typeof steps[i].curveProgress).toBe('number');
    }
  });
});

// ============================================================
// spaceFillingTreeSolution Tests
// ============================================================

describe('spaceFillingTreeSolution', () => {
  it('should return empty tour for empty points', () => {
    const result = spaceFillingTreeSolution([], 16);
    expect(result.tour).toEqual([]);
    expect(result.curvePoints).toEqual([]);
    expect(result.treeEdges).toEqual([]);
  });

  it('should return tour with all point indices', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const result = spaceFillingTreeSolution(points, 16);
    expect(result.tour.length).toBe(points.length);
    expect(new Set(result.tour).size).toBe(points.length);
  });

  it('should return curve points and tree edges', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 0, y: 10, id: 2 },
      { x: 10, y: 10, id: 3 },
    ];
    const result = spaceFillingTreeSolution(points, 16);
    expect(result.curvePoints.length).toBeGreaterThan(0);
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
    const result = spaceFillingTreeSolution(points, 16);
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
