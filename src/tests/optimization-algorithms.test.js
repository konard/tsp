/**
 * Tests for new optimization algorithms: 3-opt, k-opt, Lin-Kernighan, LKH
 * Works with Bun test runner
 */

import { describe, it, expect } from 'bun:test';
import { calculateTotalDistance } from '../lib/algorithms/utils.js';
import { sonarSolution } from '../lib/algorithms/progressive/solution/sonar.js';
import {
  threeOptSteps,
  threeOpt,
} from '../lib/algorithms/progressive/optimization/three-opt.js';
import {
  kOptSteps,
  kOpt,
} from '../lib/algorithms/progressive/optimization/k-opt.js';
import {
  linKernighanSteps,
  linKernighan,
} from '../lib/algorithms/progressive/optimization/lin-kernighan.js';
import {
  lkHelsgaunSteps,
  lkHelsgaun,
} from '../lib/algorithms/progressive/optimization/lk-helsgaun.js';
import { twoOpt } from '../lib/algorithms/progressive/optimization/two-opt.js';

// ============================================================
// 3-opt Optimization Tests
// ============================================================

describe('threeOptSteps (progressive 3-opt)', () => {
  it('should return empty array for tour with less than 6 points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 4 },
    ];
    expect(threeOptSteps(points, [0, 1, 2, 3, 4])).toEqual([]);
  });

  it('should work on any tour regardless of source algorithm', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
      { x: 3, y: 7 },
    ];
    const randomTour = [0, 2, 4, 1, 5, 3];
    const steps = threeOptSteps(points, randomTour);
    expect(Array.isArray(steps)).toBe(true);
    steps.forEach((step) => expect(step.type).toBe('optimize'));
  });
});

describe('threeOpt (atomic 3-opt)', () => {
  it('should return original tour for small inputs', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ];
    const result = threeOpt(points, [0, 1]);
    expect(result.tour).toEqual([0, 1]);
    expect(result.improvement).toBe(0);
  });

  it('should never increase tour distance', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
      { x: 3, y: 7 },
    ];
    const tour = [0, 2, 4, 1, 5, 3];
    const originalDistance = calculateTotalDistance(tour, points);
    const result = threeOpt(points, tour);
    const newDistance = calculateTotalDistance(result.tour, points);
    expect(newDistance).toBeLessThanOrEqual(originalDistance + 0.001);
  });

  it('should respect maxIterations option', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
      { x: 3, y: 7 },
    ];
    const result = threeOpt(points, [0, 1, 2, 3, 4, 5], {
      maxIterations: 1,
    });
    expect(result.tour.length).toBe(6);
    expect(result.improvement).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================
// k-opt Optimization Tests
// ============================================================

describe('kOptSteps (progressive k-opt)', () => {
  it('should return empty array for tour with less than 4 points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    expect(kOptSteps(points, [0, 1, 2])).toEqual([]);
  });

  it('should work on any tour', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
      { x: 3, y: 7 },
    ];
    const steps = kOptSteps(points, [0, 2, 4, 1, 5, 3]);
    expect(Array.isArray(steps)).toBe(true);
    steps.forEach((step) => expect(step.type).toBe('optimize'));
  });
});

describe('kOpt (atomic k-opt)', () => {
  it('should return original tour for small inputs', () => {
    const result = kOpt(
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      [0, 1]
    );
    expect(result.tour).toEqual([0, 1]);
    expect(result.improvement).toBe(0);
  });

  it('should never increase tour distance', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
      { x: 3, y: 7 },
    ];
    const tour = [0, 2, 4, 1, 5, 3];
    const originalDistance = calculateTotalDistance(tour, points);
    const result = kOpt(points, tour);
    const newDistance = calculateTotalDistance(result.tour, points);
    expect(newDistance).toBeLessThanOrEqual(originalDistance + 0.001);
  });

  it('should accept k configuration', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
      { x: 3, y: 7 },
    ];
    const result = kOpt(points, [0, 1, 2, 3, 4, 5], { k: 2 });
    expect(result.tour.length).toBe(6);
    expect(result.improvement).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================
// Lin-Kernighan Optimization Tests
// ============================================================

describe('linKernighanSteps (progressive LK)', () => {
  it('should return empty array for tour with less than 4 points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    expect(linKernighanSteps(points, [0, 1, 2])).toEqual([]);
  });

  it('should work on any tour', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
    ];
    const steps = linKernighanSteps(points, [0, 2, 4, 1, 3]);
    expect(Array.isArray(steps)).toBe(true);
    steps.forEach((step) => expect(step.type).toBe('optimize'));
  });
});

