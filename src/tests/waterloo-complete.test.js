import { describe, expect, it } from 'bun:test';
import { bruteForceSolution } from '../lib/algorithms/atomic/solution/brute-force.js';
import {
  branchAndCut,
  combCut,
  findSimpleBlossoms,
  globalMinimumCut,
  minimumCut,
  optimalControlZoneLowerBound,
  solveTspRelaxation,
  subtourCut,
  verifyOptimality,
  zoneAndMoatLowerBound,
} from '../lib/algorithms/verification/index.js';
import {
  directedTourLength,
  directedConstraintPenalty,
  directedLocalSearch,
  iteratedDirectedLocalSearch,
  inferZoneHierarchy,
  learnClusterPrecedence,
  learnZonePrecedence,
  solveDirectedTsp,
} from '../lib/algorithms/atomic/solution/index.js';

const distantTriangles = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 100, y: 0 },
  { x: 101, y: 0 },
  { x: 100, y: 1 },
];

describe('Waterloo LP and exact search', () => {
  it('optimizes control zones and adds a moat across distant clusters', () => {
    const zones = optimalControlZoneLowerBound(distantTriangles);
    const withMoats = zoneAndMoatLowerBound(distantTriangles);
    const optimum = bruteForceSolution(distantTriangles).distance;
    expect(withMoats.lowerBound).toBeGreaterThan(zones.lowerBound + 1);
    expect(withMoats.lowerBound).toBeLessThanOrEqual(optimum + 1e-6);
    expect(withMoats.moats.some(({ width }) => width > 1)).toBe(true);
    expect(
      verifyOptimality(optimum, distantTriangles, { lp: true }).lowerBound
    ).toBeGreaterThan(zones.lowerBound);
  });
  it('separates subtours missed by the degree LP', () => {
    const degree = solveTspRelaxation(distantTriangles, { cuts: 'none' });
    const full = solveTspRelaxation(distantTriangles, { cuts: 'full' });
    const optimum = bruteForceSolution(distantTriangles).distance;
    expect(degree.lowerBound).toBeLessThan(full.lowerBound - 1);
    expect(full.lowerBound).toBeLessThanOrEqual(optimum + 1e-6);
    expect(full.cuts.length).toBeGreaterThan(0);
  });

  it('finds a nontrivial minimum cut', () => {
    const cut = minimumCut(
      [
        [0, 1, 0],
        [1, 0, 0.5],
        [0, 0.5, 0],
      ],
      0,
      2
    );
    expect(cut.value).toBeCloseTo(0.5);
    expect(cut.vertices).toEqual([0, 1]);
    const global = globalMinimumCut([
      [0, 1, 0],
      [1, 0, 0.5],
      [0, 0.5, 0],
    ]);
    expect(global.value).toBeCloseTo(0.5);
  });

  it('validates a comb before adding its inequality', () => {
    expect(() =>
      combCut(
        [0, 1, 2],
        [
          [0, 3],
          [1, 4],
          [2, 5],
        ],
        6
      )
    ).not.toThrow();
    expect(() =>
      combCut(
        [0, 1],
        [
          [0, 2],
          [1, 3],
        ],
        4
      )
    ).toThrow();
    const comb = combCut(
      [0, 1, 2],
      [
        [0, 3],
        [1, 4],
        [2, 5],
      ],
      6
    );
    const relaxation = solveTspRelaxation(distantTriangles, {
      cuts: 'full',
      initialCuts: [comb, subtourCut([0, 1, 2], 6)],
    });
    expect(relaxation.lowerBound).toBeLessThanOrEqual(
      bruteForceSolution(distantTriangles).distance + 1e-6
    );
  });

  it('finds a simple blossom from unit edges crossing a fractional component', () => {
    const cuts = findSimpleBlossoms(
      6,
      [
        [0, 1],
        [1, 2],
        [3, 4],
        [4, 5],
        [0, 3],
        [1, 4],
        [2, 5],
      ],
      [0.5, 0.5, 0.5, 0.5, 1, 1, 1]
    );
    expect(cuts.some((cut) => cut.rhs === 10)).toBe(true);
  });

  it.each(['best-bound', 'depth-first'])(
    '%s search proves an optimal tour',
    (strategy) => {
      const result = branchAndCut(distantTriangles, { strategy });
      expect(result.isOptimal).toBe(true);
      expect(result.distance).toBeCloseTo(
        bruteForceSolution(distantTriangles).distance,
        5
      );
      expect(result.lowerBound).toBeCloseTo(result.distance, 5);
    }
  );

  it('reports an open lower bound when the search node limit is hit', () => {
    const result = branchAndCut(distantTriangles, { maxNodes: 0 });
    expect(result.isOptimal).toBe(false);
    expect(result.lowerBound).toBeLessThanOrEqual(result.distance);
  });
});

describe('Amazon directed and clustered routing', () => {
  const costs = [
    [0, 1, 9, 9, 9],
    [9, 0, 1, 9, 9],
    [9, 9, 0, 1, 9],
    [9, 9, 9, 0, 1],
    [1, 9, 9, 9, 0],
  ];

  it('uses directed travel times and proves a small instance', () => {
    expect(directedTourLength([0, 1, 2, 3, 4], costs)).toBe(5);
    expect(directedTourLength([0, 4, 3, 2, 1], costs)).toBe(45);
    const result = solveDirectedTsp(costs, { exact: true });
    expect(result.isOptimal).toBe(true);
    expect(result.distance).toBe(5);
  });

  it('does not report an unreachable route as feasible', () => {
    const result = solveDirectedTsp(
      [
        [0, Infinity],
        [Infinity, 0],
      ],
      { exact: true }
    );
    expect(result.feasible).toBe(false);
    expect(result.tour).toBeNull();
    expect(result.isOptimal).toBe(false);
  });

  it('rejects invalid initial route indices', () => {
    expect(() => directedLocalSearch(costs, [0, 1, 2, 3, 9])).toThrow();
    expect(directedLocalSearch([], []).tour).toEqual([]);
  });

  it('respects zone contiguity and precedence', () => {
    const result = solveDirectedTsp(costs, {
      zones: ['depot', 'A', 'B', 'A', 'B'],
      precedence: [['B', 'A']],
      exact: true,
    });
    expect(result.isOptimal).toBe(true);
    expect(result.tour[0]).toBe(0);
    const labels = result.tour
      .slice(1)
      .map((i) => ['depot', 'A', 'B', 'A', 'B'][i]);
    expect(labels).toEqual(['B', 'B', 'A', 'A']);
  });
});

