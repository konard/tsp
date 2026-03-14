/**
 * Experiment: Analyze tree edge alignment with grid points
 *
 * This script tests whether tree edge endpoints land on integer grid coordinates.
 */

// Current implementation
const generateTreeEdgesCurrent = (order, treeGridSize) => {
  const edges = [];
  const recurse = (cx, cy, halfW, halfH, depth) => {
    if (depth >= order) return;
    const qHalfW = halfW / 2;
    const qHalfH = halfH / 2;
    const quadrants = [
      { x: cx - qHalfW, y: cy - qHalfH },
      { x: cx + qHalfW, y: cy - qHalfH },
      { x: cx - qHalfW, y: cy + qHalfH },
      { x: cx + qHalfW, y: cy + qHalfH },
    ];
    for (const q of quadrants) {
      edges.push({ from: { x: cx, y: cy }, to: q, depth });
      recurse(q.x, q.y, qHalfW, qHalfH, depth + 1);
    }
  };
  const halfGrid = (treeGridSize - 1) / 2;
  recurse(halfGrid, halfGrid, halfGrid, halfGrid, 0);
  return edges;
};

// Fixed implementation: use treeGridSize as full extent, center at treeGridSize/2
const generateTreeEdgesFixed = (order, treeGridSize) => {
  const edges = [];
  const recurse = (cx, cy, halfW, halfH, depth) => {
    if (depth >= order) return;
    const qHalfW = halfW / 2;
    const qHalfH = halfH / 2;
    const quadrants = [
      { x: cx - qHalfW, y: cy - qHalfH },
      { x: cx + qHalfW, y: cy - qHalfH },
      { x: cx - qHalfW, y: cy + qHalfH },
      { x: cx + qHalfW, y: cy + qHalfH },
    ];
    for (const q of quadrants) {
      edges.push({ from: { x: cx, y: cy }, to: q, depth });
      recurse(q.x, q.y, qHalfW, qHalfH, depth + 1);
    }
  };
  const halfGrid = treeGridSize / 2;
  recurse(halfGrid, halfGrid, halfGrid, halfGrid, 0);
  return edges;
};

// Check alignment for various grid sizes
function checkAlignment(name, generator) {
  console.log(`\n=== ${name} ===`);
  for (const gridSize of [2, 4, 8]) {
    const order = Math.round(Math.log2(gridSize));
    const edges = generator(order, gridSize);
    const allPoints = new Set();
    for (const e of edges) {
      allPoints.add(`${e.from.x},${e.from.y}`);
      allPoints.add(`${e.to.x},${e.to.y}`);
    }

    let onGrid = 0;
    let offGrid = 0;
    const offGridPoints = [];
    for (const p of allPoints) {
      const [x, y] = p.split(',').map(Number);
      if (Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        onGrid++;
      } else {
        offGrid++;
        offGridPoints.push(p);
      }
    }

    console.log(`Grid ${gridSize}x${gridSize} (order ${order}): ${allPoints.size} unique points, ${onGrid} on grid, ${offGrid} off grid`);
    if (offGridPoints.length > 0 && offGridPoints.length <= 10) {
      console.log(`  Off-grid points: ${offGridPoints.join('; ')}`);
    }
    if (onGrid > 0) {
      const onGridPts = [...allPoints].filter(p => {
        const [x, y] = p.split(',').map(Number);
        return Number.isInteger(x) && Number.isInteger(y);
      });
      if (onGridPts.length <= 10) console.log(`  On-grid points: ${onGridPts.join('; ')}`);
    }
  }
}

checkAlignment('CURRENT (treeGridSize-1)/2', generateTreeEdgesCurrent);
checkAlignment('FIXED treeGridSize/2', generateTreeEdgesFixed);

// For the fixed version, let's see what the leaf-level points look like
// and check if they map to curve coordinates
console.log('\n=== Fixed version - detailed points for 4x4 ===');
const edges4 = generateTreeEdgesFixed(2, 4);
for (const e of edges4) {
  console.log(`  depth=${e.depth}: (${e.from.x},${e.from.y}) -> (${e.to.x},${e.to.y})`);
}

// The curve generates points at integer coords [0, gridSize-1]
// For gridSize=4, curve points are at 0,1,2,3
// The fixed tree with treeGridSize/2=2 as center generates:
// Level 0: center (2,2) -> (1,1), (3,1), (1,3), (3,3)  - all integers!
// Level 1: (1,1) -> (0.5,0.5) etc - NOT integers

