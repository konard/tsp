/**
 * Controls Component
 *
 * Control panel for TSP solver including:
 * - Algorithm selection dropdowns (left and right panels)
 * - Grid size selector (valid Moore curve sizes)
 * - Points count input
 * - Animation speed slider
 * - Action buttons (New Points, Start, Stop, 2-opt Optimize, Zigzag Optimize)
 */

import { VALID_GRID_SIZES } from '../../../lib/algorithms/utils.js';

/**
 * Available algorithms for selection.
 * Each entry maps an id to a display label.
 */
export const ALGORITHM_OPTIONS = [
  { id: 'sonar', label: 'Sonar Visit' },
  { id: 'moore', label: 'Moore Curve' },
  { id: 'brute-force', label: 'Brute-Force' },
];

/**
 * Controls - Control panel for TSP solver
 *
 * @param {Object} props
 * @param {number} props.gridSize - Current grid size (must be a valid Moore curve size)
 * @param {function} props.setGridSize - Grid size setter
 * @param {number} props.numPoints - Number of points
 * @param {function} props.setNumPoints - Points count setter
 * @param {number} props.speed - Animation speed in ms
 * @param {function} props.setSpeed - Speed setter
 * @param {number} props.mooreGridSize - Actual Moore grid size
 * @param {boolean} props.isRunning - Whether animation is running
 * @param {boolean} props.canOptimize - Whether optimization can start
 * @param {string|null} props.activeOptimization - Currently active optimization method
 * @param {function} props.onGeneratePoints - Generate new points handler
 * @param {function} props.onStart - Start algorithm handler
 * @param {function} props.onStop - Stop animation handler
 * @param {function} props.onOptimize - Start optimization handler (receives method name)
 * @param {number} props.pointsCount - Current points count (for Start button state)
 * @param {boolean} props.startDisabled - Whether Start button should be disabled
 * @param {string} props.startDisabledReason - Tooltip explaining why Start is disabled
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
  activeOptimization,
  onGeneratePoints,
  onStart,
  onStop,
  onOptimize,
  pointsCount,
  startDisabled,
  startDisabledReason,
}) => {
  const maxPoints = mooreGridSize * mooreGridSize;
  return (
    <div className="controls">
      <div className="control-group">
        <label>Grid Size (N×N)</label>
        <select
          value={gridSize}
          onChange={(e) => setGridSize(parseInt(e.target.value))}
          disabled={isRunning}
        >
          {VALID_GRID_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}×{size}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label>Points (max {maxPoints})</label>
        <input
          type="number"
          min="3"
          max={maxPoints}
          value={numPoints}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 3;
            setNumPoints(Math.max(3, Math.min(val, maxPoints)));
          }}
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
              disabled={pointsCount === 0 || startDisabled}
              title={startDisabledReason || ''}
            >
              Start
            </button>

            {canOptimize && (
              <>
                <button
                  className={`btn-secondary${activeOptimization === '2-opt' ? ' btn-active' : ''}`}
                  onClick={() => onOptimize('2-opt')}
                >
                  2-opt
                </button>
                <button
                  className={`btn-secondary${activeOptimization === 'zigzag' ? ' btn-active' : ''}`}
                  onClick={() => onOptimize('zigzag')}
                >
                  Zigzag
                </button>
              </>
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
