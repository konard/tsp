/**
 * Test file for Peano curve TSP algorithm
 * Works with Bun test runner
 */

import { describe, it, expect } from 'bun:test';
import {
  calculatePeanoGridSize,
  distance,
  calculateTotalDistance,
  VALID_PEANO_GRID_SIZES,
} from '../lib/algorithms/utils.js';
import {
  peanoAlgorithmSteps,
  peanoSolution,
  generatePeanoCurve,
  peanoCurveToPoints,
} from '../lib/algorithms/progressive/solution/peano.js';
import { sonarSolution } from '../lib/algorithms/progressive/solution/sonar.js';
import { bruteForceSolution } from '../lib/algorithms/progressive/solution/brute-force.js';

// ============================================================
// Peano Utility Tests
// ============================================================

describe('VALID_PEANO_GRID_SIZES', () => {
  it('should contain only powers of 3', () => {
    VALID_PEANO_GRID_SIZES.forEach((size) => {
      // Verify it's a power of 3
      let val = size;
      while (val > 1 && val % 3 === 0) {
        val /= 3;
      }
      expect(val).toBe(1);
    });
  });

  it('should be sorted in ascending order', () => {
    for (let i = 1; i < VALID_PEANO_GRID_SIZES.length; i++) {
      expect(VALID_PEANO_GRID_SIZES[i]).toBeGreaterThan(
        VALID_PEANO_GRID_SIZES[i - 1]
      );
    }
  });

  it('should contain expected sizes', () => {
    expect(VALID_PEANO_GRID_SIZES).toEqual([3, 9, 27, 81]);
  });
});

describe('calculatePeanoGridSize', () => {
  it('should return smallest valid size >= input', () => {
    expect(calculatePeanoGridSize(2)).toBe(3);
    expect(calculatePeanoGridSize(3)).toBe(3);
    expect(calculatePeanoGridSize(4)).toBe(9);
    expect(calculatePeanoGridSize(9)).toBe(9);
    expect(calculatePeanoGridSize(10)).toBe(27);
    expect(calculatePeanoGridSize(27)).toBe(27);
    expect(calculatePeanoGridSize(28)).toBe(81);
    expect(calculatePeanoGridSize(81)).toBe(81);
    expect(calculatePeanoGridSize(82)).toBe(81);
  });

  it('should always return a valid Peano grid size', () => {
    for (let gs = 1; gs <= 100; gs++) {
      const result = calculatePeanoGridSize(gs);
      expect(VALID_PEANO_GRID_SIZES).toContain(result);
    }
  });
});

// ============================================================
// Peano Curve Generation Tests
// ============================================================

describe('generatePeanoCurve', () => {
  it('should generate valid L-system sequence', () => {
    const sequence = generatePeanoCurve(1);
    expect(sequence).toContain('F');
    expect(typeof sequence).toBe('string');
  });

  it('should expand sequence with higher order', () => {
    const order1 = generatePeanoCurve(1);
    const order2 = generatePeanoCurve(2);
    expect(order2.length).toBeGreaterThan(order1.length);
  });
});

describe('peanoCurveToPoints', () => {
  it('should generate curve points', () => {
    const sequence = generatePeanoCurve(1);
    const points = peanoCurveToPoints(sequence, 3);
    expect(points.length).toBeGreaterThan(0);
  });

  it('should generate points within [0, gridSize-1] bounds', () => {
    const peanoGridSize = 9;
    const sequence = generatePeanoCurve(2);
    const points = peanoCurveToPoints(sequence, peanoGridSize);
    points.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(peanoGridSize - 1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(peanoGridSize - 1);
    });
  });
});

// ============================================================
// Peano Curve Point Verification Tests
// ============================================================

/**
 * Helper: generate Peano curve points for a given grid size.
 * Grid size must be a power of 3 (3, 9, 27, 81).
 * Returns normalized points in [0, gridSize-1] range.
 */
function getPeanoCurvePoints(gridSize) {
  const order = Math.round(Math.log(gridSize) / Math.log(3));
  const sequence = generatePeanoCurve(order);
  return peanoCurveToPoints(sequence, gridSize);
}

describe('Peano curve point-by-point verification (3x3)', () => {
  const gridSize = 3;
  const points = getPeanoCurvePoints(gridSize);

  it('should have exactly 9 vertices', () => {
    expect(points.length).toBe(9);
  });

  it('should visit all 9 grid cells', () => {
    const unique = new Set(points.map((p) => `${p.x},${p.y}`));
    expect(unique.size).toBe(9);
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
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
});

describe('Peano curve verification (9x9)', () => {
  const gridSize = 9;
  const points = getPeanoCurvePoints(gridSize);

  it('should have exactly 81 vertices', () => {
    expect(points.length).toBe(81);
  });

  it('should visit all 81 grid cells', () => {
    const unique = new Set(points.map((p) => `${p.x},${p.y}`));
    expect(unique.size).toBe(81);
  });

  it('should have all consecutive points adjacent (distance 1)', () => {
    for (let i = 0; i < points.length - 1; i++) {
      const d = distance(points[i], points[i + 1]);
      expect(d).toBe(1);
    }
  });

  it('should have all points within [0, 8] range', () => {
    points.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(8);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(8);
    });
  });
});

