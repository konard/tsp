/**
 * VisualizationPanel Component
 *
 * A complete visualization panel including:
 * - Header with algorithm selector dropdown and distance
 * - Algorithm aliases/description
 * - TSP visualization canvas
 * - Step info display
 * - Color legend
 */

/**
 * VisualizationPanel - Complete visualization panel for a single algorithm
 *
 * @param {Object} props
 * @param {string} props.selectedAlgorithm - Currently selected algorithm id
 * @param {function} props.onAlgorithmChange - Algorithm change handler
 * @param {Array} props.algorithmOptions - Available algorithm options (filtered)
 * @param {boolean} props.isRunning - Whether animation is running
 * @param {string} props.aliases - Alternative algorithm names
 * @param {string} props.distanceInfo - Formatted distance string with optional optimality info
 * @param {React.ReactNode} props.visualization - TSPVisualization component
 * @param {string} props.stepDescription - Current step description
 * @param {React.ReactNode} props.legend - Legend component
 */
const VisualizationPanel = ({
  selectedAlgorithm,
  onAlgorithmChange,
  algorithmOptions,
  isRunning,
  aliases,
  distanceInfo,
  visualization,
  stepDescription,
  legend,
}) => {
  return (
    <div className="visualization">
      <div className="visualization-header">
        <select
          className="algorithm-select"
          value={selectedAlgorithm}
          onChange={(e) => onAlgorithmChange(e.target.value)}
          disabled={isRunning}
        >
          {algorithmOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="visualization-stats">{distanceInfo}</span>
      </div>
      <div className="algorithm-aliases">{aliases}</div>
      <div className="canvas-wrapper">{visualization}</div>
      <div className="step-info">
        {stepDescription || 'Click Start to begin'}
      </div>
      {legend}
    </div>
  );
};

export { VisualizationPanel };
export default VisualizationPanel;
