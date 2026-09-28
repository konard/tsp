import { distance, calculateTotalDistance } from '../utils.js';
/* eslint-disable complexity, max-lines-per-function, max-statements -- LP construction and cut separation are a single iterative procedure. */
import { sawSolution } from '../atomic/solution/saw.js';
import { solveLinearProgram } from './simplex.js';

const EPS = 1e-7;

/** Minimum s-t cut of an undirected nonnegative capacity matrix. */
export const minimumCut = (capacity, source, sink) => {
  const n = capacity.length;
  if (source === sink || source < 0 || sink < 0 || source >= n || sink >= n) {
    throw new RangeError('source and sink must be distinct vertices');
  }
  const residual = capacity.map((row) => [...row]);
  let value = 0;
  for (;;) {
    const parent = new Array(n).fill(-1);
    parent[source] = source;
    const queue = [source];
    for (let head = 0; head < queue.length && parent[sink] < 0; head++) {
      const u = queue[head];
      for (let v = 0; v < n; v++) {
        if (parent[v] < 0 && residual[u][v] > EPS) {
          parent[v] = u;
          queue.push(v);
        }
      }
    }
    if (parent[sink] < 0) {
      return {
        value,
        vertices: queue.sort((a, b) => a - b),
      };
    }
    let flow = Infinity;
    for (let v = sink; v !== source; v = parent[v]) {
      flow = Math.min(flow, residual[parent[v]][v]);
    }
    for (let v = sink; v !== source; v = parent[v]) {
      residual[parent[v]][v] -= flow;
      residual[v][parent[v]] += flow;
    }
    value += flow;
  }
};

export const globalMinimumCut = (capacity) => {
  let best = null;
  for (let sink = 1; sink < capacity.length; sink++) {
    const candidate = minimumCut(capacity, 0, sink);
    if (!best || candidate.value < best.value - EPS) {
      best = candidate;
    }
  }
  return best;
};

const validateSet = (vertices, n) => {
  const set = new Set(vertices);
  if (
    set.size !== vertices.length ||
    vertices.some((v) => !Number.isInteger(v) || v < 0 || v >= n)
  ) {
    throw new RangeError('cut vertices must be unique valid indices');
  }
  return set;
};

/** A subtour cut requires two tour edges to cross any proper vertex subset. */
export const subtourCut = (vertices, n) => {
  const set = validateSet(vertices, n);
  if (set.size === 0 || set.size === n) {
    throw new RangeError('subtour cut must use a nonempty proper subset');
  }
  return { type: 'subtour', vertices: [...set].sort((a, b) => a - b) };
};

/** Construct a valid comb inequality for a handle and an odd number of teeth. */
export const combCut = (handle, teeth, n) => {
  const H = validateSet(handle, n);
  if (
    H.size === 0 ||
    H.size === n ||
    teeth.length < 3 ||
    teeth.length % 2 !== 1
  ) {
    throw new RangeError(
      'comb needs a proper handle and at least three odd teeth'
    );
  }
  const used = new Set();
  for (const tooth of teeth) {
    const T = validateSet(tooth, n);
    if (!tooth.some((v) => H.has(v)) || !tooth.some((v) => !H.has(v))) {
      throw new RangeError('each tooth must cross the handle');
    }
    for (const v of T) {
      if (used.has(v)) {
        throw new RangeError('teeth must be disjoint');
      }
      used.add(v);
    }
  }
  return {
    type: 'comb',
    handle: [...H].sort((a, b) => a - b),
    teeth: teeth.map((t) => [...t].sort((a, b) => a - b)),
    rhs: 3 * teeth.length + 1,
  };
};

const components = (n, edges, values, exclude = -1) => {
  const adjacent = Array.from({ length: n }, () => []);
  edges.forEach(([u, v], i) => {
    if (values[i] > EPS && u !== exclude && v !== exclude) {
      adjacent[u].push(v);
      adjacent[v].push(u);
    }
  });
  const seen = new Set([exclude]);
  const result = [];
  for (let start = 0; start < n; start++) {
    if (seen.has(start)) {
      continue;
    }
    const part = [];
    const queue = [start];
    seen.add(start);
    for (let head = 0; head < queue.length; head++) {
      const u = queue[head];
      part.push(u);
      for (const v of adjacent[u]) {
        if (!seen.has(v)) {
          seen.add(v);
          queue.push(v);
        }
      }
    }
    result.push(part);
  }
  return result;
};

const cutCapacity = (vertices, edges, values) => {
  const set = new Set(vertices);
  return edges.reduce(
    (sum, [u, v], i) => sum + (set.has(u) !== set.has(v) ? values[i] : 0),
    0
  );
};

