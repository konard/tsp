/**
 * Test file for Self-Avoiding Walk (SAW) TSP algorithm
 * Works with Bun test runner
 */

import { describe, it, expect } from 'bun:test';
import {
  generateRandomPoints,
  calculateTotalDistance,
} from '../lib/algorithms/utils.js';
import {
  sawAlgorithmSteps,
  sawSolution,
} from '../lib/algorithms/progressive/solution/saw.js';
import { twoOpt } from '../lib/algorithms/progressive/optimization/two-opt.js';

// ============================================================
// Self-Avoiding Walk (SAW) Algorithm Tests
// ============================================================

describe('sawAlgorithmSteps', () => {
  it('should return empty array for empty points', () => {
    expect(sawAlgorithmSteps([])).toEqual([]);
  });

  it('should generate steps for all points', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const steps = sawAlgorithmSteps(points);
    expect(steps.length).toBe(points.length);
  });

  it('should include all points in final tour', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const steps = sawAlgorithmSteps(points);
    const finalTour = steps[steps.length - 1].tour;
    expect(finalTour.length).toBe(points.length);
    expect(new Set(finalTour).size).toBe(points.length);
  });

  it('should have walk type for all steps', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
    ];
    const steps = sawAlgorithmSteps(points);
    steps.forEach((step) => {
      expect(step.type).toBe('walk');
    });
  });

  it('should start from point 0', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const steps = sawAlgorithmSteps(points);
    expect(steps[0].tour[0]).toBe(0);
  });

  it('should walk to nearest unvisited point', () => {
    // Point 0 at origin, point 1 far away, point 2 close to origin
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 100, y: 100, id: 1 },
      { x: 1, y: 0, id: 2 },
    ];
    const steps = sawAlgorithmSteps(points);
    const finalTour = steps[steps.length - 1].tour;
    // Should visit point 2 before point 1 (since point 2 is closer to point 0)
    expect(finalTour[0]).toBe(0);
    expect(finalTour[1]).toBe(2);
    expect(finalTour[2]).toBe(1);
  });

  it('should build tour incrementally', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 5, y: 0, id: 1 },
      { x: 10, y: 0, id: 2 },
    ];
    const steps = sawAlgorithmSteps(points);
    // Each step should add one more point to the tour
    for (let i = 0; i < steps.length; i++) {
      expect(steps[i].tour.length).toBe(i + 1);
    }
  });
});

describe('sawSolution', () => {
  it('should return empty tour for empty points', () => {
    const result = sawSolution([]);
    expect(result.tour).toEqual([]);
  });

  it('should return single-point tour', () => {
    const result = sawSolution([{ x: 5, y: 5, id: 0 }]);
    expect(result.tour).toEqual([0]);
  });

  it('should return tour with all point indices', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const result = sawSolution(points);
    expect(result.tour.length).toBe(points.length);
    expect(new Set(result.tour).size).toBe(points.length);
  });

  it('should never revisit a point (self-avoiding property)', () => {
    const points = generateRandomPoints(16, 10);
    const result = sawSolution(points);
    const visited = new Set();
    for (const idx of result.tour) {
      expect(visited.has(idx)).toBe(false);
      visited.add(idx);
    }
  });

  it('should produce valid tour for larger point sets', () => {
    const points = generateRandomPoints(32, 50);
    const result = sawSolution(points);
    expect(result.tour.length).toBe(points.length);
    expect(new Set(result.tour).size).toBe(points.length);
  });

  it('should find tour with finite valid distance', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 10, y: 10, id: 2 },
      { x: 0, y: 10, id: 3 },
      { x: 5, y: 5, id: 4 },
    ];
    const sawResult = sawSolution(points);
    const sawDist = calculateTotalDistance(sawResult.tour, points);
    // SAW should produce a finite, valid distance
    expect(sawDist).toBeGreaterThan(0);
    expect(sawDist).toBeLessThan(Infinity);
  });

  it('should work with optimization algorithms', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 10, y: 10, id: 2 },
      { x: 0, y: 10, id: 3 },
      { x: 5, y: 5, id: 4 },
    ];
    const sawResult = sawSolution(points);
    const sawDist = calculateTotalDistance(sawResult.tour, points);

    // Apply 2-opt optimization
    const optResult = twoOpt(points, sawResult.tour);
    const optDist = calculateTotalDistance(optResult.tour, points);

    // Optimized tour should be no worse than SAW tour
    expect(optDist).toBeLessThanOrEqual(sawDist + 0.001);
  });
});
