/**
 * Sonar Algorithm (Radial Sweep) for TSP
 *
 * Also known as: Radial Sweep, Angular Sort, Polar Angle Sort, Centroid-based Ordering
 *
 * This algorithm works by:
 * 1. Computing the centroid (center of mass) of all points
 * 2. Calculating the polar angle of each point relative to the centroid
 * 3. Sorting points by their polar angle
 * 4. Connecting points in angular order to form a tour
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

/**
 * Generate step-by-step solution using Sonar algorithm
 * Starts from the bottom (positive Y direction) and sweeps clockwise
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @returns {Array<Object>} Array of steps for visualization
 */
export const sonarAlgorithmSteps = (points) => {
  if (points.length === 0) {
    return [];
  }

  // Find centroid
  const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;

  // Calculate angles from centroid
  // We want to start from the bottom (positive Y direction = Math.PI/2)
  // and sweep clockwise (increasing angle in SVG coordinate system)
  const startAngle = Math.PI / 2; // Bottom direction

  const pointsWithAngles = points.map((p, idx) => {
    const rawAngle = Math.atan2(p.y - cy, p.x - cx);
    // Normalize angle relative to start angle (bottom)
    // This makes angles go from 0 (bottom) clockwise around
    let normalizedAngle = rawAngle - startAngle;
    // Ensure positive values: wrap negative angles to positive
    if (normalizedAngle < 0) {
      normalizedAngle += 2 * Math.PI;
    }
    return {
      ...p,
      idx,
      angle: rawAngle, // Keep original for display
      sortAngle: normalizedAngle, // Use normalized for sorting
    };
  });

  // Sort by normalized angle (starting from bottom, going clockwise)
  pointsWithAngles.sort((a, b) => a.sortAngle - b.sortAngle);

  // Generate steps
  const steps = [];
  const tour = [];

  for (let i = 0; i < pointsWithAngles.length; i++) {
    const currentAngle = pointsWithAngles[i].angle;
    tour.push(pointsWithAngles[i].idx);

    steps.push({
      type: 'sweep',
      angle: currentAngle,
      tour: [...tour],
      description: `Sweep angle: ${(((currentAngle * 180) / Math.PI + 360) % 360).toFixed(1)}°, found point ${pointsWithAngles[i].idx}`,
      centroid: { x: cx, y: cy },
    });
  }

  return steps;
};

/**
 * Compute Sonar solution in one step (atomic version)
 * Returns the final tour without intermediate steps
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

export default sonarAlgorithmSteps;
