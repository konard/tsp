/** Routing on asymmetric travel-time matrices with Amazon-style zone rules. */
/* eslint-disable complexity -- Constraint evaluation and exact search branch on each rule. */

const EPS = 1e-9;

const validateCosts = (costs) => {
  const n = costs.length;
  if (
    !Array.isArray(costs) ||
    costs.some(
      (row) =>
        !Array.isArray(row) ||
        row.length !== n ||
        row.some(
          (value) =>
            typeof value !== 'number' || value < 0 || Number.isNaN(value)
        )
    )
  ) {
    throw new TypeError(
      'costs must be a square matrix of nonnegative travel times'
    );
  }
};

/** Closed route cost, preserving the direction of every arc. */
export const directedTourLength = (tour, costs) => {
  if (tour.length < 2) {
    return 0;
  }
  return tour.reduce(
    (sum, vertex, i) => sum + costs[vertex][tour[(i + 1) % tour.length]],
    0
  );
};

/** A deterministic nearest-neighbor start for asymmetric matrices. */
export const nearestNeighborDirected = (costs, start = 0) => {
  validateCosts(costs);
  const n = costs.length;
  if (n === 0) {
    return [];
  }
  if (!Number.isInteger(start) || start < 0 || start >= n) {
    throw new RangeError('invalid start vertex');
  }
  const tour = [start];
  const used = new Set(tour);
  while (tour.length < n) {
    const current = tour[tour.length - 1];
    let next = -1;
    for (let v = 0; v < n; v++) {
      if (
        !used.has(v) &&
        (next < 0 || costs[current][v] < costs[current][next])
      ) {
        next = v;
      }
    }
    tour.push(next);
    used.add(next);
  }
  return tour;
};

const normalizedLevels = (n, options) => {
  const levels = [];
  for (const level of [options.zones, ...(options.clusterLevels ?? [])]) {
    if (!level) {
      continue;
    }
    if (!Array.isArray(level) || level.length !== n) {
      throw new RangeError('each cluster level must have one label per stop');
    }
    levels.push(
      level.map((label, i) =>
        label === null || label === undefined ? Symbol(i) : label
      )
    );
  }
  return levels;
};

const precedenceRules = (options) => {
  if (options.precedence?.length && !options.zones) {
    throw new RangeError('precedence requires zones');
  }
  if (
    options.clusterPrecedence?.length > (options.clusterLevels?.length ?? 0)
  ) {
    throw new RangeError('cluster precedence requires a matching level');
  }
  return [
    { labels: options.zones, pairs: options.precedence ?? [] },
    ...(options.clusterLevels ?? []).map((labels, i) => ({
      labels,
      pairs: options.clusterPrecedence?.[i] ?? [],
    })),
  ]
    .map(({ labels, pairs }) => {
      const present = new Set(labels?.slice(1) ?? []);
      return {
        labels,
        pairs: pairs.filter(
          ([before, after]) => present.has(before) && present.has(after)
        ),
      };
    })
    .filter(({ pairs }) => pairs.length > 0);
};

/** Constraint penalty: extra runs of any cluster plus reversed zone precedences. */
export const directedConstraintPenalty = (tour, options = {}) => {
  const levels = normalizedLevels(tour.length, options);
  const rules = precedenceRules(options);
  let penalty = 0;
  for (const labels of levels) {
    const closed = new Set();
    let last = null;
    for (const v of tour.slice(1)) {
      const label = labels[v];
      if (label !== last) {
        if (closed.has(label)) {
          penalty++;
        }
        if (last !== null) {
          closed.add(last);
        }
        last = label;
      }
    }
  }
  for (const { labels, pairs } of rules) {
    const first = new Map();
    tour.slice(1).forEach((v, i) => {
      if (!first.has(labels[v])) {
        first.set(labels[v], i);
      }
    });
    for (const [before, after] of pairs) {
      if (
        first.has(before) &&
        first.has(after) &&
        first.get(before) > first.get(after)
      ) {
        penalty++;
      }
    }
  }
  return penalty;
};

const allowedNext = (path, next, levels, rules) => {
  const visited = new Set(path);
  if (path.length > 1) {
    const current = path[path.length - 1];
    for (const labels of levels) {
      if (
        labels[current] !== labels[next] &&
        labels.some(
          (label, v) => v !== 0 && !visited.has(v) && label === labels[current]
        )
      ) {
        return false;
      }
      if (
        labels[current] !== labels[next] &&
        path.slice(1).some((v) => labels[v] === labels[next])
      ) {
        return false;
      }
    }
  }
  for (const { labels, pairs } of rules) {
    for (const [before, after] of pairs) {
      if (
        labels[next] === after &&
        !path.some((v) => v !== 0 && labels[v] === before)
      ) {
        return false;
      }
    }
  }
  return true;
};

