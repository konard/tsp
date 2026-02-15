/**
 * Space-filling tree walk with reflections for continuity.
 *
 * The key insight from the reference image is that the Z-shaped sub-patterns
 * are reflected/rotated at each level to ensure smooth connectivity between
 * adjacent sub-quadrants, similar to how Hilbert curves work.
 *
 * Base pattern (order 1): BL → TL → BR → TR (N-shape)
 * At higher orders, sub-patterns are reflected so that:
 * - The end of one sub-pattern is adjacent to the start of the next
 * - No long diagonal crossings occur
 */

import { writeFileSync } from 'fs';

/**
 * Generate space-filling tree curve with reflections for continuity.
 *
 * The approach: at each recursion level, we visit 4 quadrants in the order
 * BL, TL, BR, TR (Z-order). But we need to flip/rotate the sub-patterns
 * so connections are smooth.
 *
 * Let's define the base traversal order as visiting 4 corners:
 * Pattern N: BL(0,1) → TL(0,0) → BR(1,1) → TR(1,0)
 *
 * At each recursion level, sub-quadrants need to be oriented such that:
 * - BL sub-quadrant starts at BL corner and ends where TL sub-quadrant starts
 * - TL sub-quadrant ends where BR sub-quadrant starts
 * - BR sub-quadrant ends where TR sub-quadrant starts
 *
 * For the N-pattern:
 * BL sub: starts at BL-of-BL = (0,3), ends at... we need to think about this.
 *
 * Let me trace the reference walk order 2 carefully:
 * The bottom-left Z shape (BL quadrant of the order-2 pattern):
 *   Starts at (0,3) the very bottom-left
 *   Goes to (0,2) top of BL quadrant
 *   Then goes to (1,3) bottom-right of BL quadrant
 *   Ends at (1,2) top-right of BL quadrant
 *
 * Now it needs to connect to TL quadrant starting at (0,1):
 *   (1,2) → (0,1) is a diagonal jump! Unless the TL quadrant is oriented differently.
 *
 * What if TL quadrant is traversed as: BL→BR→TL→TR (reversed diagonal)?
 *   Start (0,1), then (1,1), then (0,0), then (1,0)
 *
 * Hmm, let me reconsider the reference image. The order-2 walk bottom section:
 *
 * Looking at the four Z-blocks in the reference, each individual Z-block looks identical
 * (same N/Z shape). And between them there are connecting segments.
 *
 * OK, I think the reference pattern might actually just be the standard Z-order
 * curve (no reflections), and the thick-line rendering in the reference makes
 * the inter-quadrant connections look acceptable. My thin-line version just
 * makes the crossings more visible.
 *
 * Let me try a DIFFERENT approach: instead of Z-order (BL,TL,BR,TR),
 * use the Hilbert curve-style visitation where each quadrant's traversal
 * direction is chosen to minimize connections.
 *
 * Actually, looking at the reference once more:
 * The walk order 1 shows: start at BOTTOM-LEFT, go UP to TOP-LEFT, then
 * diagonal to BOTTOM-RIGHT, then UP to TOP-RIGHT.
 *
 * For order 2, the 4 sub-N-shapes are:
 * Bottom-left Z: normal N shape
 * Top-left Z: appears to be... let me trace the connections in the reference.
 *
 * The reference order 2 walk shows the four sub-shapes connected with
 * no visible long crossings. Each connection between adjacent Z-shapes
 * appears to be a short segment.
 *
 * I think the solution is to flip the traversal direction of alternating
 * sub-quadrants, similar to a serpentine/boustrophedon pattern.
 */

/**
 * Approach 1: Z-order with Hilbert-like reflections
 *
 * Orientation encoding:
 * 0: BL → TL → BR → TR (starts BL, ends TR) - N shape
 * 1: TL → BL → TR → BR (starts TL, ends BR) - reversed N (U shape)
 * 2: TR → BR → TL → BL (starts TR, ends BL) - reversed N mirrored
 * 3: BR → TR → BL → TL (starts BR, ends TL) - N mirrored
 */

