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
  VALID_GRID_SIZES,
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

describe('VALID_GRID_SIZES', () => {
  it('should contain only powers of 2', () => {
    VALID_GRID_SIZES.forEach((size) => {
      expect(Math.log2(size) % 1).toBe(0);
    });
  });

  it('should be sorted in ascending order', () => {
    for (let i = 1; i < VALID_GRID_SIZES.length; i++) {
      expect(VALID_GRID_SIZES[i]).toBeGreaterThan(VALID_GRID_SIZES[i - 1]);
    }
  });

  it('should contain expected sizes', () => {
    expect(VALID_GRID_SIZES).toEqual([2, 4, 8, 16, 32, 64]);
  });
});

describe('calculateMooreGridSize', () => {
  it('should return smallest valid size >= input', () => {
    expect(calculateMooreGridSize(2)).toBe(2);
    expect(calculateMooreGridSize(3)).toBe(4);
    expect(calculateMooreGridSize(4)).toBe(4);
    expect(calculateMooreGridSize(5)).toBe(8);
    expect(calculateMooreGridSize(10)).toBe(16);
    expect(calculateMooreGridSize(16)).toBe(16);
    expect(calculateMooreGridSize(20)).toBe(32);
    expect(calculateMooreGridSize(32)).toBe(32);
    expect(calculateMooreGridSize(33)).toBe(64);
    expect(calculateMooreGridSize(64)).toBe(64);
  });

  it('should return largest valid size for very large input', () => {
    expect(calculateMooreGridSize(100)).toBe(64);
  });

  it('should always return a valid Moore grid size', () => {
    for (let gs = 1; gs <= 100; gs++) {
      const result = calculateMooreGridSize(gs);
      expect(VALID_GRID_SIZES).toContain(result);
    }
  });
});