describe('Peano curve verification (27x27)', () => {
  const gridSize = 27;
  const points = getPeanoCurvePoints(gridSize);

  it('should have exactly 729 vertices', () => {
    expect(points.length).toBe(729);
  });

  it('should visit all 729 grid cells', () => {
    const unique = new Set(points.map((p) => `${p.x},${p.y}`));
    expect(unique.size).toBe(729);
  });

  it('should have all consecutive points adjacent (distance 1)', () => {
    for (let i = 0; i < points.length - 1; i++) {
      const d = distance(points[i], points[i + 1]);
      expect(d).toBe(1);
    }
  });

  it('should have all points within [0, 26] range', () => {
    points.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(26);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(26);
    });
  });
});

describe('Peano curve properties for all valid grid sizes', () => {
  const testSizes = [3, 9, 27];

  testSizes.forEach((gridSize) => {
    describe(`grid size ${gridSize}x${gridSize}`, () => {
      const points = getPeanoCurvePoints(gridSize);

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
    });
  });
});

// ============================================================
// Peano Algorithm Steps Tests
// ============================================================

describe('peanoAlgorithmSteps', () => {
  it('should return empty array for empty points', () => {
    expect(peanoAlgorithmSteps([], 9)).toEqual([]);
  });

  it('should generate curve step first', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 8, y: 8, id: 1 },
    ];
    const steps = peanoAlgorithmSteps(points, 9);
    expect(steps[0].type).toBe('curve');
  });

  it('should include all points in final tour', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 4, y: 4, id: 1 },
      { x: 8, y: 8, id: 2 },
    ];
    const steps = peanoAlgorithmSteps(points, 9);
    const finalTour = steps[steps.length - 1].tour;
    expect(finalTour.length).toBe(points.length);
  });

  it('should include curve points in each step', () => {
    const points = [{ x: 4, y: 4, id: 0 }];
    const steps = peanoAlgorithmSteps(points, 9);
    steps.forEach((step) => {
      expect(step.curvePoints !== undefined).toBe(true);
      expect(step.curvePoints.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================
// Peano Solution Tests
// ============================================================

describe('peanoSolution', () => {
  it('should return empty tour for empty points', () => {
    const result = peanoSolution([], 9);
    expect(result.tour).toEqual([]);
    expect(result.curvePoints).toEqual([]);
  });

  it('should return tour with all point indices', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 8, y: 0, id: 1 },
      { x: 4, y: 8, id: 2 },
    ];
    const result = peanoSolution(points, 9);
    expect(result.tour.length).toBe(points.length);
    expect(new Set(result.tour).size).toBe(points.length);
  });

  it('should return curve points', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 4, y: 4, id: 1 },
    ];
    const result = peanoSolution(points, 9);
    expect(result.curvePoints.length).toBeGreaterThan(0);
  });
});

// ============================================================
// Integration: Peano with Verification
// ============================================================

describe('Peano tour verification', () => {
  it('should produce valid tour not worse than brute-force allows', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 8, y: 0, id: 1 },
      { x: 8, y: 8, id: 2 },
      { x: 0, y: 8, id: 3 },
      { x: 4, y: 4, id: 4 },
    ];
    const peanoResult = peanoSolution(points, 9);
    const peanoDist = calculateTotalDistance(peanoResult.tour, points);
    const bfResult = bruteForceSolution(points);
    expect(bfResult.distance).toBeLessThanOrEqual(peanoDist + 0.001);
  });

  it('should produce a tour competitive with sonar', () => {
    // Peano curve should produce reasonable tour quality
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 8, y: 0, id: 1 },
      { x: 8, y: 8, id: 2 },
      { x: 0, y: 8, id: 3 },
    ];
    const peanoResult = peanoSolution(points, 9);
    const peanoDist = calculateTotalDistance(peanoResult.tour, points);
    const sonarResult = sonarSolution(points);
    const sonarDist = calculateTotalDistance(sonarResult.tour, points);
    // Both should find reasonable tours - within 3x of each other
    expect(peanoDist).toBeLessThan(sonarDist * 3);
    expect(sonarDist).toBeLessThan(peanoDist * 3);
  });
});
