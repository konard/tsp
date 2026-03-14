/**
 * Manual Algorithm - User-drawn TSP tour
 *
 * This algorithm allows the user to manually draw a tour by clicking/tapping
 * on points. It provides a single initial step with an empty tour, and the
 * UI handles building the tour interactively.
 *
 * Supports mouse pointer, touch (finger), and stylus (Apple Pencil) input
 * via pointer events.
 */

/**
 * Generate the initial step for the manual algorithm.
 * Returns a single step with an empty tour — the user builds the tour interactively.
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @returns {Array<Object>} Single step with empty tour
 */
export const manualAlgorithmSteps = (points) => [
  {
    type: 'manual',
    tour: [],
    description: `Click/tap points to build your tour (0/${points.length} points)`,
  },
];

/**
 * Create a manual step with the given tour.
 *
 * @param {number[]} tour - Array of point indices
 * @param {number} totalPoints - Total number of points
 * @returns {Object} A step object for the manual algorithm
 */
export const createManualStep = (tour, totalPoints) => {
  const isComplete = tour.length === totalPoints;
  let description;
  if (isComplete) {
    description = `Tour complete! All ${totalPoints} points connected. You can download as SVG or apply optimizations.`;
  } else {
    description = `Click/tap points to build your tour (${tour.length}/${totalPoints} points)`;
  }
  return {
    type: 'manual',
    tour: [...tour],
    description,
  };
};

/**
 * Atomic solution for the manual algorithm.
 * Simply returns the user-provided tour.
 *
 * @param {number[]} tour - User-drawn tour (array of point indices)
 * @returns {{ tour: number[] }} Solution object
 */
export const manualSolution = (tour) => ({
  tour: [...tour],
});
