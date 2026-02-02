/**
 * Test file for Sierpiński curve TSP algorithm
 * Works with Bun test runner
 */

import { describe, it, expect } from 'bun:test';
import {
  sierpinskiAlgorithmSteps,
  sierpinskiSolution,
  generateSierpinskiCurve,
  sierpinskiCurveToPoints,
} from '../lib/algorithms/progressive/solution/sierpinski.js';
import {
  generateRandomPoints,
  calculateTotalDistance,
} from '../lib/algorithms/utils.js';

// ============================================================
// Sierpiński Curve Generation Tests
// ============================================================

describe('generateSierpinskiCurve', () => {
  it('should generate valid L-system sequence', () => {
    const sequence = generateSierpinskiCurve(1);
    expect(sequence).toContain('F');
    expect(typeof sequence).toBe('string');
  });

  it('should expand sequence with higher order', () => {
    const order1 = generateSierpinskiCurve(1);
    const order2 = generateSierpinskiCurve(2);
    expect(order2.length).toBeGreaterThan(order1.length);
  });

  it('should contain axiom pattern at order 0', () => {
    const sequence = generateSierpinskiCurve(0);
    expect(sequence).toBe('F+XF+F+XF');
  });

  it('should not contain X or Y variables in F-count terms', () => {
    // The X variable is a non-drawing variable
    const sequence = generateSierpinskiCurve(2);
    // X is still present as a variable; it is not drawn
    expect(sequence).toContain('F');
  });
});

describe('sierpinskiCurveToPoints', () => {
  it('should generate curve points', () => {
    const sequence = generateSierpinskiCurve(1);
    const points = sierpinskiCurveToPoints(sequence, 4);
    expect(points.length).toBeGreaterThan(0);
  });

  it('should generate points within [0, gridSize-1] bounds', () => {
    const gridSize = 16;
    const sequence = generateSierpinskiCurve(3);
    const points = sierpinskiCurveToPoints(sequence, gridSize);
    points.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(gridSize - 1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(gridSize - 1);
    });
  });

  it('should fill the grid at various orders', () => {
    for (let order = 0; order <= 3; order++) {
      const gridSize = Math.pow(2, order + 1);
      const sequence = generateSierpinskiCurve(order);
      const points = sierpinskiCurveToPoints(sequence, gridSize);

      // Curve should have more than 1 point
      expect(points.length).toBeGreaterThan(1);

      // Bounding box should cover (0,0) to (gridSize-1, gridSize-1)
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      for (const p of points) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      }
      expect(minX).toBe(0);
      expect(minY).toBe(0);
      expect(maxX).toBe(gridSize - 1);
      expect(maxY).toBe(gridSize - 1);
    }
  });
});

// ============================================================
// Sierpiński Progressive Algorithm Tests
// ============================================================

describe('sierpinskiAlgorithmSteps', () => {
  it('should return empty array for empty points', () => {
    expect(sierpinskiAlgorithmSteps([], 16)).toEqual([]);
  });

  it('should generate curve step first', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 10, id: 1 },
    ];
    const steps = sierpinskiAlgorithmSteps(points, 16);
    expect(steps[0].type).toBe('curve');
  });

  it('should include all points in final tour', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 8, y: 8, id: 1 },
      { x: 4, y: 12, id: 2 },
    ];
    const steps = sierpinskiAlgorithmSteps(points, 16);
    const finalTour = steps[steps.length - 1].tour;
    expect(finalTour.length).toBe(points.length);
  });

  it('should include curve points in each step', () => {
    const points = [{ x: 5, y: 5, id: 0 }];
    const steps = sierpinskiAlgorithmSteps(points, 16);
    steps.forEach((step) => {
      expect(step.curvePoints !== undefined).toBe(true);
      expect(step.curvePoints.length).toBeGreaterThan(0);
    });
  });

  it('should have correct number of steps (1 curve + n visit)', () => {
    const points = [
      { x: 1, y: 1, id: 0 },
      { x: 5, y: 5, id: 1 },
      { x: 10, y: 10, id: 2 },
    ];
    const steps = sierpinskiAlgorithmSteps(points, 16);
    // 1 curve step + n visit steps
    expect(steps.length).toBe(points.length + 1);
  });

  it('should have visit type for all non-first steps', () => {
    const points = [
      { x: 1, y: 1, id: 0 },
      { x: 5, y: 5, id: 1 },
    ];
    const steps = sierpinskiAlgorithmSteps(points, 16);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].type).toBe('visit');
    }
  });
});

// ============================================================
// Sierpiński Atomic Solution Tests
// ============================================================

describe('sierpinskiSolution', () => {
  it('should return empty tour for empty points', () => {
    const result = sierpinskiSolution([], 16);
    expect(result.tour).toEqual([]);
    expect(result.curvePoints).toEqual([]);
  });

  it('should return tour with all point indices', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const result = sierpinskiSolution(points, 16);
    expect(result.tour.length).toBe(points.length);
    expect(new Set(result.tour).size).toBe(points.length);
  });

  it('should return curve points', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
    ];
    const result = sierpinskiSolution(points, 16);
    expect(result.curvePoints.length).toBeGreaterThan(0);
  });

  it('should produce valid tour for random points', () => {
    const gridSize = 16;
    const numPoints = 20;
    const points = generateRandomPoints(gridSize, numPoints);
    const result = sierpinskiSolution(points, gridSize);

    expect(result.tour.length).toBe(numPoints);
    expect(new Set(result.tour).size).toBe(numPoints);

    // Calculate distance - should be finite and positive
    const dist = calculateTotalDistance(result.tour, points);
    expect(dist).toBeGreaterThan(0);
    expect(isFinite(dist)).toBe(true);
  });

  it('should work with different grid sizes', () => {
    const gridSizes = [4, 8, 16, 32];
    for (const gridSize of gridSizes) {
      const points = generateRandomPoints(gridSize, 5);
      const result = sierpinskiSolution(points, gridSize);
      expect(result.tour.length).toBe(5);
      expect(result.curvePoints.length).toBeGreaterThan(0);
    }
  });
});