function generateHilbertLikeTreeCurve(order) {
  const gridSize = Math.pow(2, order);

  // Orientation 0 (default N): BL, TL, BR, TR
  // Need child orientations so end of one connects to start of next

  function recurse(x0, y0, size, orientation) {
    if (size === 1) {
      return [{ x: x0, y: y0 }];
    }

    const half = size / 2;

    // Define quadrant positions
    const TL = { x: x0, y: y0 };
    const TR = { x: x0 + half, y: y0 };
    const BL = { x: x0, y: y0 + half };
    const BR = { x: x0 + half, y: y0 + half };

    let result = [];

    switch (orientation) {
      case 0:
        // N-shape: BL → TL → BR → TR
        // BL sub starts at its BL corner. End of BL connects to start of TL.
        // BL ends at its TR corner (orientation 0 ends at TR).
        // TL starts at its BL corner (orientation 0 starts at BL).
        // BL-TR = (x0+half-1, y0+half) ... TL-BL = (x0, y0+half-1) → need different orient
        //
        // Actually let me think about what orientation makes the ends connect:
        // BL quadrant: starts at bottom-left of BL, ends at ???
        //   If orient 0: starts at BL-of-BL(x0, y0+size-1), ends at TR-of-BL(x0+half-1, y0+half)
        //   Then TL quadrant needs to START near (x0+half-1, y0+half)
        //   TL quadrant is at (x0, y0). Its bottom-right corner is (x0+half-1, y0+half-1)
        //   So we need TL to start at its BR corner.
        //   Orient 2 starts at TR. Orient 3 starts at BR. So TL should use orient 3.
        //
        // Let me define orientations more carefully:
        // Orient 0: BL→TL→BR→TR. Start=BL corner, End=TR corner
        // Orient 1: TL→TR→BL→BR. Start=TL corner, End=BR corner
        // Orient 2: TR→BR→TL→BL. Start=TR corner, End=BL corner
        // Orient 3: BR→BL→TR→TL. Start=BR corner, End=TL corner

        // For N-shape (orient 0): visit BL, TL, BR, TR
        // BL sub needs orient that ends near TL sub start
        // BL sub with orient 1: starts TL-of-BL, ends BR-of-BL
        //   BR-of-BL = (x0+half-1, y0+size-1)
        //   TL sub start... need it near (x0+half-1, y0+size-1)
        //   But TL is at (x0, y0) region, nowhere near there.
        //
        // I think I need to reconsider. Let me try orient 0 for BL:
        //   BL orient 0: starts BL-of-BL = (x0, y0+size-1), ends TR-of-BL = (x0+half-1, y0+half)
        //   TL needs to start near (x0+half-1, y0+half)
        //   TL region is (x0, y0) to (x0+half-1, y0+half-1)
        //   Closest corner is BR-of-TL = (x0+half-1, y0+half-1)
        //   Orient 3 starts at BR. So TL orient 3.
        //
        // TL orient 3: starts BR-of-TL = (x0+half-1, y0+half-1), ends TL-of-TL = (x0, y0)
        //   End = (x0, y0)
        //   BR needs to start near (x0, y0)
        //   BR region is (x0+half, y0+half) to (x0+size-1, y0+size-1)
        //   Not adjacent to (x0, y0) at all!
        //
        // This doesn't work well for the N/Z pattern. The problem is that
        // the Z-order connects BL→TL→BR→TR which has a diagonal jump from TL to BR.
        //
        // In a Hilbert curve, the quadrant order is chosen to avoid diagonal jumps.
        // The Hilbert curve visits: BL→TL→TR→BR (U-shape, not Z-shape).
        //
        // For the Z-order tree pattern from the reference, diagonal jumps between
        // TL and BR are inherent to the pattern. The reference image shows these
        // diagonal connections as part of the pattern.

        result = [
          ...recurse(BL.x, BL.y, half, 0),
          ...recurse(TL.x, TL.y, half, 0),
          ...recurse(BR.x, BR.y, half, 0),
          ...recurse(TR.x, TR.y, half, 0),
        ];
        break;

      case 1:
        result = [
          ...recurse(TL.x, TL.y, half, 1),
          ...recurse(TR.x, TR.y, half, 1),
          ...recurse(BL.x, BL.y, half, 1),
          ...recurse(BR.x, BR.y, half, 1),
        ];
        break;

      case 2:
        result = [
          ...recurse(TR.x, TR.y, half, 2),
          ...recurse(BR.x, BR.y, half, 2),
          ...recurse(TL.x, TL.y, half, 2),
          ...recurse(BL.x, BL.y, half, 2),
        ];
        break;

      case 3:
        result = [
          ...recurse(BR.x, BR.y, half, 3),
          ...recurse(BL.x, BL.y, half, 3),
          ...recurse(TR.x, TR.y, half, 3),
          ...recurse(TL.x, TL.y, half, 3),
        ];
        break;
    }

    return result;
  }

  return recurse(0, 0, gridSize, 0);
}

/**
 * Approach 2: Simple Z-order (BL→TL→BR→TR) with NO reflections.
 * This is what the reference image likely shows - the diagonal connections
 * between TL and BR quadrants are just part of the Z-order pattern.
 */
function generateSimpleZOrderCurve(order) {
  const gridSize = Math.pow(2, order);

  function recurse(x0, y0, size) {
    if (size === 1) {
      return [{ x: x0, y: y0 }];
    }

    const half = size / 2;

    // Z-order: BL, TL, BR, TR
    return [
      ...recurse(x0, y0 + half, half),        // BL
      ...recurse(x0, y0, half),                 // TL
      ...recurse(x0 + half, y0 + half, half),  // BR
      ...recurse(x0 + half, y0, half),          // TR
    ];
  }

  return recurse(0, 0, gridSize);
}

/**
 * Approach 3: Hilbert-like curve that visits BL→TL→TR→BR (U-shape)
 * with proper reflections for continuity
 */
