/**
 * Test file for Comb (Serpentine Scan) TSP algorithm
 * Works with Bun test runner
 */

import { describe, it, expect } from 'bun:test';
import {
  combAlgorithmSteps,
  combSolution,
} from '../lib/algorithms/progressive/solution/comb.js';

// ============================================================
// Comb Algorithm Steps Tests (Progressive)
// ============================================================

describe('combAlgorithmSteps', () => {
  it('should return empty array for empty points', () => {
    expect(combAlgorithmSteps([])).toEqual([]);
  });

  it('should generate steps for all points', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const steps = combAlgorithmSteps(points);
    expect(steps.length).toBe(points.length);
  });

  it('should include all points in final tour', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const steps = combAlgorithmSteps(points);
    const finalTour = steps[steps.length - 1].tour;
    expect(finalTour.length).toBe(points.length);
    expect(new Set(finalTour).size).toBe(points.length);
  });

  it('should have comb type for all steps', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
    ];
    const steps = combAlgorithmSteps(points);
    steps.forEach((step) => {
      expect(step.type).toBe('comb');
    });
  });

  it('should visit points in serpentine row order', () => {
    // 4 points in a 2x2 grid
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 1, y: 0, id: 1 },
      { x: 0, y: 1, id: 2 },
      { x: 1, y: 1, id: 3 },
    ];
    const steps = combAlgorithmSteps(points);
    const finalTour = steps[steps.length - 1].tour;
    // Row 0 (y=0): left-to-right → [0, 1]
    // Row 1 (y=1): right-to-left → [3, 2]
    expect(finalTour).toEqual([0, 1, 3, 2]);
  });

  it('should include description with progress in each step', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 5, y: 5, id: 1 },
    ];
    const steps = combAlgorithmSteps(points);
    steps.forEach((step) => {
      expect(step.description).toContain('Progress:');
      expect(step.description).toContain('Row');
    });
  });
});

// ============================================================
// Comb Solution Tests (Atomic)
// ============================================================

describe('combSolution', () => {
  it('should return empty tour for empty points', () => {
    const result = combSolution([]);
    expect(result.tour).toEqual([]);
    expect(result.rows).toEqual([]);
  });

  it('should return tour with all point indices', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const result = combSolution(points);
    expect(result.tour.length).toBe(points.length);
    expect(new Set(result.tour).size).toBe(points.length);
  });

  it('should produce serpentine tour for grid of points', () => {
    // 3x3 grid
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 1, y: 0, id: 1 },
      { x: 2, y: 0, id: 2 },
      { x: 0, y: 1, id: 3 },
      { x: 1, y: 1, id: 4 },
      { x: 2, y: 1, id: 5 },
      { x: 0, y: 2, id: 6 },
      { x: 1, y: 2, id: 7 },
      { x: 2, y: 2, id: 8 },
    ];
    const result = combSolution(points);
    // Row 0 (y=0): left-to-right → [0, 1, 2]
    // Row 1 (y=1): right-to-left → [5, 4, 3]
    // Row 2 (y=2): left-to-right → [6, 7, 8]
    expect(result.tour).toEqual([0, 1, 2, 5, 4, 3, 6, 7, 8]);
    expect(result.rows.length).toBe(3);
  });

  it('should return row groupings', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 5, y: 0, id: 1 },
      { x: 0, y: 5, id: 2 },
      { x: 5, y: 5, id: 3 },
    ];
    const result = combSolution(points);
    expect(result.rows.length).toBe(2);
    // Row 0 (y=0): left-to-right
    expect(result.rows[0]).toEqual([0, 1]);
    // Row 1 (y=5): right-to-left
    expect(result.rows[1]).toEqual([3, 2]);
  });

  it('should handle single point', () => {
    const points = [{ x: 5, y: 5, id: 0 }];
    const result = combSolution(points);
    expect(result.tour).toEqual([0]);
    expect(result.rows.length).toBe(1);
  });

  it('should produce consistent results with progressive version', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 3, y: 0, id: 1 },
      { x: 6, y: 0, id: 2 },
      { x: 0, y: 3, id: 3 },
      { x: 3, y: 3, id: 4 },
      { x: 6, y: 3, id: 5 },
    ];
    const atomicResult = combSolution(points);
    const steps = combAlgorithmSteps(points);
    const progressiveTour = steps[steps.length - 1].tour;
    expect(atomicResult.tour).toEqual(progressiveTour);
  });
});