describe('linKernighan (atomic LK)', () => {
  it('should return original tour for small inputs', () => {
    const result = linKernighan(
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      [0, 1]
    );
    expect(result.tour).toEqual([0, 1]);
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
    const result = linKernighan(points, tour);
    const newDistance = calculateTotalDistance(result.tour, points);
    expect(newDistance).toBeLessThanOrEqual(originalDistance + 0.001);
  });

  it('should accept maxDepth configuration', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
    ];
    const result = linKernighan(points, [0, 1, 2, 3, 4], { maxDepth: 3 });
    expect(result.tour.length).toBe(5);
    expect(result.improvement).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================
// Lin-Kernighan-Helsgaun Optimization Tests
// ============================================================

describe('lkHelsgaunSteps (progressive LKH)', () => {
  it('should return empty array for tour with less than 4 points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    expect(lkHelsgaunSteps(points, [0, 1, 2])).toEqual([]);
  });

  it('should work on any tour', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
    ];
    const steps = lkHelsgaunSteps(points, [0, 2, 4, 1, 3], {
      perturbations: 1,
    });
    expect(Array.isArray(steps)).toBe(true);
    steps.forEach((step) => expect(step.type).toBe('optimize'));
  });
});

describe('lkHelsgaun (atomic LKH)', () => {
  it('should return original tour for small inputs', () => {
    const result = lkHelsgaun(
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      [0, 1]
    );
    expect(result.tour).toEqual([0, 1]);
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
    const result = lkHelsgaun(points, tour, { perturbations: 1 });
    const newDistance = calculateTotalDistance(result.tour, points);
    expect(newDistance).toBeLessThanOrEqual(originalDistance + 0.001);
  });

  it('should accept perturbations configuration', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
    ];
    const result = lkHelsgaun(points, [0, 1, 2, 3, 4], { perturbations: 2 });
    expect(result.tour.length).toBe(5);
    expect(result.improvement).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================
// Cross-Algorithm Optimization Quality Tests
// ============================================================

describe('optimization quality comparison', () => {
  const points = [
    { x: 0, y: 0, id: 0 },
    { x: 10, y: 0, id: 1 },
    { x: 10, y: 10, id: 2 },
    { x: 0, y: 10, id: 3 },
    { x: 5, y: 5, id: 4 },
    { x: 3, y: 7, id: 5 },
    { x: 7, y: 3, id: 6 },
    { x: 8, y: 8, id: 7 },
  ];

  it('all optimizations should improve or maintain a non-optimal tour', () => {
    const sonarResult = sonarSolution(points);
    const initialTour = sonarResult.tour;
    const initialDist = calculateTotalDistance(initialTour, points);

    const twoOptResult = twoOpt(points, initialTour);
    const threeOptResult = threeOpt(points, initialTour);
    const kOptResult = kOpt(points, initialTour);
    const lkResult = linKernighan(points, initialTour);
    const lkhResult = lkHelsgaun(points, initialTour, { perturbations: 1 });

    expect(
      calculateTotalDistance(twoOptResult.tour, points)
    ).toBeLessThanOrEqual(initialDist + 0.001);
    expect(
      calculateTotalDistance(threeOptResult.tour, points)
    ).toBeLessThanOrEqual(initialDist + 0.001);
    expect(calculateTotalDistance(kOptResult.tour, points)).toBeLessThanOrEqual(
      initialDist + 0.001
    );
    expect(calculateTotalDistance(lkResult.tour, points)).toBeLessThanOrEqual(
      initialDist + 0.001
    );
    expect(calculateTotalDistance(lkhResult.tour, points)).toBeLessThanOrEqual(
      initialDist + 0.001
    );
  });

  it('all optimized tours should contain all points', () => {
    const initialTour = [0, 1, 2, 3, 4, 5, 6, 7];

    const results = [
      threeOpt(points, initialTour),
      kOpt(points, initialTour),
      linKernighan(points, initialTour),
      lkHelsgaun(points, initialTour, { perturbations: 1 }),
    ];

    for (const result of results) {
      expect(result.tour.length).toBe(points.length);
      expect(new Set(result.tour).size).toBe(points.length);
    }
  });
});
