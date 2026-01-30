/**
 * VisualizationPanel Component
 *
 * A complete visualization panel including:
 * - Header with algorithm name and distance
 * - Algorithm aliases/description
 * - TSP visualization canvas
 * - Step info display
 * - Color legend
 */

/**
 * VisualizationPanel - Complete visualization panel for a single algorithm
 *
 * @param {Object} props
 * @param {string} props.title - Algorithm title
 * @param {string} props.aliases - Alternative algorithm names
 * @param {number} props.distance - Current tour distance
 * @param {React.ReactNode} props.visualization - TSPVisualization component
 * @param {string} props.stepDescription - Current step description
 * @param {React.ReactNode} props.legend - Legend component
 */
const VisualizationPanel = ({
  title,
  aliases,
  distance,
  visualization,
  stepDescription,
  legend,
}) => {
  return (
    <div className="visualization">
      <div className="visualization-header">
        <h2>{title}</h2>
        <span className="visualization-stats">
          Distance: {distance.toFixed(2)}
        </span>
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
