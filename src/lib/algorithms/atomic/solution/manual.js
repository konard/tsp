/**
 * Manual Algorithm (Atomic) - User-drawn TSP tour
 *
 * Atomic version simply wraps the user-provided tour.
 */

/**
 * Manual solution - returns the user-provided tour as-is.
 *
 * @param {number[]} tour - User-drawn tour (array of point indices)
 * @returns {{ tour: number[] }} Solution object
 */
export const manualSolution = (tour) => ({
  tour: [...tour],
});
