/**
 * Test file for TSP algorithms
 * Works with Bun test runner
 */

import { describe, it, expect } from 'bun:test';
import {
  calculateMooreGridSize,
  generateRandomPoints,
  distance,
  calculateTotalDistance,
} from '../lib/algorithms/utils.js';
import {
  sonarAlgorithmSteps,
  sonarSolution,
} from '../lib/algorithms/progressive/solutions/sonar.js';
import {
  mooreAlgorithmSteps,
  mooreSolution,
  generateMooreCurve,
  mooreCurveToPoints,
} from '../lib/algorithms/progressive/solutions/moore.js';
import {
  zigzagOptSteps,
  zigzagOpt,
  // Legacy aliases
  sonarOptimizationSteps,
  sonarOptimization,
} from '../lib/algorithms/progressive/optimizations/zigzag-opt.js';
import {
  twoOptSteps,
  twoOpt,
  // Legacy aliases
  mooreOptimizationSteps,
  mooreOptimization,
} from '../lib/algorithms/progressive/optimizations/two-opt.js';

// ============================================================
// Utility Functions Tests
// ============================================================

describe('calculateMooreGridSize', () => {
  it('should return same value for valid Moore curve sizes', () => {
    expect(calculateMooreGridSize(2)).toBe(2);
    expect(calculateMooreGridSize(4)).toBe(4);
    expect(calculateMooreGridSize(8)).toBe(8);
    expect(calculateMooreGridSize(16)).toBe(16);
    expect(calculateMooreGridSize(32)).toBe(32);
    expect(calculateMooreGridSize(64)).toBe(64);
  });

  it('should return nearest power of 2 for non-power-of-2 inputs', () => {
    expect(calculateMooreGridSize(5)).toBe(4);
    expect(calculateMooreGridSize(6)).toBe(8);
    expect(calculateMooreGridSize(10)).toBe(8);
    expect(calculateMooreGridSize(20)).toBe(16);
  });

  it('should always return a power of 2', () => {
    for (let i = 2; i <= 64; i++) {
      const result = calculateMooreGridSize(i);
      expect(Math.log2(result) % 1).toBe(0);
    }
  });

  it('should handle minimum grid size', () => {
    const result = calculateMooreGridSize(2);
    expect(result).toBe(2);
  });
});

describe('generateRandomPoints', () => {
  it('should generate the requested number of points', () => {
    const mooreGridSize = 16;
    const numPoints = 10;
    const points = generateRandomPoints(mooreGridSize, numPoints);
    expect(points.length).toBe(numPoints);
  });

  it('should generate points with valid coordinates', () => {
    const mooreGridSize = 16;
    const points = generateRandomPoints(mooreGridSize, 5);
    points.forEach((point) => {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(mooreGridSize);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(mooreGridSize);
    });
  });

  it('should generate unique points', () => {
    const mooreGridSize = 16;
    const points = generateRandomPoints(mooreGridSize, 10);
    const uniqueKeys = new Set(points.map((p) => `${p.x},${p.y}`));
    expect(uniqueKeys.size).toBe(points.length);
  });

  it('should assign sequential IDs', () => {
    const points = generateRandomPoints(16, 5);
    points.forEach((point, idx) => {
      expect(point.id).toBe(idx);
    });
  });
});

describe('distance', () => {
  it('should calculate distance between two points', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 3, y: 4 };
    expect(distance(p1, p2)).toBe(5);
  });

  it('should return 0 for same point', () => {
    const p = { x: 5, y: 5 };
    expect(distance(p, p)).toBe(0);
  });

  it('should handle negative coordinates', () => {
    const p1 = { x: -3, y: -4 };
    const p2 = { x: 0, y: 0 };
    expect(distance(p1, p2)).toBe(5);
  });
});

describe('calculateTotalDistance', () => {
  it('should return 0 for empty tour', () => {
    expect(calculateTotalDistance([], [])).toBe(0);
  });

  it('should return 0 for single point', () => {
    const points = [{ x: 0, y: 0 }];
    expect(calculateTotalDistance([0], points)).toBe(0);
  });

  it('should calculate correct closed loop distance', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 4 },
    ];
    const tour = [0, 1, 2];
    // 0->1: 3, 1->2: 4, 2->0: 5 = 12
    expect(calculateTotalDistance(tour, points)).toBe(12);
  });
});

// ============================================================
// Sonar Algorithm Tests
// ============================================================

