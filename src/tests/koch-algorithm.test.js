/**
 * Test file for Koch Snowflake TSP algorithm
 * Works with Bun test runner
 */

import { describe, it, expect } from 'bun:test';
import {
  kochAlgorithmSteps,
  kochSolution,
  generateKochSnowflake,
  kochCurveToPoints,
  calculateKochOrder,
} from '../lib/algorithms/progressive/solution/koch.js';

// ============================================================
// Koch Snowflake Algorithm Tests
// ============================================================

describe('generateKochSnowflake', () => {
  it('should generate curve points for order 0 (triangle)', () => {
    const points = generateKochSnowflake(0);
    // Order 0: equilateral triangle = 3 edges, each with 1 segment = 3 points
    expect(points.length).toBe(3);
  });

  it('should generate more points at higher orders', () => {
    const order1 = generateKochSnowflake(1);
    const order2 = generateKochSnowflake(2);
    expect(order2.length).toBeGreaterThan(order1.length);
  });

  it('should generate 3 * 4^order points', () => {
    // Each edge has 4^order segments, 3 edges total
    for (let order = 0; order <= 3; order++) {
      const points = generateKochSnowflake(order);
      expect(points.length).toBe(3 * Math.pow(4, order));
    }
  });
});

describe('kochCurveToPoints', () => {
  it('should generate normalized curve points', () => {
    const rawPoints = generateKochSnowflake(3);
    const points = kochCurveToPoints(rawPoints, 16);
    expect(points.length).toBeGreaterThan(0);
  });

  it('should generate points within [0, gridSize-1] bounds', () => {
    const gridSize = 16;
    const rawPoints = generateKochSnowflake(5);
    const points = kochCurveToPoints(rawPoints, gridSize);
    points.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(gridSize - 1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(gridSize - 1);
    });
  });

  it('should return empty array for empty input', () => {
    const points = kochCurveToPoints([], 16);
    expect(points).toEqual([]);
  });
});

describe('calculateKochOrder', () => {
  it('should return higher order for larger grid sizes', () => {
    const order4 = calculateKochOrder(4);
    const order16 = calculateKochOrder(16);
    const order64 = calculateKochOrder(64);
    expect(order16).toBeGreaterThan(order4);
    expect(order64).toBeGreaterThan(order16);
  });

  it('should return at least 3 for smallest grid sizes', () => {
    expect(calculateKochOrder(2)).toBeGreaterThanOrEqual(3);
  });
});

describe('kochAlgorithmSteps', () => {
  it('should return empty array for empty points', () => {
    expect(kochAlgorithmSteps([], 16)).toEqual([]);
  });

  it('should generate curve step first', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 10, id: 1 },
    ];
    const steps = kochAlgorithmSteps(points, 16);
    expect(steps[0].type).toBe('curve');
  });

  it('should include all points in final tour', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 8, y: 8, id: 1 },
      { x: 4, y: 12, id: 2 },
    ];
    const steps = kochAlgorithmSteps(points, 16);
    const finalTour = steps[steps.length - 1].tour;
    expect(finalTour.length).toBe(points.length);
  });

  it('should include curve points in each step', () => {
    const points = [{ x: 5, y: 5, id: 0 }];
    const steps = kochAlgorithmSteps(points, 16);
    steps.forEach((step) => {
      expect(step.curvePoints !== undefined).toBe(true);
      expect(step.curvePoints.length).toBeGreaterThan(0);
    });
  });
});

describe('kochSolution', () => {
  it('should return empty tour for empty points', () => {
    const result = kochSolution([], 16);
    expect(result.tour).toEqual([]);
    expect(result.curvePoints).toEqual([]);
  });

  it('should return tour with all point indices', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const result = kochSolution(points, 16);
    expect(result.tour.length).toBe(points.length);
    expect(new Set(result.tour).size).toBe(points.length);
  });

  it('should return curve points', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 15, y: 15, id: 1 },
    ];
    const result = kochSolution(points, 16);
    expect(result.curvePoints.length).toBeGreaterThan(0);
  });
});
