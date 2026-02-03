/**
 * Atomic Koch Snowflake Solution for TSP
 *
 * Computes the final tour directly without intermediate visualization steps.
 *
 * Algorithm:
 * 1. Generate a Koch snowflake curve (fractal) that covers the grid space
 * 2. Map each point to its nearest position on the curve
 * 3. Sort points by their position along the curve
 * 4. Return the sorted order as the tour
 *
 * The Koch snowflake starts as an equilateral triangle and recursively
 * replaces each line segment with a segment containing a triangular bump.
 * At sufficient depth, the curve visits all regions of the bounded area,
 * making it useful as a space-filling heuristic for TSP.
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';

/**
 * Generate Koch snowflake curve points using recursive subdivision.
 *
 * Starting from an equilateral triangle, each edge is subdivided into
 * four segments forming a triangular bump (the Koch construction).
 *
 * @param {number} order - Recursion depth (0 = triangle, higher = more detail)
 * @returns {Array<{x: number, y: number}>} Array of curve points
 */
export const generateKochSnowflake = (order) => {
  // Start with an equilateral triangle (vertices in clockwise order)
  // Centered roughly at origin, pointing up
  const sqrt3over2 = Math.sqrt(3) / 2;
  const vertices = [
    { x: 0, y: -1 }, // top
    { x: sqrt3over2, y: 0.5 }, // bottom-right
    { x: -sqrt3over2, y: 0.5 }, // bottom-left
  ];

  /**
   * Recursively subdivide a line segment using Koch construction.
   * Each segment A->B becomes A -> P1 -> Peak -> P2 -> B
   * where P1 is 1/3 along, P2 is 2/3 along, and Peak is the
   * apex of an equilateral triangle built on the middle third.
   */
  const subdivide = (ax, ay, bx, by, depth) => {
    if (depth === 0) {
      return [{ x: ax, y: ay }];
    }

    // Divide segment into thirds
    const dx = bx - ax;
    const dy = by - ay;

    const p1x = ax + dx / 3;
    const p1y = ay + dy / 3;
    const p2x = ax + (2 * dx) / 3;
    const p2y = ay + (2 * dy) / 3;

    // Peak of equilateral triangle on middle third
    // Rotate middle-third vector 60 degrees counterclockwise (outward for clockwise triangle)
    const peakX = p1x + dx / 6 - (dy * Math.sqrt(3)) / 6;
    const peakY = p1y + dy / 6 + (dx * Math.sqrt(3)) / 6;

    // Recurse on each of the 4 sub-segments
    return [
      ...subdivide(ax, ay, p1x, p1y, depth - 1),
      ...subdivide(p1x, p1y, peakX, peakY, depth - 1),
      ...subdivide(peakX, peakY, p2x, p2y, depth - 1),
      ...subdivide(p2x, p2y, bx, by, depth - 1),
    ];
  };

  // Generate curve points for all three edges of the triangle
  let curvePoints = [];
  for (let i = 0; i < 3; i++) {
    const a = vertices[i];
    const b = vertices[(i + 1) % 3];
    curvePoints = [...curvePoints, ...subdivide(a.x, a.y, b.x, b.y, order)];
  }

  return curvePoints;
};

/**
 * Normalize Koch snowflake curve points to fit within a grid.
 *
 * @param {Array<{x: number, y: number}>} curvePoints - Raw curve points
 * @param {number} gridSize - Target grid size (points mapped to 0..gridSize-1)
 * @returns {Array<{x: number, y: number}>} Normalized curve points
 */
export const kochCurveToPoints = (curvePoints, gridSize) => {
  if (curvePoints.length === 0) {
    return [];
  }

  // Find bounding box
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

  const curveWidth = maxX - minX;
  const curveHeight = maxY - minY;

  // Use the larger dimension to maintain aspect ratio, centering on the grid
  const maxDim = Math.max(curveWidth, curveHeight);

  const offsetX = (maxDim - curveWidth) / 2;
  const offsetY = (maxDim - curveHeight) / 2;

  const normalizedPoints = curvePoints.map((p) => ({
    x: Math.round(((p.x - minX + offsetX) / maxDim) * (gridSize - 1)),
    y: Math.round(((p.y - minY + offsetY) / maxDim) * (gridSize - 1)),
  }));

  return normalizedPoints;
};

/**
 * Determine the Koch snowflake order based on grid size.
 * Higher grid sizes need more recursion depth for adequate coverage.
 *
 * @param {number} gridSize - Moore grid size
 * @returns {number} Koch snowflake recursion order
 */
export const calculateKochOrder = (gridSize) => {
  // Each order increases points by 4x (3 sides * 4^order segments)
  // order 1: 12 points, order 2: 48, order 3: 192, order 4: 768,
  // order 5: 3072, order 6: 12288, order 7: 49152
  // We want enough resolution to distinguish grid points
  if (gridSize <= 4) {
    return 3;
  }
  if (gridSize <= 8) {
    return 4;
  }
  if (gridSize <= 16) {
    return 5;
  }
  if (gridSize <= 32) {
    return 6;
  }
  if (gridSize <= 64) {
    return 7;
  }
  return 8;
};

/**
 * Compute Koch Snowflake solution in one step (atomic version).
 * Returns the final tour without intermediate steps.
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} mooreGridSize - Size of the Moore grid
 * @returns {{tour: number[], curvePoints: Array<{x: number, y: number}>}} Final tour and curve
 */
export const kochSolution = (points, mooreGridSize) => {
  if (points.length === 0) {
    return { tour: [], curvePoints: [] };
  }

  const order = calculateKochOrder(mooreGridSize);
  const rawCurvePoints = generateKochSnowflake(order);
  const curvePoints = kochCurveToPoints(rawCurvePoints, mooreGridSize);

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

export default kochSolution;