describe('sonarAlgorithmSteps', () => {
  it('should return empty array for empty points', () => {
    expect(sonarAlgorithmSteps([])).toEqual([]);
  });

  it('should generate steps for all points', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const steps = sonarAlgorithmSteps(points);
    expect(steps.length).toBe(points.length);
  });

  it('should include all points in final tour', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const steps = sonarAlgorithmSteps(points);
    const finalTour = steps[steps.length - 1].tour;
    expect(finalTour.length).toBe(points.length);
    expect(new Set(finalTour).size).toBe(points.length);
  });

  it('should have sweep type for all steps', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
    ];
    const steps = sonarAlgorithmSteps(points);
    steps.forEach((step) => {
      expect(step.type).toBe('sweep');
    });
  });

  it('should include centroid in each step', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 6, y: 0, id: 1 },
      { x: 3, y: 6, id: 2 },
    ];
    const steps = sonarAlgorithmSteps(points);
    const expectedCentroid = { x: 3, y: 2 };
    steps.forEach((step) => {
      expect(step.centroid.x).toBe(expectedCentroid.x);
      expect(step.centroid.y).toBe(expectedCentroid.y);
    });
  });
});

describe('sonarSolution', () => {
  it('should return empty tour for empty points', () => {
    const result = sonarSolution([]);
    expect(result.tour).toEqual([]);
    expect(result.centroid).toBe(null);
  });

  it('should return tour with all point indices', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const result = sonarSolution(points);
    expect(result.tour.length).toBe(points.length);
    expect(new Set(result.tour).size).toBe(points.length);
  });
});

// ============================================================
// Moore Curve Algorithm Tests
// ============================================================

describe('generateMooreCurve', () => {
  it('should generate valid L-system sequence', () => {
    const sequence = generateMooreCurve(1);
    expect(sequence).toContain('F');
    expect(typeof sequence).toBe('string');
  });

  it('should expand sequence with higher order', () => {
    const order1 = generateMooreCurve(1);
    const order2 = generateMooreCurve(2);
    expect(order2.length).toBeGreaterThan(order1.length);
  });
});

describe('mooreCurveToPoints', () => {
  it('should generate curve points', () => {
    const sequence = generateMooreCurve(1);
    const points = mooreCurveToPoints(sequence, 2);
    expect(points.length).toBeGreaterThan(0);
  });

  it('should generate points within grid bounds', () => {
    const mooreGridSize = 16;
    const order = Math.round(Math.log2(mooreGridSize));
    const sequence = generateMooreCurve(order);
    const points = mooreCurveToPoints(sequence, mooreGridSize);
    points.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(mooreGridSize);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(mooreGridSize);
    });
  });

  it('should cover all grid vertices when order matches grid size', () => {
    // Moore curve of order N should cover all vertices of a 2^N x 2^N grid
    for (const mooreGridSize of [2, 4, 8, 16]) {
      const order = Math.round(Math.log2(mooreGridSize));
      const sequence = generateMooreCurve(order);
      const curvePoints = mooreCurveToPoints(sequence, mooreGridSize);
      const uniquePoints = new Set(curvePoints.map((p) => `${p.x},${p.y}`));
      const totalVertices = (mooreGridSize + 1) * (mooreGridSize + 1);
      expect(uniquePoints.size).toBe(totalVertices);
    }
  });

  it('should cover center of the grid (no cross-shaped gap)', () => {
    for (const mooreGridSize of [4, 8, 16]) {
      const order = Math.round(Math.log2(mooreGridSize));
      const sequence = generateMooreCurve(order);
      const curvePoints = mooreCurveToPoints(sequence, mooreGridSize);
      const uniquePoints = new Set(curvePoints.map((p) => `${p.x},${p.y}`));
      const mid = mooreGridSize / 2;
      // Check center point is covered
      expect(uniquePoints.has(`${mid},${mid}`)).toBe(true);
      // Check middle row and column are covered
      for (let i = 0; i <= mooreGridSize; i++) {
        expect(uniquePoints.has(`${mid},${i}`)).toBe(true);
        expect(uniquePoints.has(`${i},${mid}`)).toBe(true);
      }
    }
  });
});

describe('mooreAlgorithmSteps', () => {
  it('should return empty array for empty points', () => {
    expect(mooreAlgorithmSteps([], 16)).toEqual([]);
  });

  it('should generate curve step first', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 10, id: 1 },
    ];
    const steps = mooreAlgorithmSteps(points, 16);
    expect(steps[0].type).toBe('curve');
  });

  it('should include all points in final tour', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 8, y: 8, id: 1 },
      { x: 4, y: 12, id: 2 },
    ];
    const steps = mooreAlgorithmSteps(points, 16);
    const finalTour = steps[steps.length - 1].tour;
    expect(finalTour.length).toBe(points.length);
  });

  it('should include curve points in each step', () => {
    const points = [{ x: 5, y: 5, id: 0 }];
    const steps = mooreAlgorithmSteps(points, 16);
    steps.forEach((step) => {
      expect(step.curvePoints !== undefined).toBe(true);
      expect(step.curvePoints.length).toBeGreaterThan(0);
    });
  });
});

describe('mooreSolution', () => {
  it('should return empty tour for empty points', () => {
    const result = mooreSolution([], 16);
    expect(result.tour).toEqual([]);
    expect(result.curvePoints).toEqual([]);
  });

  it('should return tour with all point indices', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const result = mooreSolution(points, 16);
    expect(result.tour.length).toBe(points.length);
    expect(new Set(result.tour).size).toBe(points.length);
  });
});

