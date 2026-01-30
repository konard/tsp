/**
 * Moore Curve Algorithm for TSP
 *
 * Also known as: Space-Filling Curve, Hilbert Curve Variant, Fractal Ordering
 *
 * This algorithm uses a Moore curve (a variant of the Hilbert curve) to order points:
 * 1. Generate a Moore curve that fills the grid space
 * 2. Map each point to its nearest position on the curve
 * 3. Sort points by their position along the curve
 * 4. Connect points in curve-order to form a tour
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';

/**
 * Generate Moore curve using L-system
 * L-system rules for Moore curve:
 * Axiom: LFL+F+LFL
 * L -> -RF+LFL+FR-
 * R -> +LF-RFR-FL+
 *
 * @param {number} order - Order of the Moore curve
 * @returns {string} L-system sequence
 */
export const generateMooreCurve = (order) => {
  let sequence = 'LFL+F+LFL';

  for (let i = 0; i < order; i++) {
    let newSequence = '';
    for (const char of sequence) {
      if (char === 'L') {
        newSequence += '-RF+LFL+FR-';
      } else if (char === 'R') {
        newSequence += '+LF-RFR-FL+';
      } else {
        newSequence += char;
      }
    }
    sequence = newSequence;
  }

  return sequence;
};

/**
 * Convert Moore curve L-system sequence to coordinate points
 *
 * @param {string} sequence - L-system sequence
 * @param {number} mooreGridSize - Size of the grid
 * @returns {Array<{x: number, y: number}>} Array of curve points
 */
export const mooreCurveToPoints = (sequence, mooreGridSize) => {
  // Moore curve vertices land exactly on grid intersections
  // Step size is 1 (each move goes to the next grid line)
  const stepSize = 1;

  const curvePoints = [];
  let x = 0;
  let y = 0;

  // Direction: 0=up, 1=right, 2=down, 3=left
  let direction = 0; // Start facing up

  curvePoints.push({ x, y });

  for (const char of sequence) {
    if (char === 'F') {
      // Move one step in current direction
      if (direction === 0) {
        y -= stepSize;
      } // up
      else if (direction === 1) {
        x += stepSize;
      } // right
      else if (direction === 2) {
        y += stepSize;
      } // down
      else if (direction === 3) {
        x -= stepSize;
      } // left

      curvePoints.push({ x, y });
    } else if (char === '+') {
      direction = (direction + 1) % 4; // Turn right
    } else if (char === '-') {
      direction = (direction + 3) % 4; // Turn left
    }
  }

  // Find bounding box of the curve
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of curvePoints) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  // The curve naturally spans (curveWidth) x (curveHeight) in step units
  const curveWidth = maxX - minX;
  const curveHeight = maxY - minY;

  // Shift curve so it starts at (0,0) and scale to fit [0, mooreGridSize-1]
  // A Moore curve of order n fills a 2^n x 2^n grid with coordinates [0, 2^n - 1]
  const normalizedPoints = curvePoints.map((p) => ({
    x: Math.round(((p.x - minX) / curveWidth) * (mooreGridSize - 1)),
    y: Math.round(((p.y - minY) / curveHeight) * (mooreGridSize - 1)),
  }));

  return normalizedPoints;
};

/**
 * Generate step-by-step solution using Moore Curve algorithm
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} mooreGridSize - Size of the Moore grid
 * @returns {Array<Object>} Array of steps for visualization
 */
export const mooreAlgorithmSteps = (points, mooreGridSize) => {
  if (points.length === 0) {
    return [];
  }

  // Determine L-system iterations based on Moore grid size
  // generateMooreCurve(n) fills a 2^(n+1) x 2^(n+1) grid
  // So for mooreGridSize = 2^k, iterations = k - 1
  const order = Math.max(0, Math.round(Math.log2(mooreGridSize)) - 1);
  const curveSequence = generateMooreCurve(order);
  // Generate curve points using the Moore grid size for perfect alignment
  const curvePoints = mooreCurveToPoints(curveSequence, mooreGridSize);
  const totalCurveLength = curvePoints.length;

  // Points are already on Moore grid coordinates, no scaling needed
  // Map each point to its position along the curve
  const pointsWithCurvePos = points.map((p, idx) => {
    let minDist = Infinity;
    let curvePos = 0;

    // Points are already in Moore grid coordinates
    for (let i = 0; i < curvePoints.length; i++) {
      const d = distance(p, curvePoints[i]);
      if (d < minDist) {
        minDist = d;
        curvePos = i;
      }
    }

    return { ...p, idx, curvePos };
  });

  // Sort points by their position along the curve
  pointsWithCurvePos.sort((a, b) => a.curvePos - b.curvePos);

  // Generate steps
  const steps = [];
  const tour = [];

  // First step: show the Moore curve
  steps.push({
    type: 'curve',
    curvePoints,
    mooreGridSize,
    curveProgress: 0,
    tour: [],
    description: `Moore curve generated (order ${order}, ${mooreGridSize}×${mooreGridSize} grid)`,
  });

  for (let i = 0; i < pointsWithCurvePos.length; i++) {
    tour.push(pointsWithCurvePos[i].idx);
    // Calculate progress along the curve as a percentage
    const curveProgress = (
      (pointsWithCurvePos[i].curvePos / (totalCurveLength - 1)) *
      100
    ).toFixed(1);

    steps.push({
      type: 'visit',
      curvePoints,
      mooreGridSize,
      curvePosition: pointsWithCurvePos[i].curvePos,
      curveProgress: parseFloat(curveProgress),
      tour: [...tour],
      description: `Curve progress: ${curveProgress}%, visiting point ${pointsWithCurvePos[i].idx}`,
    });
  }

  return steps;
};

/**
 * Compute Moore Curve solution in one step (atomic version)
 * Returns the final tour without intermediate steps
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} mooreGridSize - Size of the Moore grid
 * @returns {{tour: number[], curvePoints: Array<{x: number, y: number}>}} Final tour and curve
 */
export const mooreSolution = (points, mooreGridSize) => {
  if (points.length === 0) {
    return { tour: [], curvePoints: [] };
  }

  // Determine L-system iterations: mooreGridSize = 2^(n+1), so n = log2(mooreGridSize) - 1
  const order = Math.max(0, Math.round(Math.log2(mooreGridSize)) - 1);
  const curveSequence = generateMooreCurve(order);
  const curvePoints = mooreCurveToPoints(curveSequence, mooreGridSize);

  const pointsWithCurvePos = points.map((p, idx) => {
    let minDist = Infinity;
    let curvePos = 0;

    for (let i = 0; i < curvePoints.length; i++) {
      const d = distance(p, curvePoints[i]);
      if (d < minDist) {
        minDist = d;
        curvePos = i;
      }
    }

    return { idx, curvePos };
  });

  pointsWithCurvePos.sort((a, b) => a.curvePos - b.curvePos);

  return {
    tour: pointsWithCurvePos.map((p) => p.idx),
    curvePoints,
  };
};

export default mooreAlgorithmSteps;