export const findSimpleBlossoms = (n, edges, values) => {
  const fractional = values.map((x) => (x < 1 - EPS ? x : 0));
  const parts = components(n, edges, fractional);
  const candidates = [];
  for (const handle of parts) {
    const H = new Set(handle);
    const teeth = edges.filter(
      ([u, v], i) => values[i] >= 1 - EPS && H.has(u) !== H.has(v)
    );
    if (teeth.length < 3 || teeth.length % 2 !== 1) {
      continue;
    }
    try {
      candidates.push(combCut(handle, teeth, n));
    } catch {
      // Shared endpoints do not define a simple blossom.
    }
  }
  return candidates;
};

const cutRow = (cut, edges) => {
  const sets =
    cut.type === 'comb' ? [cut.handle, ...cut.teeth] : [cut.vertices];
  const vertexSets = sets.map((vertices) => new Set(vertices));
  return edges.map(
    ([u, v]) =>
      -vertexSets.reduce(
        (sum, set) => sum + (set.has(u) !== set.has(v) ? 1 : 0),
        0
      )
  );
};

const cutKey = (cut) =>
  cut.type === 'comb'
    ? `comb:${cut.handle}:${cut.teeth.map((t) => t.join(',')).join(';')}`
    : `subtour:${cut.vertices.join(',')}`;

/** Solve the symmetric TSP degree LP, optionally adding subtour and blossom cuts. */
export const solveTspRelaxation = (points, options = {}) => {
  const n = points.length;
  const mode = options.cuts ?? 'full';
  if (!['none', 'components', 'two-connected', 'full'].includes(mode)) {
    throw new RangeError('unknown cut mode');
  }
  if (n < 3) {
    return {
      status: 'optimal',
      lowerBound: n === 2 ? 2 * distance(points[0], points[1]) : 0,
      edges: [],
      values: [],
      cuts: [],
    };
  }
  const edges = [];
  const costs = [];
  for (let u = 0; u < n; u++) {
    for (let v = u + 1; v < n; v++) {
      edges.push([u, v]);
      costs.push(distance(points[u], points[v]));
    }
  }
  const m = edges.length;
  const A = [];
  const b = [];
  const add = (row, rhs) => {
    A.push(row);
    b.push(rhs);
  };
  for (let v = 0; v < n; v++) {
    const row = edges.map(([u, w]) => (u === v || w === v ? 1 : 0));
    add(row, 2);
    add(
      row.map((x) => -x),
      -2
    );
  }
  for (let i = 0; i < m; i++) {
    const row = new Array(m).fill(0);
    row[i] = 1;
    add(row, 1);
  }
  for (const [index, value] of options.fixedEdges ?? []) {
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= m ||
      ![0, 1].includes(value)
    ) {
      throw new RangeError(
        'fixed edge must have a valid index and binary value'
      );
    }
    const row = new Array(m).fill(0);
    row[index] = value === 0 ? 1 : -1;
    add(row, value === 0 ? 0 : -1);
  }
  const cuts = [];
  const known = new Set();
  const addCut = (cut) => {
    const key = cutKey(cut);
    if (known.has(key)) {
      return false;
    }
    known.add(key);
    cuts.push(cut);
    add(cutRow(cut, edges), -(cut.type === 'comb' ? cut.rhs : 2));
    return true;
  };
  for (const cut of options.initialCuts ?? []) {
    if (cut.type === 'comb') {
      addCut(combCut(cut.handle, cut.teeth, n));
    } else if (cut.type === 'subtour') {
      addCut(subtourCut(cut.vertices, n));
    } else {
      throw new RangeError('unknown initial cut type');
    }
  }

  for (let round = 0; round <= (options.maxRounds ?? 200); round++) {
    const lp = solveLinearProgram(
      A,
      b,
      costs.map((cost) => -cost)
    );
    if (lp.status !== 'optimal') {
      return { status: lp.status, edges, values: [], cuts };
    }
    const values = lp.values.map((x) => Math.max(0, Math.min(1, x)));
    const result = {
      status: 'optimal',
      // Offset numerical simplex error before reporting a certified bound.
      lowerBound: Math.max(
        0,
        -lp.objective - 1e-7 * Math.max(1, Math.abs(lp.objective))
      ),
      edges,
      values,
      cuts,
    };
    if (mode === 'none' || round === (options.maxRounds ?? 200)) {
      return {
        ...result,
        status:
          round === (options.maxRounds ?? 200) && mode !== 'none'
            ? 'cut-limit'
            : 'optimal',
      };
    }
    let added = false;
    const parts = components(n, edges, values);
    if (parts.length > 1) {
      for (const part of parts) {
        if (part.length < n && cutCapacity(part, edges, values) < 2 - EPS) {
          added =
            addCut({ type: 'subtour', vertices: part.sort((a, b) => a - b) }) ||
            added;
        }
      }
    }
    if (!added && ['two-connected', 'full'].includes(mode)) {
      for (let v = 0; v < n && !added; v++) {
        const pieces = components(n, edges, values, v);
        if (pieces.length < 2) {
          continue;
        }
        for (const part of pieces) {
          if (cutCapacity(part, edges, values) < 2 - EPS) {
            added =
              addCut({
                type: 'subtour',
                vertices: part.sort((a, b) => a - b),
              }) || added;
          }
        }
      }
    }
    if (!added && mode === 'full') {
      const capacity = Array.from({ length: n }, () => new Array(n).fill(0));
      edges.forEach(([u, v], i) => {
        capacity[u][v] = values[i];
        capacity[v][u] = values[i];
      });
      const minimum = globalMinimumCut(capacity);
      if (minimum.value < 2 - EPS) {
        added = addCut({ type: 'subtour', vertices: minimum.vertices });
      }
    }
    if (!added && options.blossoms) {
      for (const cut of findSimpleBlossoms(n, edges, values)) {
        const lhs = -cutRow(cut, edges).reduce(
          (sum, coefficient, i) => sum + coefficient * values[i],
          0
        );
        if (lhs < cut.rhs - EPS) {
          added = addCut(cut) || added;
        }
      }
    }
    if (!added) {
      return result;
    }
  }
};