// What about using (treeGridSize-1) as full extent but starting differently?
// The curve covers [0, gridSize-1] = [0, 3] for gridSize=4
// We need the tree to recursively subdivide [0, 3] and hit integer coords at leaf level

// Alternative approach: position tree nodes at actual grid intersections
// For order=1 (2x2): nodes at 0, 1 -> center at 0.5, quadrant centers at 0, 1
// For order=2 (4x4): nodes at 0, 1, 2, 3 -> centers of quadrants at level 0 are at 1.5
//   Level 1 sub-centers: 0.5, 2.5 -> still not on grid

// The fundamental issue: a binary tree subdivision of N points always places
// intermediate nodes at half-integer positions. The tree structure visualization
// inherently cannot land on all grid points unless we accept that the tree
// represents the MIDPOINTS between grid cells, not the grid points themselves.

// Better approach: shift the coordinate system so tree nodes align with grid points
// For a grid of size 2^n, we can define the tree to have nodes at:
// Level 0: center of full grid
// Level k: 2^(2k) nodes, each at center of a sub-cell
// The leaf nodes (level n) should be at the actual grid points

// For gridSize=2 (order=1):
//   Leaf nodes should be at (0,0), (1,0), (0,1), (1,1)
//   Root should be at center (0.5, 0.5) - this is unavoidably off-grid for even grids
//   OR we can define the tree differently: root connects directly to 4 grid points

// Actually the simplest correct fix: the tree should span from -0.5 to gridSize-0.5
// so that intermediate nodes land between grid lines and leaf nodes land ON grid points
// This way the tree is a spatial index of the grid points.

// Let me verify: for gridSize=2, span [−0.5, 1.5], center=0.5, halfGrid=1
// Level 0: center (0.5,0.5) -> quadrants at (0,0), (1,0), (0,1), (1,1) ✓ all on grid!
// For gridSize=4, span [−0.5, 3.5], center=1.5, halfGrid=2
// Level 0: center (1.5,1.5) -> quadrants at (0.5,0.5), (2.5,0.5), (0.5,2.5), (2.5,2.5) - off grid
// Level 1: (0.5,0.5) -> (0,0), (1,0), (0,1), (1,1) ✓ on grid!

// So leaf-level nodes always land on grid points, but intermediate nodes are half-integers.
// This is geometrically correct - the tree subdivides space and leaves touch grid points.

console.log('\n=== Alternative: center at (gridSize-1)/2, halfGrid = gridSize/2 ===');
const generateTreeEdgesAlt = (order, treeGridSize) => {
  const edges = [];
  const recurse = (cx, cy, halfW, halfH, depth) => {
    if (depth >= order) return;
    const qHalfW = halfW / 2;
    const qHalfH = halfH / 2;
    const quadrants = [
      { x: cx - qHalfW, y: cy - qHalfH },
      { x: cx + qHalfW, y: cy - qHalfH },
      { x: cx - qHalfW, y: cy + qHalfH },
      { x: cx + qHalfW, y: cy + qHalfH },
    ];
    for (const q of quadrants) {
      edges.push({ from: { x: cx, y: cy }, to: q, depth });
      recurse(q.x, q.y, qHalfW, qHalfH, depth + 1);
    }
  };
  // Center of grid [0, treeGridSize-1] is (treeGridSize-1)/2
  // But halfGrid should be treeGridSize/2 to ensure leaves land on integer coords
  const center = (treeGridSize - 1) / 2;
  const halfGrid = treeGridSize / 2;
  recurse(center, center, halfGrid, halfGrid, 0);
  return edges;
};

for (const gridSize of [2, 4, 8]) {
  const order = Math.round(Math.log2(gridSize));
  const edges = generateTreeEdgesAlt(order, gridSize);
  const allPoints = new Set();
  const leafPoints = new Set();
  for (const e of edges) {
    allPoints.add(`${e.from.x},${e.from.y}`);
    allPoints.add(`${e.to.x},${e.to.y}`);
    if (e.depth === order - 1) {
      leafPoints.add(`${e.to.x},${e.to.y}`);
    }
  }

  const leafOnGrid = [...leafPoints].filter(p => {
    const [x, y] = p.split(',').map(Number);
    return Number.isInteger(x) && Number.isInteger(y);
  });

  console.log(`Grid ${gridSize}x${gridSize}: ${leafPoints.size} leaf points, ${leafOnGrid.length} on grid`);
  console.log(`  All points: ${[...allPoints].join('; ')}`);
  console.log(`  Leaf points: ${[...leafPoints].join('; ')}`);
}