describe('generateRandomPoints', () => {
  it('should generate the requested number of points', () => {
    const mooreGridSize = 16;
    const numPoints = 10;
    const points = generateRandomPoints(mooreGridSize, numPoints);
    expect(points.length).toBe(numPoints);
  });

  it('should generate points within [0, mooreGridSize-1] range', () => {
    const mooreGridSize = 16;
    const points = generateRandomPoints(mooreGridSize, 5);
    points.forEach((point) => {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(mooreGridSize - 1);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(mooreGridSize - 1);
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
    const points = mooreCurveToPoints(sequence, 4);
    expect(points.length).toBeGreaterThan(0);
  });

  it('should generate points within [0, gridSize-1] bounds', () => {
    const mooreGridSize = 16;
    // For mooreGridSize=16, iterations = log2(16) - 1 = 3
    const sequence = generateMooreCurve(3);
    const points = mooreCurveToPoints(sequence, mooreGridSize);
    points.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(mooreGridSize - 1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(mooreGridSize - 1);
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

// ============================================================
// Moore Curve Point-by-Point Verification Tests
// ============================================================

/**
 * Helper: generate Moore curve points for a given grid size.
 * Grid size must be a power of 2 (2, 4, 8, 16, 32, 64).
 * Returns normalized points in [0, gridSize-1] range.
 */
function getMooreCurvePoints(gridSize) {
  const iterations = Math.round(Math.log2(gridSize)) - 1;
  const sequence = generateMooreCurve(iterations);
  return mooreCurveToPoints(sequence, gridSize);
}

describe('Moore curve point-by-point verification (2x2)', () => {
  const gridSize = 2;
  const points = getMooreCurvePoints(gridSize);

  it('should have exactly 4 vertices', () => {
    expect(points.length).toBe(4);
  });

  it('should visit all 4 grid cells', () => {
    const unique = new Set(points.map((p) => `${p.x},${p.y}`));
    expect(unique.size).toBe(4);
    expect(unique.has('0,0')).toBe(true);
    expect(unique.has('0,1')).toBe(true);
    expect(unique.has('1,0')).toBe(true);
    expect(unique.has('1,1')).toBe(true);
  });

  it('should follow the exact path: (0,1) -> (0,0) -> (1,0) -> (1,1)', () => {
    expect(points[0]).toEqual({ x: 0, y: 1 });
    expect(points[1]).toEqual({ x: 0, y: 0 });
    expect(points[2]).toEqual({ x: 1, y: 0 });
    expect(points[3]).toEqual({ x: 1, y: 1 });
  });

  it('should have all consecutive points adjacent (distance 1)', () => {
    for (let i = 0; i < points.length - 1; i++) {
      const d = distance(points[i], points[i + 1]);
      expect(d).toBe(1);
    }
  });

  it('should form a closed loop (first and last points are adjacent)', () => {
    const d = distance(points[0], points[points.length - 1]);
    expect(d).toBe(1);
  });
});

describe('Moore curve point-by-point verification (4x4)', () => {
  const gridSize = 4;
  const points = getMooreCurvePoints(gridSize);

  it('should have exactly 16 vertices', () => {
    expect(points.length).toBe(16);
  });

  it('should visit all 16 grid cells', () => {
    const unique = new Set(points.map((p) => `${p.x},${p.y}`));
    expect(unique.size).toBe(16);
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        expect(unique.has(`${x},${y}`)).toBe(true);
      }
    }
  });

  it('should follow the exact 4x4 Moore curve path', () => {
    const expectedPath = [
      { x: 1, y: 3 },
      { x: 0, y: 3 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 2, y: 3 },
    ];
    expect(points).toEqual(expectedPath);
  });

  it('should have all consecutive points adjacent (distance 1)', () => {
    for (let i = 0; i < points.length - 1; i++) {
      const d = distance(points[i], points[i + 1]);
      expect(d).toBe(1);
    }
  });

  it('should form a closed loop', () => {
    const d = distance(points[0], points[points.length - 1]);
    expect(d).toBe(1);
  });
});

describe('Moore curve verification (8x8)', () => {
  const gridSize = 8;
  const points = getMooreCurvePoints(gridSize);

  it('should have exactly 64 vertices', () => {
    expect(points.length).toBe(64);
  });

  it('should visit all 64 grid cells', () => {
    const unique = new Set(points.map((p) => `${p.x},${p.y}`));
    expect(unique.size).toBe(64);
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        expect(unique.has(`${x},${y}`)).toBe(true);
      }
    }
  });

  it('should have all consecutive points adjacent (distance 1)', () => {
    for (let i = 0; i < points.length - 1; i++) {
      const d = distance(points[i], points[i + 1]);
      expect(d).toBe(1);
    }
  });

  it('should form a closed loop', () => {
    const d = distance(points[0], points[points.length - 1]);
    expect(d).toBe(1);
  });

  it('should have no cross-shaped gap (center row and column covered)', () => {
    const unique = new Set(points.map((p) => `${p.x},${p.y}`));
    // Center of 8x8 grid is at rows/columns 3 and 4
    for (let i = 0; i < 8; i++) {
      expect(unique.has(`${i},3`)).toBe(true);
      expect(unique.has(`${i},4`)).toBe(true);
      expect(unique.has(`3,${i}`)).toBe(true);
      expect(unique.has(`4,${i}`)).toBe(true);
    }
  });

  it('should have all points within [0, 7] range', () => {
    points.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(7);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(7);
    });
  });
});

describe('Moore curve verification (16x16)', () => {
  const gridSize = 16;
  const points = getMooreCurvePoints(gridSize);

  it('should have exactly 256 vertices', () => {
    expect(points.length).toBe(256);
  });

  it('should visit all 256 grid cells', () => {
    const unique = new Set(points.map((p) => `${p.x},${p.y}`));
    expect(unique.size).toBe(256);
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        expect(unique.has(`${x},${y}`)).toBe(true);
      }
    }
  });

  it('should have all consecutive points adjacent (distance 1)', () => {
    for (let i = 0; i < points.length - 1; i++) {
      const d = distance(points[i], points[i + 1]);
      expect(d).toBe(1);
    }
  });

  it('should form a closed loop', () => {
    const d = distance(points[0], points[points.length - 1]);
    expect(d).toBe(1);
  });

  it('should have no cross-shaped gap (center covered)', () => {
    const unique = new Set(points.map((p) => `${p.x},${p.y}`));
    for (let i = 0; i < 16; i++) {
      expect(unique.has(`${i},7`)).toBe(true);
      expect(unique.has(`${i},8`)).toBe(true);
      expect(unique.has(`7,${i}`)).toBe(true);
      expect(unique.has(`8,${i}`)).toBe(true);
    }
  });
});

