/**
 * Main App Component for TSP Visual Solver
 *
 * Orchestrates the TSP solver application including:
 * - State management for points, algorithm steps, and animation
 * - Algorithm execution for both Sonar and Moore algorithms
 * - UI layout with controls and side-by-side visualizations
 */

const { useState, useEffect, useRef, useCallback } = React;

// Import algorithm functions
// Note: When using as ES modules, import from the algorithms package
// These are referenced via global scope when loaded via script tags
const {
  calculateMooreGridSize,
  generateRandomPoints,
  calculateTotalDistance,
  sonarAlgorithmSteps,
  mooreAlgorithmSteps,
  sonarOptimizationSteps,
  mooreOptimizationSteps,
} = window.TSPAlgorithms || {};

// Import UI components
// Note: When using as ES modules, import from the components package
// These are referenced via global scope when loaded via script tags
const { TSPVisualization, Controls, Legend, VisualizationPanel } =
  window.TSPComponents || {};

/**
 * App - Main application component
 */
const App = () => {
  const [gridSize, setGridSize] = useState(10);
  const [numPoints, setNumPoints] = useState(15);
  const [points, setPoints] = useState([]);
  const [speed, setSpeed] = useState(500);
  const [isRunning, setIsRunning] = useState(false);
  const [showOptimization, setShowOptimization] = useState(false);

  // Calculate Moore grid size - this is the unified grid both algorithms use
  // This ensures points land on grid vertices and both algorithms use identical grids
  const mooreGridSize = calculateMooreGridSize(gridSize);

  // Sonar state
  const [sonarSteps, setSonarSteps] = useState([]);
  const [sonarOptSteps, setSonarOptSteps] = useState([]);
  const [sonarCurrentStep, setSonarCurrentStep] = useState(-1);

  // Moore state
  const [mooreSteps, setMooreSteps] = useState([]);
  const [mooreOptSteps, setMooreOptSteps] = useState([]);
  const [mooreCurrentStep, setMooreCurrentStep] = useState(-1);

  const animationRef = useRef(null);

  const generatePoints = useCallback(() => {
    // Generate points on the Moore grid - both algorithms use the same grid
    const newPoints = generateRandomPoints(mooreGridSize, numPoints);
    setPoints(newPoints);
    setSonarSteps([]);
    setSonarOptSteps([]);
    setSonarCurrentStep(-1);
    setMooreSteps([]);
    setMooreOptSteps([]);
    setMooreCurrentStep(-1);
    setIsRunning(false);
    setShowOptimization(false);
  }, [mooreGridSize, numPoints]);

  useEffect(() => {
    generatePoints();
  }, []);

  const startSolution = useCallback(() => {
    if (points.length === 0) return;

    // Generate steps for both algorithms using the same Moore grid
    const newSonarSteps = sonarAlgorithmSteps(points);
    const newMooreSteps = mooreAlgorithmSteps(points, mooreGridSize);

    setSonarSteps(newSonarSteps);
    setMooreSteps(newMooreSteps);
    setSonarCurrentStep(0);
    setMooreCurrentStep(0);
    setShowOptimization(false);
    setIsRunning(true);
  }, [points, mooreGridSize]);

  const stopAnimation = useCallback(() => {
    setIsRunning(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  }, []);

  const startOptimization = useCallback(() => {
    if (sonarSteps.length === 0 || mooreSteps.length === 0) return;

    const sonarTour = sonarSteps[sonarSteps.length - 1]?.tour || [];
    const mooreTour = mooreSteps[mooreSteps.length - 1]?.tour || [];

    const newSonarOptSteps = sonarOptimizationSteps(points, sonarTour);
    const newMooreOptSteps = mooreOptimizationSteps(points, mooreTour);

    setSonarOptSteps(newSonarOptSteps);
    setMooreOptSteps(newMooreOptSteps);
    setSonarCurrentStep(0);
    setMooreCurrentStep(0);
    setShowOptimization(true);
    setIsRunning(true);
  }, [points, sonarSteps, mooreSteps]);

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;

    const currentSonarSteps = showOptimization ? sonarOptSteps : sonarSteps;
    const currentMooreSteps = showOptimization ? mooreOptSteps : mooreSteps;

    const sonarDone = sonarCurrentStep >= currentSonarSteps.length - 1;
    const mooreDone = mooreCurrentStep >= currentMooreSteps.length - 1;

    if (sonarDone && mooreDone) {
      setIsRunning(false);
      return;
    }

    animationRef.current = setTimeout(() => {
      if (!sonarDone) {
        setSonarCurrentStep((prev) =>
          Math.min(prev + 1, currentSonarSteps.length - 1)
        );
      }
      if (!mooreDone) {
        setMooreCurrentStep((prev) =>
          Math.min(prev + 1, currentMooreSteps.length - 1)
        );
      }
    }, speed);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [
    isRunning,
    sonarCurrentStep,
    mooreCurrentStep,
    speed,
    showOptimization,
    sonarSteps,
    mooreSteps,
    sonarOptSteps,
    mooreOptSteps,
  ]);

  const getSonarStep = () => {
    const steps = showOptimization ? sonarOptSteps : sonarSteps;
    return steps[sonarCurrentStep];
  };

  const getMooreStep = () => {
    const steps = showOptimization ? mooreOptSteps : mooreSteps;
    return steps[mooreCurrentStep];
  };

  const calculateSonarDistance = () => {
    const step = getSonarStep();
    if (!step?.tour || step.tour.length < 2) return 0;
    return calculateTotalDistance(step.tour, points);
  };

  const calculateMooreDistance = () => {
    const step = getMooreStep();
    if (!step?.tour || step.tour.length < 2) return 0;
    return calculateTotalDistance(step.tour, points);
  };

  const canOptimize =
    sonarSteps.length > 0 &&
    mooreSteps.length > 0 &&
    !isRunning &&
    !showOptimization &&
    sonarCurrentStep === sonarSteps.length - 1;

  return (
    <div className="app">
      <h1>TSP Visual Solver</h1>

      <Controls
        gridSize={gridSize}
        setGridSize={setGridSize}
        numPoints={numPoints}
        setNumPoints={setNumPoints}
        speed={speed}
        setSpeed={setSpeed}
        mooreGridSize={mooreGridSize}
        isRunning={isRunning}
        canOptimize={canOptimize}
        onGeneratePoints={generatePoints}
        onStart={startSolution}
        onStop={stopAnimation}
        onOptimize={startOptimization}
        pointsCount={points.length}
      />

      <div className="visualization-container">
        <VisualizationPanel
          title="Sonar Visit Algorithm"
          aliases="Also known as: Radial Sweep, Angular Sort, Polar Angle Sort, Centroid-based Ordering"
          distance={calculateSonarDistance()}
          visualization={
            <TSPVisualization
              points={points}
              steps={showOptimization ? sonarOptSteps : sonarSteps}
              currentStep={sonarCurrentStep}
              algorithm="sonar"
              mooreGridSize={mooreGridSize}
              showOptimization={showOptimization}
            />
          }
          stepDescription={getSonarStep()?.description}
          legend={
            <Legend algorithm="sonar" showOptimization={showOptimization} />
          }
        />

        <VisualizationPanel
          title="Moore Curve Algorithm"
          aliases="Also known as: Space-Filling Curve, Hilbert Curve Variant, Fractal Ordering"
          distance={calculateMooreDistance()}
          visualization={
            <TSPVisualization
              points={points}
              steps={showOptimization ? mooreOptSteps : mooreSteps}
              currentStep={mooreCurrentStep}
              algorithm="moore"
              mooreGridSize={mooreGridSize}
              showOptimization={showOptimization}
            />
          }
          stepDescription={getMooreStep()?.description}
          legend={
            <Legend algorithm="moore" showOptimization={showOptimization} />
          }
        />
      </div>
    </div>
  );
};

export { App };
export default App;