describe('Amazon learned constraints and local search', () => {
  it('infers precedence from the most similar training route', () => {
    const edges = learnZonePrecedence(
      [
        ['A', 'B', 'C'],
        ['D', 'C', 'B', 'A'],
      ],
      ['A', 'B', 'C']
    );
    expect(edges).toEqual([
      ['A', 'B'],
      ['B', 'C'],
    ]);
    expect(
      learnZonePrecedence([['Depot', 'A', 'B']], ['Depot', 'A', 'B'])
    ).toEqual([['A', 'B']]);
  });

  it('learns nested super clusters from historical zone IDs', () => {
    const target = ['Depot', 'A-1.1A', 'A-1.1B', 'A-2.1A'];
    const hierarchy = inferZoneHierarchy(
      [
        ['Depot', 'A-1.1A', 'A-1.1B', 'A-2.1A'],
        ['Depot', 'A-1.1B', 'A-1.1A', 'A-2.1A'],
      ],
      target
    );
    expect(hierarchy.clusterLevels).toHaveLength(3);
    expect(hierarchy.keys.cluster).toHaveLength(3);
    expect(hierarchy.clusterLevels[0][1]).toBe(hierarchy.clusterLevels[0][2]);
    const options = { zones: target, clusterLevels: hierarchy.clusterLevels };
    expect(directedConstraintPenalty([0, 1, 2, 3], options)).toBe(0);
    const clusterPrecedence = learnClusterPrecedence(
      [['Depot', 'A-1.1A', 'A-1.1B', 'A-2.1A']],
      target,
      hierarchy
    );
    expect(clusterPrecedence).toHaveLength(3);
    expect(clusterPrecedence[0].length).toBeGreaterThan(0);
  });

  it('enforces precedence between super clusters', () => {
    const matrix = [
      [0, 1, 1, 1],
      [1, 0, 1, 1],
      [1, 1, 0, 1],
      [1, 1, 1, 0],
    ];
    const options = {
      clusterLevels: [['Depot', 'X', 'Y', 'X']],
      clusterPrecedence: [[['Y', 'X']]],
      exact: true,
    };
    expect(directedConstraintPenalty([0, 1, 3, 2], options)).toBe(1);
    const result = solveDirectedTsp(matrix, options);
    expect(result.feasible).toBe(true);
    expect(result.tour).toEqual([0, 2, 1, 3]);
  });

  it('ignores precedences whose other cluster is absent', () => {
    const result = solveDirectedTsp(
      [
        [0, 2, 1],
        [1, 0, 1],
        [1, 50, 0],
      ],
      {
        zones: ['Depot', 'A', 'C'],
        precedence: [['B', 'A']],
        exact: true,
        maxPasses: 0,
      }
    );
    expect(result.feasible).toBe(true);
    expect(result.distance).toBe(4);
    expect(result.tour).toEqual([0, 1, 2]);
  });

  it('finds a feasible hierarchy order when a nearest first group dead-ends', () => {
    const costs = [
      [0, 1, 10, 2],
      [1, 0, 1, 1],
      [1, 1, 0, 1],
      [1, 1, 1, 0],
    ];
    const result = solveDirectedTsp(costs, {
      zones: ['Depot', 'A', 'B', 'C'],
      clusterLevels: [['Depot', 'S1', 'S2', 'S1']],
      precedence: [['B', 'C']],
    });
    expect(result.feasible).toBe(true);
    expect(result.tour).toEqual([0, 2, 1, 3]);
  });

  it('uses a four-edge pair exchange when shorter exchanges are stuck', () => {
    const matrix = [
      [0, 4, 1, 5, 1, 11],
      [6, 0, 6, 12, 10, 13],
      [13, 4, 0, 5, 7, 15],
      [13, 20, 1, 0, 3, 17],
      [20, 14, 19, 19, 0, 17],
      [12, 17, 6, 9, 15, 0],
    ];
    const result = directedLocalSearch(matrix, [0, 1, 2, 3, 4, 5], {
      maxPasses: 1,
    });
    expect(result.distance).toBe(45);
    expect(result.tour).toEqual([0, 5, 2, 3, 4, 1]);
  });

  it('escapes a directed local minimum with a second search', () => {
    const matrix = [
      [0, 9, 10, 16, 4, 22, 13],
      [23, 0, 15, 2, 15, 1, 28],
      [6, 4, 0, 8, 15, 30, 15],
      [9, 15, 4, 0, 3, 18, 3],
      [11, 1, 6, 22, 0, 19, 25],
      [5, 17, 28, 1, 24, 0, 10],
      [12, 8, 4, 12, 7, 13, 0],
    ];
    const initial = [0, 1, 2, 3, 4, 5, 6];
    expect(directedLocalSearch(matrix, initial).distance).toBe(35);
    const result = iteratedDirectedLocalSearch(matrix, initial, {
      restarts: 2,
    });
    expect(result.distance).toBe(20);
    expect(result.feasible).toBe(true);
  });
});
