/**
 * Atomic Two-Edge-Trees heuristic for TSP.
 *
 * The algorithm starts at the diameter endpoints of the point cloud and grows
 * two independent spatial trees inward. Each growth round assigns every
 * unvisited point to its nearest tree branch, then extends each tree by its
 * closest eligible point. Each tree's depth-first order forms a local cycle;
 * the cheapest pair of cycle edges is replaced by two cross-tree bridges to
 * synthesize the final TSP tour.
 *
 * Time Complexity: O(n²)
 * Space Complexity: O(n), excluding optional visualization snapshots
 */

const squaredDistance = (a, b) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
};

const pointDistance = (a, b) => Math.sqrt(squaredDistance(a, b));

/**
 * Find the two points with maximum Euclidean distance.
 * Ties are resolved by the lowest pair of array indices.
 *
 * @param {Array<{x: number, y: number}>} points - Point cloud
 * @returns {number[]} Zero, one, or two root indices
 */
export const findFurthestPair = (points) => {
  if (points.length === 0) {
    return [];
  }
  if (points.length === 1) {
    return [0];
  }

  let bestPair = [0, 1];
  let bestDistance = squaredDistance(points[0], points[1]);

  for (let i = 0; i < points.length - 1; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const candidateDistance = squaredDistance(points[i], points[j]);
      if (candidateDistance > bestDistance) {
        bestDistance = candidateDistance;
        bestPair = [i, j];
      }
    }
  }

  return bestPair;
};

const isBetterCandidate = (candidate, current) =>
  current === null ||
  candidate.distance < current.distance ||
  (candidate.distance === current.distance &&
    (candidate.index < current.index ||
      (candidate.index === current.index &&
        candidate.parent < current.parent)));

const updateNearestBranch = (nearest, tree, newNode, points, unvisited) => {
  const distanceKey = tree === 'A' ? 'distanceA' : 'distanceB';
  const parentKey = tree === 'A' ? 'parentA' : 'parentB';

  for (const index of unvisited) {
    const candidateDistance = squaredDistance(points[newNode], points[index]);
    if (
      candidateDistance < nearest[index][distanceKey] ||
      (candidateDistance === nearest[index][distanceKey] &&
        newNode < nearest[index][parentKey])
    ) {
      nearest[index][distanceKey] = candidateDistance;
      nearest[index][parentKey] = newNode;
    }
  }
};

const depthFirstOrder = (root, edges) => {
  if (root === undefined) {
    return [];
  }

  const children = new Map();
  for (const edge of edges) {
    if (!children.has(edge.from)) {
      children.set(edge.from, []);
    }
    children.get(edge.from).push(edge.to);
  }

  const order = [];
  const visit = (node) => {
    order.push(node);
    for (const child of children.get(node) || []) {
      visit(child);
    }
  };
  visit(root);
  return order;
};

const cycleAfterEdge = (cycle, edgeIndex) => [
  ...cycle.slice(edgeIndex + 1),
  ...cycle.slice(0, edgeIndex + 1),
];

/**
 * Merge two tree traversal cycles using their cheapest pair of bridges.
 *
 * Cutting one edge in each cycle creates two paths. The paths can be joined
 * in either orientation, so every pair of cuts and both orientations are
 * evaluated. This avoids forcing the diameter roots to be adjacent in the
 * final tour while preserving each tree-derived traversal.
 */
const spliceTreeCycles = (cycleA, cycleB, points) => {
  if (cycleA.length === 0) {
    return [...cycleB];
  }
  if (cycleB.length === 0) {
    return [...cycleA];
  }

  let bestSplice = null;
  for (let indexA = 0; indexA < cycleA.length; indexA++) {
    const nextA = (indexA + 1) % cycleA.length;
    for (let indexB = 0; indexB < cycleB.length; indexB++) {
      const nextB = (indexB + 1) % cycleB.length;
      const removedDistance =
        pointDistance(points[cycleA[indexA]], points[cycleA[nextA]]) +
        pointDistance(points[cycleB[indexB]], points[cycleB[nextB]]);
      const sameDirectionIncrease =
        pointDistance(points[cycleA[indexA]], points[cycleB[nextB]]) +
        pointDistance(points[cycleA[nextA]], points[cycleB[indexB]]) -
        removedDistance;
      const oppositeDirectionIncrease =
        pointDistance(points[cycleA[indexA]], points[cycleB[indexB]]) +
        pointDistance(points[cycleA[nextA]], points[cycleB[nextB]]) -
        removedDistance;

      if (bestSplice === null || sameDirectionIncrease < bestSplice.increase) {
        bestSplice = {
          indexA,
          indexB,
          reverseB: false,
          increase: sameDirectionIncrease,
        };
      }
      if (oppositeDirectionIncrease < bestSplice.increase) {
        bestSplice = {
          indexA,
          indexB,
          reverseB: true,
          increase: oppositeDirectionIncrease,
        };
      }
    }
  }

  const pathA = cycleAfterEdge(cycleA, bestSplice.indexA);
  let pathB = cycleAfterEdge(cycleB, bestSplice.indexB);
  if (bestSplice.reverseB) {
    pathB = pathB.reverse();
  }
  return [...pathA, ...pathB];
};

