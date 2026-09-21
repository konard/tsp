/**
 * Progressive Two-Edge-Trees heuristic for TSP.
 *
 * Emits the three visualization phases described by the algorithm: diameter
 * root initialization, concurrent inward tree growth, and tour synthesis.
 */

import { buildTwoEdgeTrees } from '../../atomic/solution/two-edge-trees.js';

export { twoEdgeTreesSolution } from '../../atomic/solution/two-edge-trees.js';

/**
 * Generate chronological visualization steps for Two-Edge-Trees.
 *
 * @param {Array<{x: number, y: number, id?: number}>} points - Point cloud
 * @returns {Array<Object>} Visualization steps
 */
export const twoEdgeTreesAlgorithmSteps = (points) => {
  if (points.length === 0) {
    return [];
  }

  const result = buildTwoEdgeTrees(points, { captureRounds: true });
  const common = { rootIndices: [...result.rootIndices] };
  const steps = [
    {
      ...common,
      type: 'two-edge-trees',
      phase: 'initialization',
      tour: [],
      treeANodes: result.rootIndices.slice(0, 1),
      treeBNodes: result.rootIndices.slice(1, 2),
      treeAEdges: [],
      treeBEdges: [],
      description:
        result.rootIndices.length === 1
          ? 'Initialization: the only point is the first tree root'
          : `Initialization: Points ${result.rootIndices[0]} and ${result.rootIndices[1]} are the furthest perimeter roots`,
    },
  ];

  for (const round of result.rounds) {
    const populated = round.treeANodes.length + round.treeBNodes.length;
    steps.push({
      ...common,
      ...round,
      type: 'two-edge-trees',
      phase: 'growth',
      tour: [],
      description: `Growth: ${populated}/${points.length} points assigned to their nearest tree branches`,
    });
  }

  steps.push({
    ...common,
    type: 'two-edge-trees',
    phase: 'synthesis',
    tour: [...result.tour],
    treeANodes: [...result.treeANodes],
    treeBNodes: [...result.treeBNodes],
    treeAEdges: result.treeAEdges.map((edge) => ({ ...edge })),
    treeBEdges: result.treeBEdges.map((edge) => ({ ...edge })),
    description: `Tour synthesis: joined both tree traversals into a closed ${result.tour.length}-point tour`,
  });

  return steps;
};

export default twoEdgeTreesAlgorithmSteps;