// ============================================================
// Optimization Tests
// ============================================================

describe('sonarOptimizationSteps', () => {
  it('should return empty array for tour with less than 4 points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    const tour = [0, 1, 2];
    expect(sonarOptimizationSteps(points, tour)).toEqual([]);
  });

  it('should return optimization steps for valid tour', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    // Create a non-optimal tour
    const tour = [0, 2, 1, 3];
    const steps = sonarOptimizationSteps(points, tour);
    // May or may not have improvements depending on tour
    expect(Array.isArray(steps)).toBe(true);
  });

  it('should have optimize type for all steps', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
    ];
    const tour = [0, 2, 4, 1, 3];
    const steps = sonarOptimizationSteps(points, tour);
    steps.forEach((step) => {
      expect(step.type).toBe('optimize');
    });
  });
});

describe('sonarOptimization', () => {
  it('should return original tour for small inputs', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ];
    const tour = [0, 1];
    const result = sonarOptimization(points, tour);
    expect(result.tour).toEqual(tour);
    expect(result.improvement).toBe(0);
  });
});

describe('mooreOptimizationSteps', () => {
  it('should return empty array for tour with less than 4 points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    const tour = [0, 1, 2];
    expect(mooreOptimizationSteps(points, tour)).toEqual([]);
  });

  it('should have optimize type for all steps', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
    ];
    const tour = [0, 2, 4, 1, 3];
    const steps = mooreOptimizationSteps(points, tour);
    steps.forEach((step) => {
      expect(step.type).toBe('optimize');
    });
  });
});

describe('mooreOptimization', () => {
  it('should return original tour for small inputs', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ];
    const tour = [0, 1];
    const result = mooreOptimization(points, tour);
    expect(result.tour).toEqual(tour);
    expect(result.improvement).toBe(0);
  });

  it('should not increase tour distance', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
    ];
    const tour = [0, 2, 4, 1, 3];
    const originalDistance = calculateTotalDistance(tour, points);
    const result = mooreOptimization(points, tour);
    const newDistance = calculateTotalDistance(result.tour, points);
    expect(newDistance).toBeLessThanOrEqual(originalDistance);
  });
});

// ============================================================
// Generic Optimization Tests (new generic API)
// ============================================================

describe('twoOptSteps (generic 2-opt)', () => {
  it('should return empty array for tour with less than 4 points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    const tour = [0, 1, 2];
    expect(twoOptSteps(points, tour)).toEqual([]);
  });

  it('should work on any tour regardless of source algorithm', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
    ];
    // This is not from any specific algorithm
    const randomTour = [0, 2, 4, 1, 3];
    const steps = twoOptSteps(points, randomTour);
    expect(Array.isArray(steps)).toBe(true);
  });

  it('should respect maxIterations option', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    const tour = [0, 1, 2, 3];
    const steps = twoOptSteps(points, tour, { maxIterations: 1 });
    // Should still return valid array
    expect(Array.isArray(steps)).toBe(true);
  });
});

describe('twoOpt (generic atomic 2-opt)', () => {
  it('should return original tour for small inputs', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ];
    const tour = [0, 1];
    const result = twoOpt(points, tour);
    expect(result.tour).toEqual(tour);
    expect(result.improvement).toBe(0);
  });

  it('should never increase tour distance', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
    ];
    const tour = [0, 2, 4, 1, 3];
    const originalDistance = calculateTotalDistance(tour, points);
    const result = twoOpt(points, tour);
    const newDistance = calculateTotalDistance(result.tour, points);
    expect(newDistance).toBeLessThanOrEqual(originalDistance);
  });
});

describe('zigzagOptSteps (generic zigzag)', () => {
  it('should return empty array for tour with less than 4 points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    const tour = [0, 1, 2];
    expect(zigzagOptSteps(points, tour)).toEqual([]);
  });

  it('should work on any tour regardless of source algorithm', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
    ];
    // This is not from any specific algorithm
    const randomTour = [0, 2, 4, 1, 3];
    const steps = zigzagOptSteps(points, randomTour);
    expect(Array.isArray(steps)).toBe(true);
  });
});

describe('zigzagOpt (generic atomic zigzag)', () => {
  it('should return original tour for small inputs', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ];
    const tour = [0, 1];
    const result = zigzagOpt(points, tour);
    expect(result.tour).toEqual(tour);
    expect(result.improvement).toBe(0);
  });

  it('should never increase tour distance', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
    ];
    const tour = [0, 2, 4, 1, 3];
    const originalDistance = calculateTotalDistance(tour, points);
    const result = zigzagOpt(points, tour);
    const newDistance = calculateTotalDistance(result.tour, points);
    expect(newDistance).toBeLessThanOrEqual(originalDistance);
  });
});