function generateHilbertUCurve(order) {
  const gridSize = Math.pow(2, order);

  // Orientation: determines how sub-quadrants are visited
  // d=0: UP (start BL, go to TL, TR, BR - U shape opening right)
  // d=1: RIGHT (start BL, go to BR, TR, TL - U shape opening up)
  // d=2: DOWN (start TR, go to BR, BL, TL - U shape opening left)
  // d=3: LEFT (start TR, go to TL, BL, BR - U shape opening down)

  function recurse(x0, y0, size, d) {
    if (size === 1) {
      return [{ x: x0, y: y0 }];
    }

    const half = size / 2;

    const TL = { x: x0, y: y0 };
    const TR = { x: x0 + half, y: y0 };
    const BL = { x: x0, y: y0 + half };
    const BR = { x: x0 + half, y: y0 + half };

    switch (d) {
      case 0: // U opening right: BL → TL → TR → BR
        return [
          ...recurse(BL.x, BL.y, half, 1),  // BL, enter from its BL going right
          ...recurse(TL.x, TL.y, half, 0),  // TL, continue up pattern
          ...recurse(TR.x, TR.y, half, 0),  // TR, continue up pattern
          ...recurse(BR.x, BR.y, half, 3),  // BR, exit going left
        ];
      case 1: // U opening up: BL → BR → TR → TL
        return [
          ...recurse(BL.x, BL.y, half, 0),  // BL
          ...recurse(BR.x, BR.y, half, 1),  // BR
          ...recurse(TR.x, TR.y, half, 1),  // TR
          ...recurse(TL.x, TL.y, half, 2),  // TL
        ];
      case 2: // U opening left: TR → BR → BL → TL
        return [
          ...recurse(TR.x, TR.y, half, 3),
          ...recurse(BR.x, BR.y, half, 2),
          ...recurse(BL.x, BL.y, half, 2),
          ...recurse(TL.x, TL.y, half, 1),
        ];
      case 3: // U opening down: TR → TL → BL → BR
        return [
          ...recurse(TR.x, TR.y, half, 2),
          ...recurse(TL.x, TL.y, half, 3),
          ...recurse(BL.x, BL.y, half, 3),
          ...recurse(BR.x, BR.y, half, 0),
        ];
    }
  }

  return recurse(0, 0, gridSize, 0);
}

// Generate SVG for any curve
function createWalkSVG(points, gridSize, svgSize, title) {
  const padding = 40;
  const drawSize = svgSize - 2 * padding;
  const scale = drawSize / (gridSize - 1 || 1);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">\n`;
  svg += `  <rect width="${svgSize}" height="${svgSize}" fill="white"/>\n`;
  svg += `  <text x="${svgSize / 2}" y="20" font-size="14" text-anchor="middle">${title}</text>\n`;

  // Draw grid dots
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const px = padding + i * scale;
      const py = padding + j * scale;
      svg += `  <circle cx="${px}" cy="${py}" r="1.5" fill="#ccc"/>\n`;
    }
  }

  // Draw path
  if (points.length > 1) {
    let pathData = '';
    for (let i = 0; i < points.length; i++) {
      const px = padding + points[i].x * scale;
      const py = padding + points[i].y * scale;
      pathData += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
    }
    svg += `  <path d="${pathData}" fill="none" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>\n`;
  }

  // Draw numbered points
  for (let i = 0; i < points.length; i++) {
    const px = padding + points[i].x * scale;
    const py = padding + points[i].y * scale;
    svg += `  <circle cx="${px}" cy="${py}" r="5" fill="red"/>\n`;
    if (points.length <= 16) {
      svg += `  <text x="${px}" y="${py + 3.5}" font-size="8" text-anchor="middle" fill="white" font-weight="bold">${i}</text>\n`;
    }
  }

  svg += `</svg>`;
  return svg;
}

// Generate and compare all 3 approaches at orders 1, 2, 3
const approaches = [
  { name: 'Z-order (simple)', fn: generateSimpleZOrderCurve },
  { name: 'Z-order (Hilbert-like)', fn: (order) => generateHilbertLikeTreeCurve(order) },
  { name: 'Hilbert U-curve', fn: generateHilbertUCurve },
];

let html = `<!DOCTYPE html><html><head><title>Curve Comparison</title></head>
<body style="margin:20px;background:#fff;font-family:sans-serif">
<h1>Reference Image</h1>
<img src="reference-image.png" width="500">
<hr>
<h1>Approach Comparison</h1>
<table border="1" cellpadding="10">\n<tr><th>Approach</th><th>Order 1</th><th>Order 2</th><th>Order 3</th></tr>\n`;

for (const approach of approaches) {
  html += `<tr><td><b>${approach.name}</b></td>`;
  for (let order = 1; order <= 3; order++) {
    const gridSize = Math.pow(2, order);
    const points = approach.fn(order);
    const svgSize = 200 + order * 50;
    const filename = `curve-${approach.name.replace(/[^a-z0-9]/gi, '-')}-order${order}.svg`;
    const svg = createWalkSVG(points, gridSize, svgSize, `${approach.name} Order ${order}`);
    writeFileSync(`experiments/${filename}`, svg);
    html += `<td><img src="${filename}" width="${svgSize}"></td>`;
  }
  html += `</tr>\n`;
}

html += `</table></body></html>`;
writeFileSync('experiments/curve-comparison.html', html);
console.log('Generated curve-comparison.html');