const greedyConstrainedTour = (costs, levels, rules, options) => {
  const n = costs.length;
  if (n === 0) {
    return [];
  }
  const path = [0];
  const used = new Set(path);
  let explored = 0;
  const search = () => {
    if (path.length === n) {
      return true;
    }
    if (++explored > (options.maxConstructionNodes ?? 50000)) {
      return false;
    }
    const current = path[path.length - 1];
    const candidates = [];
    for (let v = 1; v < n; v++) {
      if (!used.has(v) && allowedNext(path, v, levels, rules)) {
        candidates.push(v);
      }
    }
    candidates.sort((a, b) => costs[current][a] - costs[current][b]);
    // Within a zone, the stop order does not affect cluster feasibility.
    if (
      options.zones &&
      path.length > 1 &&
      candidates.some((v) => options.zones[v] === options.zones[current])
    ) {
      candidates.splice(1);
    }
    for (const next of candidates) {
      path.push(next);
      used.add(next);
      if (search()) {
        return true;
      }
      used.delete(next);
      path.pop();
    }
    return false;
  };
  return search() ? path : null;
};

/**
 * Directed local search using reversals, short relocations, and pair swaps.
 * A move is accepted only when it shortens the route without increasing the
 * number of broken cluster or precedence constraints.
 */
export const directedLocalSearch = (costs, initialTour, options = {}) => {
  validateCosts(costs);
  if (
    initialTour.length !== costs.length ||
    (initialTour.length > 0 && initialTour[0] !== 0) ||
    new Set(initialTour).size !== costs.length ||
    initialTour.some((v) => !Number.isInteger(v) || v < 0 || v >= costs.length)
  ) {
    throw new RangeError(
      'initialTour must visit every stop once, starting at 0'
    );
  }
  let tour = [...initialTour];
  let length = directedTourLength(tour, costs);
  let penalty = directedConstraintPenalty(tour, options);
  for (let pass = 0; pass < (options.maxPasses ?? 50); pass++) {
    let bestTour = null;
    let bestLength = length;
    for (let from = 1; from < tour.length; from++) {
      for (let size = 1; size <= 3 && from + size <= tour.length; size++) {
        for (let to = 1; to <= tour.length - size; to++) {
          const candidate = [...tour];
          const segment = candidate.splice(from, size);
          candidate.splice(to, 0, ...segment);
          const candidateLength = directedTourLength(candidate, costs);
          if (
            candidateLength < bestLength - EPS &&
            directedConstraintPenalty(candidate, options) <= penalty
          ) {
            bestTour = candidate;
            bestLength = candidateLength;
          }
        }
      }
      for (let end = from + 1; end < tour.length; end++) {
        const candidate = [...tour];
        const reverse = candidate.slice(from, end + 1).reverse();
        candidate.splice(from, reverse.length, ...reverse);
        const candidateLength = directedTourLength(candidate, costs);
        if (
          candidateLength < bestLength - EPS &&
          directedConstraintPenalty(candidate, options) <= penalty
        ) {
          bestTour = candidate;
          bestLength = candidateLength;
        }
      }
      for (let other = from + 2; other < tour.length; other++) {
        const candidate = [...tour];
        [candidate[from], candidate[other]] = [
          candidate[other],
          candidate[from],
        ];
        const candidateLength = directedTourLength(candidate, costs);
        if (
          candidateLength < bestLength - EPS &&
          directedConstraintPenalty(candidate, options) <= penalty
        ) {
          bestTour = candidate;
          bestLength = candidateLength;
        }
      }
    }
    if (!bestTour) {
      break;
    }
    tour = bestTour;
    length = bestLength;
    penalty = directedConstraintPenalty(tour, options);
  }
  return {
    tour,
    distance: length,
    penalty,
    feasible: penalty === 0 && Number.isFinite(length),
  };
};

/** Repeat local search after two disjoint stop swaps to escape a local minimum. */
export const iteratedDirectedLocalSearch = (
  costs,
  initialTour,
  options = {}
) => {
  const restarts = options.restarts ?? 4;
  if (!Number.isInteger(restarts) || restarts < 1) {
    throw new RangeError('restarts must be a positive integer');
  }
  let best = directedLocalSearch(costs, initialTour, options);
  const stops = initialTour.length - 1;
  if (stops < 4) {
    return best;
  }
  for (let run = 1; run < restarts; run++) {
    const offset = (run - 1) % stops;
    const index = (step) => 1 + ((offset + step) % stops);
    const perturbed = [...best.tour];
    [perturbed[index(0)], perturbed[index(2)]] = [
      perturbed[index(2)],
      perturbed[index(0)],
    ];
    [perturbed[index(1)], perturbed[index(3)]] = [
      perturbed[index(3)],
      perturbed[index(1)],
    ];
    const candidate = directedLocalSearch(costs, perturbed, options);
    if (
      candidate.penalty <= best.penalty &&
      candidate.distance < best.distance - EPS
    ) {
      best = candidate;
    }
  }
  return best;
};

/**
 * Route an asymmetric matrix. Exact DFS is available for up to 12 stops;
 * larger routes use constraint-aware local search and remain uncertified.
 */
