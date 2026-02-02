/**
 * Test file for Gosper curve TSP algorithm
 * Works with Bun test runner
 */

import { describe, it, expect } from 'bun:test';
import { generateRandomPoints, distance } from '../lib/algorithms/utils.js';
import {
  gosperAlgorithmSteps,
  gosperSolution,
  generateGosperCurve,
  gosperCurveToPoints,
  calculateGosperOrder,
} from '../lib/algorithms/progressive/solution/gosper.js';

// ============================================================
// Gosper Curve Generation Tests
// ============================================================

describe('generateGosperCurve', () => {
  it('should generate valid L-system sequence', () => {
    const sequence = generateGosperCurve(1);
    expect(sequence).toContain('A');
    expect(typeof sequence).toBe('string');
  });

  it('should return axiom for order 0', () => {
    const sequence = generateGosperCurve(0);
    expect(sequence).toBe('A');
  });

  it('should expand sequence with higher order', () => {
    const order1 = generateGosperCurve(1);
    const order2 = generateGosperCurve(2);
    expect(order2.length).toBeGreaterThan(order1.length);
  });

  it('should grow by factor of ~7 per order', () => {
    // Each variable expands to 15 chars, so growth is roughly 7x per level
    const seq1 = generateGosperCurve(1);
    const seq2 = generateGosperCurve(2);
    // Count drawing commands (A and B)
    const count1 = [...seq1].filter((c) => c === 'A' || c === 'B').length;
    const count2 = [...seq2].filter((c) => c === 'A' || c === 'B').length;
    expect(count1).toBe(7); // 7^1
    expect(count2).toBe(49); // 7^2
  });

  it('should only contain valid L-system characters', () => {
    const sequence = generateGosperCurve(2);
    const validChars = new Set(['A', 'B', '+', '-']);
    for (const char of sequence) {
      expect(validChars.has(char)).toBe(true);
    }
  });
});

// ============================================================
// Gosper Curve Points Tests
// ============================================================

describe('gosperCurveToPoints', () => {
  it('should generate curve points', () => {
    const sequence = generateGosperCurve(2);
    const points = gosperCurveToPoints(sequence, 8);
    expect(points.length).toBeGreaterThan(0);
  });

  it('should generate points within [0, gridSize-1] bounds', () => {
    const gridSize = 16;
    const order = calculateGosperOrder(gridSize);
    const sequence = generateGosperCurve(order);
    const points = gosperCurveToPoints(sequence, gridSize);
    points.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(gridSize - 1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(gridSize - 1);
    });
  });

  it('should generate integer coordinates', () => {
    const sequence = generateGosperCurve(2);
    const points = gosperCurveToPoints(sequence, 16);
    points.forEach((p) => {
      expect(Number.isInteger(p.x)).toBe(true);
      expect(Number.isInteger(p.y)).toBe(true);
    });
  });

  it('should have n+1 points for n drawing commands', () => {
    const sequence = generateGosperCurve(1);
    const drawingCommands = [...sequence].filter(
      (c) => c === 'A' || c === 'B'
    ).length;
    const points = gosperCurveToPoints(sequence, 8);
    expect(points.length).toBe(drawingCommands + 1);
  });
});

// ============================================================
// Gosper Order Calculation Tests
// ============================================================

describe('calculateGosperOrder', () => {
  it('should return appropriate order for small grid sizes', () => {
    expect(calculateGosperOrder(2)).toBe(1);
    expect(calculateGosperOrder(4)).toBe(2);
    expect(calculateGosperOrder(8)).toBe(2);
  });

  it('should return appropriate order for medium grid sizes', () => {
    expect(calculateGosperOrder(16)).toBe(3);
    expect(calculateGosperOrder(32)).toBe(3);
  });

  it('should return appropriate order for large grid sizes', () => {
    expect(calculateGosperOrder(64)).toBe(4);
    expect(calculateGosperOrder(128)).toBe(4);
  });

  it('should always return a positive integer', () => {
    for (const size of [2, 4, 8, 16, 32, 64, 128]) {
      const order = calculateGosperOrder(size);
      expect(order).toBeGreaterThan(0);
      expect(Number.isInteger(order)).toBe(true);
    }
  });
});

// ============================================================
// Progressive Gosper Algorithm Tests
// ============================================================

