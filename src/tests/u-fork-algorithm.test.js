/**
 * Test file for U-fork fractal TSP algorithm
 * Works with Bun test runner
 */

import { describe, it, expect } from 'bun:test';
import {
  uForkAlgorithmSteps,
  uForkSolution,
  generateUForkCurve,
  uForkCurveToPoints,
} from '../lib/algorithms/progressive/solution/u-fork.js';
import {
  generateRandomPoints,
  calculateTotalDistance,
  distance,
} from '../lib/algorithms/utils.js';

// ============================================================
// U-fork Curve Generation Tests
// ============================================================

describe('generateUForkCurve', () => {
  it('should generate valid order identifier string', () => {
    const sequence = generateUForkCurve(1);
    expect(typeof sequence).toBe('string');
    expect(sequence.length).toBeGreaterThan(0);
  });

  it('should produce different identifiers for different orders', () => {
    const order1 = generateUForkCurve(1);
    const order2 = generateUForkCurve(2);
    expect(order1).not.toBe(order2);
  });

  it('should produce identifier for order 0', () => {
    const sequence = generateUForkCurve(0);
    expect(typeof sequence).toBe('string');
    expect(sequence.length).toBeGreaterThan(0);
  });

  it('should produce identifier for order 1', () => {
    const sequence = generateUForkCurve(1);
    expect(typeof sequence).toBe('string');
    expect(sequence.length).toBeGreaterThan(0);
  });
});

describe('uForkCurveToPoints', () => {
  it('should generate curve points', () => {
    const sequence = generateUForkCurve(1);
    const points = uForkCurveToPoints(sequence, 2);
    expect(points.length).toBeGreaterThan(0);
  });

  it('should generate points within [0, gridSize-1] bounds', () => {
    const gridSize = 16;
    const sequence = generateUForkCurve(4);
    const points = uForkCurveToPoints(sequence, gridSize);
    points.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(gridSize - 1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(gridSize - 1);
    });
  });

  it('should fill the grid at various orders', () => {
    for (let order = 1; order <= 3; order++) {
      const gridSize = Math.pow(2, order);
      const sequence = generateUForkCurve(order);
      const points = uForkCurveToPoints(sequence, gridSize);

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
// U-fork Progressive Algorithm Tests
// ============================================================

describe('uForkAlgorithmSteps', () => {
  it('should return empty array for empty points', () => {
    expect(uForkAlgorithmSteps([], 16)).toEqual([]);
  });

  it('should generate curve step first', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 10, id: 1 },
    ];
    const steps = uForkAlgorithmSteps(points, 16);
    expect(steps[0].type).toBe('curve');
  });

  it('should include all points in final tour', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 8, y: 8, id: 1 },
      { x: 4, y: 12, id: 2 },
    ];
    const steps = uForkAlgorithmSteps(points, 16);
    const finalTour = steps[steps.length - 1].tour;
    expect(finalTour.length).toBe(points.length);
  });

  it('should include curve points in each step', () => {
    const points = [{ x: 5, y: 5, id: 0 }];
    const steps = uForkAlgorithmSteps(points, 16);
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
    const steps = uForkAlgorithmSteps(points, 16);
    // 1 curve step + n visit steps
    expect(steps.length).toBe(points.length + 1);
  });

  it('should have visit type for all non-first steps', () => {
    const points = [
      { x: 1, y: 1, id: 0 },
      { x: 5, y: 5, id: 1 },
    ];
    const steps = uForkAlgorithmSteps(points, 16);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].type).toBe('visit');
    }
  });
});

// ============================================================
// U-fork Atomic Solution Tests
// ============================================================

describe('uForkSolution', () => {
  it('should return empty tour for empty points', () => {
    const result = uForkSolution([], 16);
    expect(result.tour).toEqual([]);
    expect(result.curvePoints).toEqual([]);
  });

  it('should return tour with all point indices', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const result = uForkSolution(points, 16);
    expect(result.tour.length).toBe(points.length);
    expect(new Set(result.tour).size).toBe(points.length);
  });

  it('should return curve points', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
    ];
    const result = uForkSolution(points, 16);
    expect(result.curvePoints.length).toBeGreaterThan(0);
  });

  it('should produce valid tour for random points', () => {
    const gridSize = 16;
    const numPoints = 20;
    const points = generateRandomPoints(gridSize, numPoints);
    const result = uForkSolution(points, gridSize);

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
      const result = uForkSolution(points, gridSize);
      expect(result.tour.length).toBe(5);
      expect(result.curvePoints.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================
// U-fork Curve Point-by-Point Verification Tests
// ============================================================

/**
 * Helper: generate U-fork curve points for a given grid size.
 * Grid size must be a power of 2 (2, 4, 8, 16, 32).
 * Returns normalized points in [0, gridSize-1] range.
 */
function getUForkCurvePoints(gridSize) {
  const order = Math.round(Math.log2(gridSize));
  const sequence = generateUForkCurve(order);
  return uForkCurveToPoints(sequence, gridSize);
}

describe('U-fork curve point-by-point verification (2x2)', () => {
  const gridSize = 2;
  const points = getUForkCurvePoints(gridSize);

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

  it('should have all consecutive points adjacent (distance 1)', () => {
    for (let i = 0; i < points.length - 1; i++) {
      const d = distance(points[i], points[i + 1]);
      expect(d).toBe(1);
    }
  });
});

describe('U-fork curve point-by-point verification (4x4)', () => {
  const gridSize = 4;
  const points = getUForkCurvePoints(gridSize);

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

  it('should have all consecutive points adjacent (distance 1)', () => {
    for (let i = 0; i < points.length - 1; i++) {
      const d = distance(points[i], points[i + 1]);
      expect(d).toBe(1);
    }
  });
});

describe('U-fork curve verification (8x8)', () => {
  const gridSize = 8;
  const points = getUForkCurvePoints(gridSize);

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

  it('should have all points within [0, 7] range', () => {
    points.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(7);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(7);
    });
  });
});

describe('U-fork curve verification (16x16)', () => {
  const gridSize = 16;
  const points = getUForkCurvePoints(gridSize);

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
});

describe('U-fork curve verification (32x32)', () => {
  const gridSize = 32;
  const points = getUForkCurvePoints(gridSize);

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
});

// ============================================================
// U-fork Curve Edge Verification Tests
// ============================================================

describe('U-fork curve edge verification (2x2)', () => {
  const points = getUForkCurvePoints(2);

  it('should have correct edges', () => {
    const edges = [];
    for (let i = 0; i < points.length - 1; i++) {
      edges.push(
        `(${points[i].x},${points[i].y})->(${points[i + 1].x},${points[i + 1].y})`
      );
    }
    // Should have 3 edges for 4 points
    expect(edges.length).toBe(3);
  });
});

describe('U-fork curve edge verification (4x4)', () => {
  const points = getUForkCurvePoints(4);

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
// U-fork Curve Properties Tests (all valid sizes)
// ============================================================

describe('U-fork curve properties for valid grid sizes', () => {
  // Test for 2, 4, 8, 16, 32 (skip 64 to keep test fast)
  const testSizes = [2, 4, 8, 16, 32];

  testSizes.forEach((gridSize) => {
    describe(`grid size ${gridSize}x${gridSize}`, () => {
      const points = getUForkCurvePoints(gridSize);

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
