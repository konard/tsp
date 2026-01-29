/**
 * Controls Component
 *
 * Control panel for TSP solver including:
 * - Grid size input
 * - Points count input
 * - Animation speed slider
 * - Action buttons (New Points, Start, Stop, Optimize)
 */

/**
 * Controls - Control panel for TSP solver
 *
 * @param {Object} props
 * @param {number} props.gridSize - Current grid size
 * @param {function} props.setGridSize - Grid size setter
 * @param {number} props.numPoints - Number of points
 * @param {function} props.setNumPoints - Points count setter
 * @param {number} props.speed - Animation speed in ms
 * @param {function} props.setSpeed - Speed setter
 * @param {number} props.mooreGridSize - Actual Moore grid size
 * @param {boolean} props.isRunning - Whether animation is running
 * @param {boolean} props.canOptimize - Whether optimization can start
 * @param {function} props.onGeneratePoints - Generate new points handler
 * @param {function} props.onStart - Start algorithm handler
 * @param {function} props.onStop - Stop animation handler
 * @param {function} props.onOptimize - Start optimization handler
 * @param {number} props.pointsCount - Current points count (for Start button state)
 */
const Controls = ({
  gridSize,
  setGridSize,
  numPoints,
  setNumPoints,
  speed,
  setSpeed,
  mooreGridSize,
  isRunning,
  canOptimize,
  onGeneratePoints,
  onStart,
  onStop,
  onOptimize,
  pointsCount,
}) => {
  return (
    <div className="controls">
      <div className="control-group">
        <label>Grid Size (N)</label>
        <input
          type="number"
          min="5"
          max="50"
          value={gridSize}
          onChange={(e) =>
            setGridSize(Math.max(5, Math.min(50, parseInt(e.target.value) || 5)))
          }
          disabled={isRunning}
        />
      </div>

      <div className="control-group">
        <label>Points (M)</label>
        <input
          type="number"
          min="3"
          max={(mooreGridSize + 1) * (mooreGridSize + 1)}
          value={numPoints}
          onChange={(e) =>
            setNumPoints(Math.max(3, parseInt(e.target.value) || 3))
          }
          disabled={isRunning}
        />
      </div>

      <div className="control-group">
        <label>Animation Speed</label>
        <div className="speed-control">
          <span>Fast</span>
          <input
            type="range"
            min="50"
            max="1000"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
          />
          <span>Slow</span>
        </div>
      </div>

      <div className="buttons">
        <button
          className="btn-outline"
          onClick={onGeneratePoints}
          disabled={isRunning}
        >
          New Points
        </button>

        {!isRunning ? (
          <>
            <button
              className="btn-primary"
              onClick={onStart}
              disabled={pointsCount === 0}
            >
              Start
            </button>

            {canOptimize && (
              <button className="btn-secondary" onClick={onOptimize}>
                Optimize
              </button>
            )}
          </>
        ) : (
          <button className="btn-secondary" onClick={onStop}>
            Stop
          </button>
        )}
      </div>
    </div>
  );
};

export { Controls };
export default Controls;
