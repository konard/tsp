import { describe, expect, it } from 'bun:test';
import {
  controlZoneLowerBound,
  oneTreeLowerBound,
  verifyOptimality,
} from '../lib/algorithms/verification/index.js';
import { bruteForceSolution } from '../lib/algorithms/atomic/solution/brute-force.js';
import { distance } from '../lib/algorithms/utils.js';

describe('Waterloo geometric lower bounds', () => {
  it('uses disjoint control zones to bound the optimal tour', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 2 },
    ];
    const result = controlZoneLowerBound(points);
    expect(result.lowerBound).toBe(6);
    expect(result.radii).toEqual([1, 1, 1]);
    expect(result.lowerBound).toBeLessThan(bruteForceSolution(points).distance);
  });

  it('never exceeds exact tour length on representative point sets', () => {
    const cases = [
      [],
      [{ x: 1, y: 1 }],
      [
        { x: 0, y: 0 },
        { x: 3, y: 4 },
      ],
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
      ],
      [
        { x: 0, y: 0 },
        { x: 1, y: 3 },
        { x: 5, y: 1 },
        { x: 7, y: 6 },
        { x: 2, y: 8 },
      ],
    ];
    for (const points of cases) {
      const bound = controlZoneLowerBound(points);
      expect(bound.lowerBound).toBeLessThanOrEqual(
        bruteForceSolution(points).distance + 1e-9
      );
    }
  });

  it('keeps every disk disjoint and the bound valid across deterministic examples', () => {
    let seed = 62;
    const random = () => {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 2 ** 32;
    };
    for (let trial = 0; trial < 40; trial++) {
      const points = Array.from({ length: 3 + (trial % 5) }, () => ({
        x: Math.round(random() * 20),
        y: Math.round(random() * 20),
      }));
      const { lowerBound, radii } = controlZoneLowerBound(points);
      for (let i = 0; i < points.length; i++) {
        expect(radii[i]).toBeGreaterThanOrEqual(0);
        for (let j = i + 1; j < points.length; j++) {
          expect(radii[i] + radii[j]).toBeLessThanOrEqual(
            distance(points[i], points[j]) + 1e-9
          );
        }
      }
      expect(lowerBound).toBeLessThanOrEqual(
        bruteForceSolution(points).distance + 1e-9
      );
    }
  });

  it('does not certify a distance below a proven lower bound', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 2 },
    ];
    const result = verifyOptimality(0, points);
    expect(result.isOptimal).toBe(false);
    expect(result.gap).toBeLessThan(0);
  });

  it('keeps the strongest available geometric bound', () => {
    const points = [
      { x: 19, y: 36 },
      { x: 6, y: 18 },
      { x: 84, y: 1 },
      { x: 19, y: 37 },
      { x: 9, y: 96 },
    ];
    const result = verifyOptimality(
      bruteForceSolution(points).distance,
      points
    );
    expect(controlZoneLowerBound(points).lowerBound).toBeGreaterThan(
      oneTreeLowerBound(points).lowerBound
    );
    expect(result.lowerBound).toBeGreaterThanOrEqual(
      oneTreeLowerBound(points).lowerBound
    );
    expect(result.lowerBound).toBeGreaterThanOrEqual(
      controlZoneLowerBound(points).lowerBound
    );
    expect(result.lowerBound).toBeLessThanOrEqual(
      bruteForceSolution(points).distance + 1e-9
    );
    expect(result.method).toBe('control zones');
  });
});
