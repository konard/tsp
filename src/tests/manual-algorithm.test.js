/**
 * Test file for Manual Drawing TSP algorithm
 * Works with Bun test runner
 */

import { describe, it, expect } from 'bun:test';
import {
  manualAlgorithmSteps,
  createManualStep,
  manualSolution,
} from '../lib/algorithms/progressive/solution/manual.js';

// ============================================================
// Manual Algorithm Tests
// ============================================================

describe('manualAlgorithmSteps', () => {
  it('should return a single step with empty tour', () => {
    const points = [
      { x: 0, y: 0, id: 0 },
      { x: 10, y: 0, id: 1 },
      { x: 5, y: 10, id: 2 },
    ];
    const steps = manualAlgorithmSteps(points);
    expect(steps.length).toBe(1);
    expect(steps[0].type).toBe('manual');
    expect(steps[0].tour).toEqual([]);
    expect(steps[0].description).toContain('0/3');
  });

  it('should return a single step for empty points', () => {
    const steps = manualAlgorithmSteps([]);
    expect(steps.length).toBe(1);
    expect(steps[0].tour).toEqual([]);
  });
});

describe('createManualStep', () => {
  it('should create a step with the given tour', () => {
    const step = createManualStep([0, 1], 5);
    expect(step.type).toBe('manual');
    expect(step.tour).toEqual([0, 1]);
    expect(step.description).toContain('2/5');
  });

  it('should indicate completion when tour has all points', () => {
    const step = createManualStep([0, 1, 2], 3);
    expect(step.description).toContain('complete');
  });

  it('should not mutate the input tour array', () => {
    const tour = [0, 1, 2];
    const step = createManualStep(tour, 5);
    tour.push(3);
    expect(step.tour).toEqual([0, 1, 2]);
  });
});

describe('manualSolution', () => {
  it('should return a copy of the tour', () => {
    const tour = [2, 0, 1];
    const result = manualSolution(tour);
    expect(result.tour).toEqual([2, 0, 1]);
    tour.push(3);
    expect(result.tour).toEqual([2, 0, 1]);
  });
});