export const solveDirectedTsp = (costs, options = {}) => {
  validateCosts(costs);
  const n = costs.length;
  const levels = normalizedLevels(n, options);
  const rules = precedenceRules(options);
  if (n < 2) {
    return {
      tour: n ? [0] : [],
      distance: 0,
      penalty: 0,
      feasible: true,
      isOptimal: true,
    };
  }
  if (options.exact && n > (options.maxExactStops ?? 12)) {
    throw new RangeError('exact directed search exceeds maxExactStops');
  }
  const initial = greedyConstrainedTour(costs, levels, rules, options);
  const heuristic = iteratedDirectedLocalSearch(
    costs,
    initial ?? nearestNeighborDirected(costs),
    options
  );
  if (!options.exact) {
    return {
      ...heuristic,
      tour: Number.isFinite(heuristic.distance) ? heuristic.tour : null,
      isOptimal: false,
    };
  }
  let bestTour = heuristic.feasible ? heuristic.tour : null;
  let bestDistance = heuristic.feasible ? heuristic.distance : Infinity;
  const path = [0];
  const used = new Set(path);
  const search = (length) => {
    if (path.length === n) {
      const total = length + costs[path[path.length - 1]][0];
      if (total < bestDistance - EPS) {
        bestDistance = total;
        bestTour = [...path];
      }
      return;
    }
    const current = path[path.length - 1];
    const candidates = [];
    for (let v = 1; v < n; v++) {
      if (!used.has(v) && allowedNext(path, v, levels, rules)) {
        candidates.push(v);
      }
    }
    candidates.sort((a, b) => costs[current][a] - costs[current][b]);
    for (const v of candidates) {
      const nextLength = length + costs[current][v];
      if (nextLength >= bestDistance - EPS) {
        continue;
      }
      path.push(v);
      used.add(v);
      search(nextLength);
      used.delete(v);
      path.pop();
    }
  };
  search(0);
  if (!bestTour) {
    return {
      tour: null,
      distance: Infinity,
      penalty: Infinity,
      feasible: false,
      isOptimal: false,
      status: 'infeasible',
    };
  }
  return {
    tour: bestTour,
    distance: bestDistance,
    penalty: 0,
    feasible: true,
    isOptimal: true,
  };
};

/** Copy consecutive zone precedences from the training route with most overlap. */
export const learnZonePrecedence = (trainingOrders, targetZones) => {
  const target = new Set(
    targetZones.filter((zone) => String(zone).toLowerCase() !== 'depot')
  );
  let best = [];
  let bestOverlap = -1;
  for (const order of trainingOrders) {
    const overlap = new Set(order.filter((zone) => target.has(zone))).size;
    if (overlap > bestOverlap) {
      best = order.filter((zone) => target.has(zone));
      bestOverlap = overlap;
    }
  }
  const unique = [...new Set(best)];
  return unique.slice(1).map((zone, i) => [unique[i], zone]);
};

/**
 * Learn three nested groups from the four fields in Amazon sort-zone IDs.
 * For each hierarchy level, choose the field subset that yields the fewest
 * switches in the greatest number of historical zone orders. This follows
 * the key-selection method in JPT-AMZ's util_zone.py (MIT license).
 * https://github.com/heldstephan/jpt-amz/blob/main/scripts/util_zone.py
 */
const zoneLabel = (zone, key) => {
  const match = /^([^-]+)-(\d+)\.(\d+)([A-Za-z])$/.exec(String(zone));
  const parts = match?.slice(1);
  return parts ? key.map((index) => parts[index]).join(':') : String(zone);
};

export const inferZoneHierarchy = (trainingOrders, targetZones) => {
  const runs = (order, key) => {
    let last = null;
    let count = 0;
    for (const zone of order) {
      if (zone === 'Depot') {
        continue;
      }
      const current = zoneLabel(zone, key);
      if (current !== last) {
        count++;
        last = current;
      }
    }
    return count;
  };
  const choose = (candidates) => {
    const wins = candidates.map(() => 0);
    for (const order of trainingOrders) {
      const counts = candidates.map((key) => runs(order, key));
      wins[counts.indexOf(Math.min(...counts))]++;
    }
    return candidates[wins.indexOf(Math.max(...wins))];
  };
  const triples = [
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
    [1, 2, 3],
  ];
  const cluster = choose(triples);
  const pairs = [
    [cluster[0], cluster[1]],
    [cluster[0], cluster[2]],
    [cluster[1], cluster[2]],
  ];
  const superCluster = choose(pairs);
  const topCluster = choose(superCluster.map((index) => [index]));
  return {
    keys: { cluster, superCluster, topCluster },
    clusterLevels: [cluster, superCluster, topCluster].map((key) =>
      targetZones.map((zone) => zoneLabel(zone, key))
    ),
  };
};

/** Learn precedences between each level of the inferred zone hierarchy. */
export const learnClusterPrecedence = (
  trainingOrders,
  targetZones,
  hierarchy
) =>
  [
    hierarchy.keys.cluster,
    hierarchy.keys.superCluster,
    hierarchy.keys.topCluster,
  ].map((key) =>
    learnZonePrecedence(
      trainingOrders.map((order) => order.map((zone) => zoneLabel(zone, key))),
      targetZones.map((zone) => zoneLabel(zone, key))
    )
  );
