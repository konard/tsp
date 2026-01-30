/**
 * Atomic Sonar Solution (Radial Sweep) for TSP
 *
 * Computes the final tour directly without intermediate visualization steps.
 *
 * Algorithm:
 * 1. Compute the centroid (center of mass) of all points
 * 2. Calculate the polar angle of each point relative to the centroid
 * 3. Sort points by their polar angle (starting from bottom, sweeping clockwise)
 * 4. Return the sorted order as the tour
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

/**
 * Compute Sonar solution in one step (atomic version).
 * Returns the final tour without intermediate steps.
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @returns {{tour: number[], centroid: {x: number, y: number}}} Final tour and centroid
 */
export const sonarSolution = (points) => {
  if (points.length === 0) {
    return { tour: [], centroid: null };
  }

  // Find centroid
  const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;

  const startAngle = Math.PI / 2;

  const pointsWithAngles = points.map((p, idx) => {
    const rawAngle = Math.atan2(p.y - cy, p.x - cx);
    let normalizedAngle = rawAngle - startAngle;
    if (normalizedAngle < 0) {
      normalizedAngle += 2 * Math.PI;
    }
    return { idx, sortAngle: normalizedAngle };
  });

  pointsWithAngles.sort((a, b) => a.sortAngle - b.sortAngle);

  return {
    tour: pointsWithAngles.map((p) => p.idx),
    centroid: { x: cx, y: cy },
  };
};

export default sonarSolution;