const tourFromLp = (n, edges, values) => {
  if (values.some((x) => x > EPS && x < 1 - EPS)) {
    return null;
  }
  const neighbors = Array.from({ length: n }, () => []);
  edges.forEach(([u, v], i) => {
    if (values[i] > 0.5) {
      neighbors[u].push(v);
      neighbors[v].push(u);
    }
  });
  if (neighbors.some((list) => list.length !== 2)) {
    return null;
  }
  const tour = [0];
  let previous = -1;
  while (tour.length < n) {
    const current = tour[tour.length - 1];
    const next = neighbors[current].find((v) => v !== previous);
    if (tour.includes(next)) {
      return null;
    }
    tour.push(next);
    previous = current;
  }
  return neighbors[tour[n - 1]].includes(0) ? tour : null;
};

/** Exact LP branch-and-cut with either best-bound or depth-first node selection. */
export const branchAndCut = (points, options = {}) => {
  const strategy = options.strategy ?? 'best-bound';
  if (!['best-bound', 'depth-first'].includes(strategy)) {
    throw new RangeError('unknown branch strategy');
  }
  if (points.length < 3) {
    const tour = points.map((_, i) => i);
    return {
      tour,
      distance: calculateTotalDistance(tour, points),
      lowerBound: calculateTotalDistance(tour, points),
      isOptimal: true,
      nodes: 0,
    };
  }
  let bestTour = sawSolution(points).tour;
  let bestDistance = calculateTotalDistance(bestTour, points);
  const solve = (fixedEdges) =>
    solveTspRelaxation(points, {
      cuts: 'full',
      blossoms: options.blossoms ?? true,
      fixedEdges,
      maxRounds: options.maxRounds,
    });
  const root = solve([]);
  if (root.status === 'infeasible') {
    throw new Error('unconstrained TSP LP is unexpectedly infeasible');
  }
  const pending = [{ fixedEdges: [], lp: root }];
  let nodes = 0;
  let complete = true;
  const unresolvedBounds = [];
  while (pending.length > 0) {
    if (nodes >= (options.maxNodes ?? 1000)) {
      complete = false;
      break;
    }
    if (strategy === 'best-bound') {
      pending.sort((a, b) => (b.lp.lowerBound ?? 0) - (a.lp.lowerBound ?? 0));
    }
    const node = pending.pop();
    nodes++;
    if (
      node.lp.status === 'infeasible' ||
      node.lp.lowerBound >= bestDistance - EPS
    ) {
      continue;
    }
    if (node.lp.status !== 'optimal') {
      complete = false;
      unresolvedBounds.push(node.lp.lowerBound ?? 0);
      continue;
    }
    const tour = tourFromLp(points.length, node.lp.edges, node.lp.values);
    if (tour) {
      const length = calculateTotalDistance(tour, points);
      if (length < bestDistance) {
        bestDistance = length;
        bestTour = tour;
      }
      continue;
    }
    const fractions = node.lp.values
      .map((value, index) => ({ value, index }))
      .filter(({ value }) => value > EPS && value < 1 - EPS)
      .sort(
        (a, b) =>
          Math.abs(a.value - 0.5) - Math.abs(b.value - 0.5) || a.index - b.index
      );
    if (fractions.length === 0) {
      complete = false;
      unresolvedBounds.push(node.lp.lowerBound);
      continue;
    }
    for (const value of [0, 1]) {
      const fixedEdges = [...node.fixedEdges, [fractions[0].index, value]];
      const lp = solve(fixedEdges);
      if (lp.status !== 'infeasible') {
        pending.push({ fixedEdges, lp });
      }
    }
  }
  return {
    tour: bestTour,
    distance: bestDistance,
    lowerBound: complete
      ? bestDistance
      : Math.min(
          bestDistance,
          ...unresolvedBounds,
          ...pending.map((node) => node.lp.lowerBound ?? 0)
        ),
    isOptimal: complete,
    nodes,
  };
};
