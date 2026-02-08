/**
 * Test file for Double Spiral TSP algorithm
 * Works with Bun test runner
 */

import { describe, it, expect } from 'bun:test';
import {
  spiralAlgorithmSteps,
  spiralSolution,
  generateDoubleSpiralPoints,
} from '../lib/algorithms/progressive/solution/spiral.js';

// ============================================================
// Double Spiral Algorithm Tests
// ============================================================

describe('generateDoubleSpiralPoints', () => {
  it('should generate gridSize * gridSize points', () => {
    for (const size of [2, 4, 8, 16]) {
      const points = generateDoubleSpiralPoints(size);
      expect(points.length).toBe(size * size);
    }
  });

  it('should generate points within [0, gridSize-1] bounds', () => {
    const gridSize = 16;
    const points = generateDoubleSpiralPoints(gridSize);
    points.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(gridSize - 1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(gridSize - 1);
    });
  });

  it('should visit every grid cell exactly once', () => {
    const gridSize = 8;
    const points = generateDoubleSpiralPoints(gridSize);
    const visited = new Set();
    for (const p of points) {
      const key = `${p.x},${p.y}`;
      expect(visited.has(key)).toBe(false);
      visited.add(key);
    }
    expect(visited.size).toBe(gridSize * gridSize);
  });

  it('should start from bottom-left corner', () => {
    const gridSize = 8;
    const points = generateDoubleSpiralPoints(gridSize);
    expect(points[0].x).toBe(0);
    expect(points[0].y).toBe(gridSize - 1);
  });

  it('should have consecutive points adjacent to each other', () => {
    const gridSize = 8;
    const points = generateDoubleSpiralPoints(gridSize);
    for (let i = 0; i < points.length - 1; i++) {
      const dx = Math.abs(points[i + 1].x - points[i].x);
      const dy = Math.abs(points[i + 1].y - points[i].y);
      // Each step should move exactly one cell in x or y
      expect(dx + dy).toBe(1);
    }
  });

  it('should work with grid size 2', () => {
    const points = generateDoubleSpiralPoints(2);
    expect(points.length).toBe(4);
    // Verify all 4 cells are visited
    const visited = new Set(points.map((p) => `${p.x},${p.y}`));
    expect(visited.size).toBe(4);
  });

  it('should generate more points at larger grid sizes', () => {
    const small = generateDoubleSpiralPoints(4);
    const large = generateDoubleSpiralPoints(8);
    expect(large.length).toBeGreaterThan(small.length);
  });
});

describe('spiralAlgorithmSteps', () => {
  it('should return empty array for empty points', () => {
    expect(spiralAlgorithmSteps([], 16)).toEqual([]);
  });

  it('should generate curve step first', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 10, id: 1 },
    ];
    const steps = spiralAlgorithmSteps(points, 16);
    expect(steps[0].type).toBe('curve');
  });

  it('should include all points in final tour', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 8, y: 8, id: 1 },
      { x: 4, y: 12, id: 2 },
    ];
    const steps = spiralAlgorithmSteps(points, 16);
    const finalTour = steps[steps.length - 1].tour;
    expect(finalTour.length).toBe(points.length);
  });

  it('should include curve points in each step', () => {
    const points = [{ x: 5, y: 5, id: 0 }];
    const steps = spiralAlgorithmSteps(points, 16);
    steps.forEach((step) => {
      expect(step.curvePoints !== undefined).toBe(true);
      expect(step.curvePoints.length).toBeGreaterThan(0);
    });
  });

  it('should have N+1 steps (1 curve + N visits)', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 5, y: 5, id: 1 },
      { x: 10, y: 10, id: 2 },
    ];
    const steps = spiralAlgorithmSteps(points, 16);
    expect(steps.length).toBe(points.length + 1);
  });

  it('should have increasing tour length in visit steps', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 8, y: 8, id: 1 },
      { x: 4, y: 12, id: 2 },
    ];
    const steps = spiralAlgorithmSteps(points, 16);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].tour.length).toBe(i);
    }
  });

  it('should include curveProgress in visit steps', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 15, y: 15, id: 1 },
    ];
    const steps = spiralAlgorithmSteps(points, 16);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].curveProgress).toBeGreaterThanOrEqual(0);
      expect(steps[i].curveProgress).toBeLessThanOrEqual(100);
    }
  });
});

describe('spiralSolution', () => {
  it('should return empty tour for empty points', () => {
    const result = spiralSolution([], 16);
    expect(result.tour).toEqual([]);
    expect(result.curvePoints).toEqual([]);
  });

  it('should return tour with all point indices', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const result = spiralSolution(points, 16);
    expect(result.tour.length).toBe(points.length);
    expect(new Set(result.tour).size).toBe(points.length);
  });

  it('should return curve points', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 15, y: 15, id: 1 },
    ];
    const result = spiralSolution(points, 16);
    expect(result.curvePoints.length).toBeGreaterThan(0);
  });

  it('should return curve points filling the grid', () => {
    const gridSize = 8;
    const points = [{ x: 0, y: 0, id: 0 }];
    const result = spiralSolution(points, gridSize);
    expect(result.curvePoints.length).toBe(gridSize * gridSize);
  });

  it('should produce same tour as progressive version', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 7, y: 3, id: 1 },
      { x: 3, y: 7, id: 2 },
      { x: 5, y: 5, id: 3 },
    ];
    const atomicResult = spiralSolution(points, 8);
    const steps = spiralAlgorithmSteps(points, 8);
    const progressiveTour = steps[steps.length - 1].tour;
    expect(atomicResult.tour).toEqual(progressiveTour);
  });
});
