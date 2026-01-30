/**
 * Main App Component for TSP Visual Solver
 *
 * Orchestrates the TSP solver application including:
 * - State management for points, algorithm steps, and animation
 * - Algorithm execution for both Sonar and Moore algorithms
 * - Verification of optimal tour distance via brute-force
 * - UI layout with controls and side-by-side visualizations
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Import algorithm functions from lib
import {
  calculateMooreGridSize,
  generateRandomPoints,
  calculateTotalDistance,
  sonarAlgorithmSteps,
  mooreAlgorithmSteps,
  // Generic optimizations that can work with any tour
  zigzagOptSteps,
  twoOptSteps,
  // Verification
  bruteForceOptimalTour,
  calculateOptimalityRatio,
  BRUTE_FORCE_MAX_POINTS,
} from '../../lib/index.js';

// Import UI components
import { TSPVisualization } from './components/TSPVisualization.jsx';
import { Controls } from './components/Controls.jsx';
import { Legend } from './components/Legend.jsx';
import { VisualizationPanel } from './components/VisualizationPanel.jsx';

/**
 * App - Main application component
 */
const App = () => {
  const [gridSize, setGridSize] = useState(16);
  const [numPoints, setNumPoints] = useState(15);
  const [points, setPoints] = useState([]);
  const [speed, setSpeed] = useState(500);
  const [isRunning, setIsRunning] = useState(false);
  const [showOptimization, setShowOptimization] = useState(false);
  const [activeOptimization, setActiveOptimization] = useState(null);

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

  // Verification state
  const [optimalResult, setOptimalResult] = useState(null);

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
    setActiveOptimization(null);
    setOptimalResult(null);
  }, [mooreGridSize, numPoints]);

  useEffect(() => {
    generatePoints();
  }, []);

  // Compute optimal tour when points change
  useEffect(() => {
    if (points.length >= 2 && points.length <= BRUTE_FORCE_MAX_POINTS) {
      const result = bruteForceOptimalTour(points);
      setOptimalResult(result);
    } else {
      setOptimalResult(null);
    }
  }, [points]);

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
    setActiveOptimization(null);
    setIsRunning(true);
  }, [points, mooreGridSize]);

  const stopAnimation = useCallback(() => {
    setIsRunning(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  }, []);

  const startOptimization = useCallback(
    (method) => {
      if (sonarSteps.length === 0 || mooreSteps.length === 0) return;

      const sonarTour = sonarSteps[sonarSteps.length - 1]?.tour || [];
      const mooreTour = mooreSteps[mooreSteps.length - 1]?.tour || [];

      const optFn = method === '2-opt' ? twoOptSteps : zigzagOptSteps;
      let newSonarOptSteps = optFn(points, sonarTour);
      let newMooreOptSteps = optFn(points, mooreTour);

      const optimalDistance = optimalResult?.distance;
      const methodLabel = method === '2-opt' ? '2-opt' : 'Zigzag';

      // When optimization finds no improvements, create a step with
      // comparison to the true optimal distance (if available)
      if (newSonarOptSteps.length === 0) {
        const sonarDist = calculateTotalDistance(sonarTour, points);
        let description;
        if (optimalDistance && Math.abs(sonarDist - optimalDistance) < 0.001) {
          description = `${methodLabel}: Tour is already optimal (verified)`;
        } else if (optimalDistance) {
          const ratio = calculateOptimalityRatio(sonarDist, optimalDistance);
          description = `${methodLabel}: No improvements found (${((ratio - 1) * 100).toFixed(1)}% above optimal)`;
        } else {
          description = `${methodLabel}: No improvements found`;
        }
        newSonarOptSteps = [
          {
            type: 'optimize',
            tour: [...sonarTour],
            improvement: 0,
            description,
          },
        ];
      }
      if (newMooreOptSteps.length === 0) {
        const mooreDist = calculateTotalDistance(mooreTour, points);
        let description;
        if (optimalDistance && Math.abs(mooreDist - optimalDistance) < 0.001) {
          description = `${methodLabel}: Tour is already optimal (verified)`;
        } else if (optimalDistance) {
          const ratio = calculateOptimalityRatio(mooreDist, optimalDistance);
          description = `${methodLabel}: No improvements found (${((ratio - 1) * 100).toFixed(1)}% above optimal)`;
        } else {
          description = `${methodLabel}: No improvements found`;
        }
        newMooreOptSteps = [
          {
            type: 'optimize',
            tour: [...mooreTour],
            improvement: 0,
            description,
          },
        ];
      }

      setSonarOptSteps(newSonarOptSteps);
      setMooreOptSteps(newMooreOptSteps);
      setSonarCurrentStep(0);
      setMooreCurrentStep(0);
      setShowOptimization(true);
      setActiveOptimization(method);
      setIsRunning(true);
    },
    [points, sonarSteps, mooreSteps, optimalResult]
  );

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
    sonarCurrentStep === sonarSteps.length - 1;

  const formatDistanceInfo = (dist) => {
    if (!optimalResult || dist === 0) {
      return `Distance: ${dist.toFixed(2)}`;
    }
    const ratio = calculateOptimalityRatio(dist, optimalResult.distance);
    const pct = (ratio * 100).toFixed(1);
    return `Distance: ${dist.toFixed(2)} (${pct}% of optimal ${optimalResult.distance.toFixed(2)})`;
  };

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
        activeOptimization={activeOptimization}
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
          distanceInfo={formatDistanceInfo(calculateSonarDistance())}
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
          distanceInfo={formatDistanceInfo(calculateMooreDistance())}
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
