/**
 * Progressive Sonar Algorithm (Radial Sweep) for TSP
 *
 * Also known as: Radial Sweep, Angular Sort, Polar Angle Sort, Centroid-based Ordering
 *
 * This algorithm provides step-by-step visualization of:
 * 1. Computing the centroid (center of mass) of all points
 * 2. Calculating the polar angle of each point relative to the centroid
 * 3. Sorting points by their polar angle
 * 4. Connecting points in angular order to form a tour
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

// Re-export atomic function for backward compatibility
export { sonarSolution } from '../../atomic/solution/sonar.js';

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

  // We want to start from the bottom (positive Y direction = Math.PI/2)
  // and sweep clockwise (increasing angle in SVG coordinate system)
  const startAngle = Math.PI / 2; // Bottom direction

  const pointsWithAngles = points.map((p, idx) => {
    const rawAngle = Math.atan2(p.y - cy, p.x - cx);
    // Normalize angle relative to start angle (bottom)
    let normalizedAngle = rawAngle - startAngle;
    if (normalizedAngle < 0) {
      normalizedAngle += 2 * Math.PI;
    }
    return {
      ...p,
      idx,
      angle: rawAngle,
      sortAngle: normalizedAngle,
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

    const sweepDeg = ((currentAngle * 180) / Math.PI + 360) % 360;
    // Issue #7: Progress % and angle for Sonar, 0%=bottom(start), 100%=full sweep
    const progress = (((i + 1) / pointsWithAngles.length) * 100).toFixed(1);
    const pt = pointsWithAngles[i];
    steps.push({
      type: 'sweep',
      angle: currentAngle,
      tour: [...tour],
      description: `Progress: ${progress}% | Angle: ${sweepDeg.toFixed(1)}° | Point ${pt.idx} (${pt.x}, ${pt.y})`,
      centroid: { x: cx, y: cy },
    });
  }

  return steps;
};

export default sonarAlgorithmSteps;