describe('Moore curve verification (32x32)', () => {
  const gridSize = 32;
  const points = getMooreCurvePoints(gridSize);

  it('should have exactly 1024 vertices', () => {
    expect(points.length).toBe(1024);
  });

  it('should visit all 1024 grid cells', () => {
    const unique = new Set(points.map((p) => `${p.x},${p.y}`));
    expect(unique.size).toBe(1024);
    for (let x = 0; x < 32; x++) {
      for (let y = 0; y < 32; y++) {
        expect(unique.has(`${x},${y}`)).toBe(true);
      }
    }
  });

  it('should have all consecutive points adjacent (distance 1)', () => {
    for (let i = 0; i < points.length - 1; i++) {
      const d = distance(points[i], points[i + 1]);
      expect(d).toBe(1);
    }
  });

  it('should form a closed loop', () => {
    const d = distance(points[0], points[points.length - 1]);
    expect(d).toBe(1);
  });

  it('should have no cross-shaped gap (center covered)', () => {
    const unique = new Set(points.map((p) => `${p.x},${p.y}`));
    for (let i = 0; i < 32; i++) {
      expect(unique.has(`${i},15`)).toBe(true);
      expect(unique.has(`${i},16`)).toBe(true);
      expect(unique.has(`15,${i}`)).toBe(true);
      expect(unique.has(`16,${i}`)).toBe(true);
    }
  });
});

// ============================================================
// Moore Curve Edge Verification Tests
// ============================================================

describe('Moore curve edge verification (2x2)', () => {
  const points = getMooreCurvePoints(2);

  it('should have correct edges', () => {
    // Path: (0,1) -> (0,0) -> (1,0) -> (1,1)
    const edges = [];
    for (let i = 0; i < points.length - 1; i++) {
      edges.push(
        `(${points[i].x},${points[i].y})->(${points[i + 1].x},${points[i + 1].y})`
      );
    }
    expect(edges).toEqual(['(0,1)->(0,0)', '(0,0)->(1,0)', '(1,0)->(1,1)']);
  });

  it('should have closing edge back to start', () => {
    const last = points[points.length - 1];
    const first = points[0];
    const d = distance(last, first);
    expect(d).toBe(1);
    // (1,1) -> (0,1) closing edge
    expect(last).toEqual({ x: 1, y: 1 });
    expect(first).toEqual({ x: 0, y: 1 });
  });
});

describe('Moore curve edge verification (4x4)', () => {
  const points = getMooreCurvePoints(4);

  it('should have exactly 15 edges (16 vertices - 1)', () => {
    const edges = [];
    for (let i = 0; i < points.length - 1; i++) {
      edges.push({
        from: points[i],
        to: points[i + 1],
      });
    }
    expect(edges.length).toBe(15);
  });

  it('should have all edges with length 1 (horizontal or vertical)', () => {
    for (let i = 0; i < points.length - 1; i++) {
      const dx = Math.abs(points[i + 1].x - points[i].x);
      const dy = Math.abs(points[i + 1].y - points[i].y);
      // Each edge must be exactly 1 unit horizontal or vertical
      expect((dx === 1 && dy === 0) || (dx === 0 && dy === 1)).toBe(true);
    }
  });

  it('should have no self-intersecting edges', () => {
    // All edges connect distinct vertices, and all vertices are unique
    const visited = new Set();
    for (const p of points) {
      const key = `${p.x},${p.y}`;
      expect(visited.has(key)).toBe(false);
      visited.add(key);
    }
  });
});

// ============================================================
// Moore Curve Properties Tests (all valid sizes)
// ============================================================

describe('Moore curve properties for all valid grid sizes', () => {
  // Test for 2, 4, 8, 16, 32 (skip 64 to keep test fast)
  const testSizes = [2, 4, 8, 16, 32];

  testSizes.forEach((gridSize) => {
    describe(`grid size ${gridSize}x${gridSize}`, () => {
      const points = getMooreCurvePoints(gridSize);

      it(`should have exactly ${gridSize * gridSize} vertices`, () => {
        expect(points.length).toBe(gridSize * gridSize);
      });

      it('should visit every grid cell exactly once', () => {
        const unique = new Set(points.map((p) => `${p.x},${p.y}`));
        expect(unique.size).toBe(gridSize * gridSize);
      });

      it('should have all points within [0, gridSize-1]', () => {
        points.forEach((p) => {
          expect(p.x).toBeGreaterThanOrEqual(0);
          expect(p.x).toBeLessThanOrEqual(gridSize - 1);
          expect(p.y).toBeGreaterThanOrEqual(0);
          expect(p.y).toBeLessThanOrEqual(gridSize - 1);
        });
      });

      it('should have all consecutive points adjacent (distance 1)', () => {
        for (let i = 0; i < points.length - 1; i++) {
          const d = distance(points[i], points[i + 1]);
          expect(d).toBe(1);
        }
      });

      it('should form a closed loop', () => {
        const d = distance(points[0], points[points.length - 1]);
        expect(d).toBe(1);
      });
    });
  });
});
