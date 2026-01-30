/**
 * Legend Component
 *
 * Displays the color legend for TSP visualizations.
 * Different legends for Sonar and Moore algorithms.
 */

/**
 * LegendItem - Single legend entry
 *
 * @param {Object} props
 * @param {string} props.color - Background color for the legend marker
 * @param {string} props.label - Text label for the legend entry
 */
const LegendItem = ({ color, label }) => (
  <div className="legend-item">
    <div className="legend-color" style={{ background: color }}></div>
    <span>{label}</span>
  </div>
);

/**
 * SonarLegend - Legend for Sonar algorithm visualization
 *
 * @param {Object} props
 * @param {boolean} props.showOptimization - Whether showing optimization phase
 */
const SonarLegend = ({ showOptimization }) => (
  <div className="legend">
    <LegendItem color="#6c757d" label="Unvisited" />
    <LegendItem color="#0d6efd" label="In Tour" />
    <LegendItem color="#dc3545" label="Current" />
    {showOptimization && <LegendItem color="#198754" label="Optimized" />}
  </div>
);

/**
 * MooreLegend - Legend for Moore Curve algorithm visualization
 *
 * @param {Object} props
 * @param {boolean} props.showOptimization - Whether showing optimization phase
 */
const MooreLegend = ({ showOptimization }) => (
  <div className="legend">
    <LegendItem color="rgba(34, 197, 94, 0.6)" label="Visited Curve" />
    <LegendItem color="rgba(156, 163, 175, 0.5)" label="Unvisited Curve" />
    <LegendItem color="#0d6efd" label="Tour Path" />
    <LegendItem color="#dc3545" label="Current" />
    {showOptimization && <LegendItem color="#198754" label="Optimized" />}
  </div>
);

/**
 * BruteForceLegend - Legend for Brute-Force algorithm visualization
 *
 * @param {Object} props
 * @param {boolean} props.showOptimization - Whether showing optimization phase
 */
const BruteForceLegend = ({ showOptimization }) => (
  <div className="legend">
    <LegendItem color="#6c757d" label="Unvisited" />
    <LegendItem color="#0d6efd" label="In Tour" />
    <LegendItem color="#dc3545" label="Current" />
    {showOptimization && <LegendItem color="#198754" label="Optimized" />}
  </div>
);

/**
 * Legend - Generic legend component
 *
 * @param {Object} props
 * @param {string} props.algorithm - Algorithm type ('sonar', 'moore', or 'brute-force')
 * @param {boolean} props.showOptimization - Whether showing optimization phase
 */
const Legend = ({ algorithm, showOptimization }) => {
  if (algorithm === 'sonar') {
    return <SonarLegend showOptimization={showOptimization} />;
  }
  if (algorithm === 'brute-force') {
    return <BruteForceLegend showOptimization={showOptimization} />;
  }
  return <MooreLegend showOptimization={showOptimization} />;
};

export { Legend, SonarLegend, MooreLegend, BruteForceLegend, LegendItem };
export default Legend;
