/**
 * Test file for TSP algorithms
 * Works with Node.js, Bun, and Deno
 */

import { describe, it, expect } from 'test-anywhere';
import {
  calculateMooreGridSize,
  generateRandomPoints,
  distance,
  calculateTotalDistance,
} from '../src/algorithms/utils.js';
import {
  sonarAlgorithmSteps,
  sonarSolution,
} from '../src/algorithms/progressive/solutions/sonar.js';
import {
  mooreAlgorithmSteps,
  mooreSolution,
  generateMooreCurve,
  mooreCurveToPoints,
} from '../src/algorithms/progressive/solutions/moore.js';
import {
  sonarOptimizationSteps,
  sonarOptimization,
} from '../src/algorithms/progressive/optimizations/sonar-opt.js';
import {
  mooreOptimizationSteps,
  mooreOptimization,
} from '../src/algorithms/progressive/optimizations/moore-opt.js';

// ============================================================
// Utility Functions Tests
// ============================================================

describe('calculateMooreGridSize', () => {
  it('should return power of 2 for grid size 10', () => {
    expect(calculateMooreGridSize(10)).toBe(16);
  });

  it('should return power of 2 for grid size 5', () => {
    expect(calculateMooreGridSize(5)).toBe(8);
  });

  it('should return power of 2 for grid size 20', () => {
    expect(calculateMooreGridSize(20)).toBe(32);
  });

  it('should handle minimum grid size', () => {
    const result = calculateMooreGridSize(2);
    expect(result).toBeGreaterThanOrEqual(4);
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
    const points = mooreCurveToPoints(sequence, 16);
    expect(points.length).toBeGreaterThan(0);
  });

  it('should generate points within grid bounds', () => {
    const mooreGridSize = 16;
    const sequence = generateMooreCurve(2);
    const points = mooreCurveToPoints(sequence, mooreGridSize);
    points.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(mooreGridSize);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(mooreGridSize);
    });
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
