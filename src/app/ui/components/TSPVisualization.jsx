/**
 * TSPVisualization Component
 *
 * SVG-based visualization for TSP algorithms.
 * Displays points, tour paths, and algorithm-specific elements
 * (sweep line for Sonar, curve for Moore).
 */

import { useState, useEffect, useRef } from 'react';

/**
 * Convert point coordinates to SVG space
 * @param {{x: number, y: number}} p - Point in grid coordinates
 * @param {number} padding - SVG padding
 * @param {number} scale - Coordinate scale factor
 * @returns {{x: number, y: number}} Point in SVG coordinates
 */
const toSvgCoords = (p, padding, scale) => ({
  x: padding + p.x * scale,
  y: padding + p.y * scale,
});

/**
 * TSPVisualization - SVG renderer for TSP algorithms
 *
 * @param {Object} props
 * @param {Array<{x: number, y: number, id: number}>} props.points - Array of points
 * @param {Array<Object>} props.steps - Array of algorithm steps
 * @param {number} props.currentStep - Current step index
 * @param {string} props.algorithm - Algorithm type ('sonar' or 'moore')
 * @param {number} props.mooreGridSize - Size of the grid
 * @param {boolean} props.showOptimization - Whether showing optimization phase
 */
const TSPVisualization = ({
  points,
  steps,
  currentStep,
  algorithm,
  mooreGridSize,
  showOptimization,
}) => {
  const containerRef = useRef(null);
  const [svgSize, setSvgSize] = useState(400);
  const padding = 20;

  // Responsive SVG sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Max size 400, min size 280, responsive to container
        const newSize = Math.min(400, Math.max(280, containerWidth - 32));
        setSvgSize(newSize);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const size = svgSize;

  // Get current step data
  const step =
    currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;

  // Both algorithms use the same Moore grid size for perfect alignment
  // Grid coordinates range from 0 to mooreGridSize-1
  const displayGridSize = mooreGridSize - 1;

  const scale = (size - 2 * padding) / displayGridSize;

  // Generate grid lines at each integer coordinate [0, mooreGridSize-1]
  const gridLines = [];
  for (let i = 0; i <= displayGridSize; i++) {
    const pos = padding + i * scale;
    gridLines.push(
      <line
        key={`v-${i}`}
        x1={pos}
        y1={padding}
        x2={pos}
        y2={size - padding}
        className="grid-line"
        strokeWidth="1"
      />
    );
    gridLines.push(
      <line
        key={`h-${i}`}
        x1={padding}
        y1={pos}
        x2={size - padding}
        y2={pos}
        className="grid-line"
        strokeWidth="1"
      />
    );
  }

  // Generate Moore curve path - progressive animation
  // Draw visited portion in green, remaining portion in gray
  let mooreCurvePath = null;
  let mooreCurveGrayPath = null;
  if (
    algorithm === 'moore' &&
    step?.curvePoints &&
    step.curvePoints.length > 0
  ) {
    // Determine the curve position up to which we've progressed
    const curvePosition =
      step.curvePosition !== undefined ? step.curvePosition : 0;

    // Split curve into visited (green) and unvisited (gray) portions
    const visitedPoints = step.curvePoints.slice(0, curvePosition + 1);
    const unvisitedPoints = step.curvePoints.slice(curvePosition);

    // Draw the unvisited (gray) portion first (so green appears on top)
    if (unvisitedPoints.length > 1) {
      const grayPathData = unvisitedPoints
        .map((p, i) => {
          const coords = toSvgCoords(p, padding, scale);
          return i === 0
            ? `M ${coords.x} ${coords.y}`
            : `L ${coords.x} ${coords.y}`;
        })
        .join(' ');
      mooreCurveGrayPath = (
        <path
          d={grayPathData}
          fill="none"
          stroke="rgba(156, 163, 175, 0.5)"
          strokeWidth="3"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      );
    }

    // Draw the visited (green) portion
    if (visitedPoints.length > 0) {
      const greenPathData = visitedPoints
        .map((p, i) => {
          const coords = toSvgCoords(p, padding, scale);
          return i === 0
            ? `M ${coords.x} ${coords.y}`
            : `L ${coords.x} ${coords.y}`;
        })
        .join(' ');
      mooreCurvePath = (
        <path
          d={greenPathData}
          fill="none"
          stroke="rgba(34, 197, 94, 0.6)"
          strokeWidth="3"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      );
    }
  }

  // Generate sweep line for Sonar
  let sweepLine = null;
  let centroidCircle = null;
  if (algorithm === 'sonar' && step?.type === 'sweep' && step?.centroid) {
    const center = toSvgCoords(step.centroid, padding, scale);
    const lineLength = size;
    sweepLine = (
      <line
        x1={center.x}
        y1={center.y}
        x2={center.x + lineLength * Math.cos(step.angle)}
        y2={center.y + lineLength * Math.sin(step.angle)}
        stroke="rgba(13, 110, 253, 0.3)"
        strokeWidth="2"
      />
    );
    centroidCircle = (
      <circle
        cx={center.x}
        cy={center.y}
        r="5"
        fill="rgba(128, 0, 128, 0.3)"
        stroke="purple"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />
    );
  }

  // Generate tour path
  let tourPath = null;
  if (step?.tour && step.tour.length > 1) {
    const isOptimization = step.type === 'optimize' || showOptimization;
    const tourPoints = step.tour.map((idx) =>
      toSvgCoords(points[idx], padding, scale)
    );

    // Determine which edges are modified (for optimization highlighting)
    let modifiedEdges = null;
    if (isOptimization && step.reversed) {
      // 2-opt: edges around the reversed segment are modified
      const [rStart, rEnd] = step.reversed;
      modifiedEdges = new Set();
      modifiedEdges.add(rStart - 1 >= 0 ? rStart - 1 : step.tour.length - 1);
      modifiedEdges.add(rEnd);
      for (let e = rStart; e < rEnd; e++) {
        modifiedEdges.add(e);
      }
    } else if (isOptimization && step.swapped) {
      // Zigzag: highlight edges around swapped points
      modifiedEdges = new Set();
      for (let e = 0; e < step.tour.length; e++) {
        const nextE = (e + 1) % step.tour.length;
        if (
          step.swapped.includes(step.tour[e]) ||
          step.swapped.includes(step.tour[nextE])
        ) {
          modifiedEdges.add(e);
        }
      }
    }

    if (isOptimization && modifiedEdges && modifiedEdges.size > 0) {
      // Draw unmodified edges in blue, modified edges in green
      const edgeElements = [];
      const isClosed = step.tour.length === points.length;
      const edgeCount = isClosed ? tourPoints.length : tourPoints.length - 1;
      for (let i = 0; i < edgeCount; i++) {
        const from = tourPoints[i];
        const to = tourPoints[(i + 1) % tourPoints.length];
        const isModified = modifiedEdges.has(i);
        edgeElements.push(
          <line
            key={`edge-${i}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={isModified ? '#198754' : '#0d6efd'}
            strokeWidth={isModified ? 3 : 2}
            strokeLinecap="round"
          />
        );
      }
      tourPath = <g>{edgeElements}</g>;
    } else {
      let pathData = tourPoints
        .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
        .join(' ');
      // Close the loop if tour is complete
      if (step.tour.length === points.length) {
        pathData += ' Z';
      }
      tourPath = (
        <path
          d={pathData}
          fill="none"
          stroke={isOptimization ? '#198754' : '#0d6efd'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    }
  }

  // Generate point circles
  const pointCircles = points.map((point, idx) => {
    const p = toSvgCoords(point, padding, scale);
    const isInTour = step?.tour?.includes(idx);
    const isLastAdded = step?.tour && step.tour[step.tour.length - 1] === idx;

    let fill = '#6c757d';
    if (isLastAdded) {
      fill = '#dc3545';
    } else if (isInTour) {
      fill = '#0d6efd';
    }

    return (
      <g key={`point-${idx}`}>
        <circle cx={p.x} cy={p.y} r={isLastAdded ? 6 : 4} fill={fill}>
          <title>
            Point {idx} ({point.x}, {point.y})
          </title>
        </circle>
      </g>
    );
  });

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="tsp-svg"
      >
        {/* Grid lines */}
        <g>{gridLines}</g>
        {/* Moore curve - gray (unvisited) portion first, then green (visited) on top */}
        {mooreCurveGrayPath}
        {mooreCurvePath}
        {/* Sweep line for Sonar */}
        {sweepLine}
        {centroidCircle}
        {/* Tour path */}
        {tourPath}
        {/* Points */}
        <g>{pointCircles}</g>
      </svg>
    </div>
  );
};

// Alias for backward compatibility
const TSPCanvas = TSPVisualization;

export { TSPVisualization, TSPCanvas };
export default TSPVisualization;