describe('gosperAlgorithmSteps', () => {
  it('should return empty array for empty points', () => {
    expect(gosperAlgorithmSteps([], 16)).toEqual([]);
  });

  it('should generate curve step first', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 10, id: 1 },
    ];
    const steps = gosperAlgorithmSteps(points, 16);
    expect(steps[0].type).toBe('curve');
  });

  it('should include all points in final tour', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 8, y: 8, id: 1 },
      { x: 4, y: 12, id: 2 },
    ];
    const steps = gosperAlgorithmSteps(points, 16);
    const finalTour = steps[steps.length - 1].tour;
    expect(finalTour.length).toBe(points.length);
  });

  it('should include curve points in each step', () => {
    const points = [{ x: 5, y: 5, id: 0 }];
    const steps = gosperAlgorithmSteps(points, 16);
    steps.forEach((step) => {
      expect(step.curvePoints !== undefined).toBe(true);
      expect(step.curvePoints.length).toBeGreaterThan(0);
    });
  });

  it('should have visit type for steps after curve', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 10, id: 1 },
    ];
    const steps = gosperAlgorithmSteps(points, 16);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].type).toBe('visit');
    }
  });

  it('should generate n+1 steps (1 curve + n visit)', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 5, y: 5, id: 1 },
      { x: 10, y: 10, id: 2 },
    ];
    const steps = gosperAlgorithmSteps(points, 16);
    expect(steps.length).toBe(points.length + 1);
  });

  it('should have increasing tour length in steps', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 5, y: 5, id: 1 },
      { x: 10, y: 10, id: 2 },
    ];
    const steps = gosperAlgorithmSteps(points, 16);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].tour.length).toBe(i);
    }
  });

  it('should include curveProgress in visit steps', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 10, id: 1 },
    ];
    const steps = gosperAlgorithmSteps(points, 16);
    for (let i = 1; i < steps.length; i++) {
      expect(typeof steps[i].curveProgress).toBe('number');
      expect(steps[i].curveProgress).toBeGreaterThanOrEqual(0);
      expect(steps[i].curveProgress).toBeLessThanOrEqual(100);
    }
  });
});

// ============================================================
// Atomic Gosper Solution Tests
// ============================================================

describe('gosperSolution', () => {
  it('should return empty tour for empty points', () => {
    const result = gosperSolution([], 16);
    expect(result.tour).toEqual([]);
    expect(result.curvePoints).toEqual([]);
  });

  it('should return tour with all point indices', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const result = gosperSolution(points, 16);
    expect(result.tour.length).toBe(points.length);
    expect(new Set(result.tour).size).toBe(points.length);
  });

  it('should return curve points', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 5, y: 5, id: 1 },
    ];
    const result = gosperSolution(points, 16);
    expect(result.curvePoints.length).toBeGreaterThan(0);
  });

  it('should work with different grid sizes', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 3, y: 3, id: 1 },
    ];
    for (const gridSize of [4, 8, 16, 32, 64, 128]) {
      const result = gosperSolution(points, gridSize);
      expect(result.tour.length).toBe(points.length);
      expect(new Set(result.tour).size).toBe(points.length);
    }
  });

  it('should produce consistent results for same input', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 5, y: 5, id: 1 },
      { x: 10, y: 10, id: 2 },
    ];
    const result1 = gosperSolution(points, 16);
    const result2 = gosperSolution(points, 16);
    expect(result1.tour).toEqual(result2.tour);
  });

  it('should handle single point', () => {
    const points = [{ x: 5, y: 5, id: 0 }];
    const result = gosperSolution(points, 16);
    expect(result.tour).toEqual([0]);
  });

  it('should produce valid tour with random points', () => {
    const points = generateRandomPoints(16, 10);
    const result = gosperSolution(points, 16);
    expect(result.tour.length).toBe(points.length);
    expect(new Set(result.tour).size).toBe(points.length);
    // All indices should be valid
    result.tour.forEach((idx) => {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(points.length);
    });
  });
});

// ============================================================
// Gosper Curve Properties Tests
// ============================================================

describe('Gosper curve properties for all valid grid sizes', () => {
  const gridSizes = [4, 8, 16, 32, 64, 128];

  for (const gridSize of gridSizes) {
    it(`should produce bounded curve for grid size ${gridSize}`, () => {
      const order = calculateGosperOrder(gridSize);
      const sequence = generateGosperCurve(order);
      const points = gosperCurveToPoints(sequence, gridSize);

      points.forEach((p) => {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(gridSize - 1);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(gridSize - 1);
      });
    });

    it(`should produce connected curve (adjacent points close) for grid size ${gridSize}`, () => {
      const order = calculateGosperOrder(gridSize);
      const sequence = generateGosperCurve(order);
      const points = gosperCurveToPoints(sequence, gridSize);

      // Adjacent points on the curve should be reasonably close
      for (let i = 1; i < points.length; i++) {
        const d = distance(points[i - 1], points[i]);
        // After normalization, consecutive points should not be too far apart
        expect(d).toBeLessThan(gridSize);
      }
    });
  }
});