const createResult = (
  rootIndices,
  treeANodes,
  treeBNodes,
  treeAEdges,
  treeBEdges,
  points
) => {
  const treeAOrder = depthFirstOrder(rootIndices[0], treeAEdges);
  const treeBOrder = depthFirstOrder(rootIndices[1], treeBEdges);
  return {
    tour: spliceTreeCycles(treeAOrder, treeBOrder, points),
    rootIndices,
    treeANodes,
    treeBNodes,
    treeAEdges,
    treeBEdges,
  };
};

const selectRoundCandidates = (
  nearest,
  unvisited,
  treeANodeCount,
  treeBNodeCount
) => {
  let candidateA = null;
  let candidateB = null;
  let projectedASize = treeANodeCount;
  let projectedBSize = treeBNodeCount;

  for (const index of unvisited) {
    const branch = nearest[index];
    let owner;
    if (branch.distanceA < branch.distanceB) {
      owner = 'A';
    } else if (branch.distanceB < branch.distanceA) {
      owner = 'B';
    } else if (projectedASize <= projectedBSize) {
      owner = 'A';
    } else {
      owner = 'B';
    }

    if (owner === 'A') {
      projectedASize++;
      const candidate = {
        index,
        parent: branch.parentA,
        distance: branch.distanceA,
      };
      if (isBetterCandidate(candidate, candidateA)) {
        candidateA = candidate;
      }
    } else {
      projectedBSize++;
      const candidate = {
        index,
        parent: branch.parentB,
        distance: branch.distanceB,
      };
      if (isBetterCandidate(candidate, candidateB)) {
        candidateB = candidate;
      }
    }
  }

  return { candidateA, candidateB };
};

const addCandidate = (candidate, nodes, edges, unvisited) => {
  if (!candidate) {
    return;
  }
  nodes.push(candidate.index);
  edges.push({ from: candidate.parent, to: candidate.index });
  unvisited.delete(candidate.index);
};

const includeRounds = (result, captureRounds, rounds) => {
  if (captureRounds) {
    result.rounds = rounds;
  }
  return result;
};

/**
 * Build both spatial trees, optionally retaining each growth round.
 *
 * @param {Array<{x: number, y: number, id?: number}>} points - Point cloud
 * @param {{captureRounds?: boolean}} options - Snapshot configuration
 * @returns {Object} Trees, synthesized tour, and optional growth rounds
 */
export const buildTwoEdgeTrees = (points, { captureRounds = false } = {}) => {
  const rootIndices = findFurthestPair(points);
  const treeANodes = rootIndices.length > 0 ? [rootIndices[0]] : [];
  const treeBNodes = rootIndices.length > 1 ? [rootIndices[1]] : [];
  const treeAEdges = [];
  const treeBEdges = [];
  const rounds = [];

  if (rootIndices.length < 2) {
    const result = createResult(
      rootIndices,
      treeANodes,
      treeBNodes,
      treeAEdges,
      treeBEdges,
      points
    );
    return includeRounds(result, captureRounds, rounds);
  }

  const [rootA, rootB] = rootIndices;
  const unvisited = new Set(
    points
      .map((_, index) => index)
      .filter((index) => !rootIndices.includes(index))
  );
  const nearest = points.map((point) => ({
    distanceA: squaredDistance(point, points[rootA]),
    parentA: rootA,
    distanceB: squaredDistance(point, points[rootB]),
    parentB: rootB,
  }));

  while (unvisited.size > 0) {
    const { candidateA, candidateB } = selectRoundCandidates(
      nearest,
      unvisited,
      treeANodes.length,
      treeBNodes.length
    );

    addCandidate(candidateA, treeANodes, treeAEdges, unvisited);
    addCandidate(candidateB, treeBNodes, treeBEdges, unvisited);

    if (candidateA) {
      updateNearestBranch(nearest, 'A', candidateA.index, points, unvisited);
    }
    if (candidateB) {
      updateNearestBranch(nearest, 'B', candidateB.index, points, unvisited);
    }

    if (captureRounds) {
      rounds.push({
        addedToTreeA: candidateA?.index ?? null,
        addedToTreeB: candidateB?.index ?? null,
        treeANodes: [...treeANodes],
        treeBNodes: [...treeBNodes],
        treeAEdges: treeAEdges.map((edge) => ({ ...edge })),
        treeBEdges: treeBEdges.map((edge) => ({ ...edge })),
      });
    }
  }

  const result = createResult(
    rootIndices,
    treeANodes,
    treeBNodes,
    treeAEdges,
    treeBEdges,
    points
  );
  return includeRounds(result, captureRounds, rounds);
};

/**
 * Compute the final Two-Edge-Trees tour without visualization snapshots.
 *
 * @param {Array<{x: number, y: number, id?: number}>} points - Point cloud
 * @returns {{tour: number[], rootIndices: number[], treeANodes: number[], treeBNodes: number[], treeAEdges: Array, treeBEdges: Array}}
 */
export const twoEdgeTreesSolution = (points) => buildTwoEdgeTrees(points);

export default twoEdgeTreesSolution;
