/**
 * Main App Component for TSP Visual Solver
 *
 * Orchestrates the TSP solver application including:
 * - State management for points, algorithm steps, and animation
 * - Algorithm execution with user-selectable algorithms for side-by-side comparison
 * - Verification of optimal tour distance via lower bound and brute-force
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
  bruteForceAlgorithmSteps,
  bruteForceSolution,
  calculateOptimalityRatio,
  BRUTE_FORCE_MAX_POINTS,
  // Generic optimizations that can work with any tour
  zigzagOptSteps,
  twoOptSteps,
  // Verification
  verifyOptimality,
} from '../../lib/index.js';

// Import UI components
import { TSPVisualization } from './components/TSPVisualization.jsx';
import { Controls, ALGORITHM_OPTIONS } from './components/Controls.jsx';
import { Legend } from './components/Legend.jsx';
import { VisualizationPanel } from './components/VisualizationPanel.jsx';

/**
 * Algorithm metadata: display names and aliases
 */
const ALGORITHM_META = {
  sonar: {
    title: 'Sonar Visit Algorithm',
    aliases:
      'Also known as: Radial Sweep, Angular Sort, Polar Angle Sort, Centroid-based Ordering',
    vizType: 'sonar',
  },
  moore: {
    title: 'Moore Curve Algorithm',
    aliases:
      'Also known as: Space-Filling Curve, Hilbert Curve Variant, Fractal Ordering',
    vizType: 'moore',
  },
  'brute-force': {
    title: 'Brute-Force Algorithm',
    aliases:
      'Also known as: Exhaustive Search, Exact TSP Solver, Permutation Enumeration',
    vizType: 'brute-force',
  },
};

/**
 * Run the specified algorithm on the given points.
 * Returns steps array for progressive visualization.
 */
const runAlgorithmSteps = (algorithmId, points, mooreGridSize) => {
  switch (algorithmId) {
    case 'sonar':
      return sonarAlgorithmSteps(points);
    case 'moore':
      return mooreAlgorithmSteps(points, mooreGridSize);
    case 'brute-force':
      return bruteForceAlgorithmSteps(points);
    default:
      return [];
  }
};

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

  // Algorithm selection state
  const [leftAlgorithm, setLeftAlgorithm] = useState('sonar');
  const [rightAlgorithm, setRightAlgorithm] = useState('moore');

  // Calculate Moore grid size - this is the unified grid both algorithms use
  const mooreGridSize = calculateMooreGridSize(gridSize);

  // Left panel state
  const [leftSteps, setLeftSteps] = useState([]);
  const [leftOptSteps, setLeftOptSteps] = useState([]);
  const [leftCurrentStep, setLeftCurrentStep] = useState(-1);

  // Right panel state
  const [rightSteps, setRightSteps] = useState([]);
  const [rightOptSteps, setRightOptSteps] = useState([]);
  const [rightCurrentStep, setRightCurrentStep] = useState(-1);

  // Verification state
  const [optimalResult, setOptimalResult] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  const animationRef = useRef(null);

  const generatePoints = useCallback(() => {
    const newPoints = generateRandomPoints(mooreGridSize, numPoints);
    setPoints(newPoints);
    setLeftSteps([]);
    setLeftOptSteps([]);
    setLeftCurrentStep(-1);
    setRightSteps([]);
    setRightOptSteps([]);
    setRightCurrentStep(-1);
    setIsRunning(false);
    setShowOptimization(false);
    setActiveOptimization(null);
    setOptimalResult(null);
    setVerificationResult(null);
  }, [mooreGridSize, numPoints]);

  useEffect(() => {
    generatePoints();
  }, []);

  // Compute optimal tour when points change (brute-force for small sets)
  useEffect(() => {
    if (points.length >= 2 && points.length <= BRUTE_FORCE_MAX_POINTS) {
      const result = bruteForceSolution(points);
      setOptimalResult(result);
    } else {
      setOptimalResult(null);
    }
  }, [points]);

  const startSolution = useCallback(() => {
    if (points.length === 0) return;

    const newLeftSteps = runAlgorithmSteps(
      leftAlgorithm,
      points,
      mooreGridSize
    );
    const newRightSteps = runAlgorithmSteps(
      rightAlgorithm,
      points,
      mooreGridSize
    );

    setLeftSteps(newLeftSteps);
    setRightSteps(newRightSteps);
    setLeftCurrentStep(0);
    setRightCurrentStep(0);
    setShowOptimization(false);
    setActiveOptimization(null);
    setIsRunning(true);
  }, [points, mooreGridSize, leftAlgorithm, rightAlgorithm]);

  const stopAnimation = useCallback(() => {
    setIsRunning(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  }, []);

  const startOptimization = useCallback(
    (method) => {
      if (leftSteps.length === 0 || rightSteps.length === 0) return;

      const leftTour = leftSteps[leftSteps.length - 1]?.tour || [];
      const rightTour = rightSteps[rightSteps.length - 1]?.tour || [];

      const optFn = method === '2-opt' ? twoOptSteps : zigzagOptSteps;
      let newLeftOptSteps = optFn(points, leftTour);
      let newRightOptSteps = optFn(points, rightTour);

      const optimalDistance = optimalResult?.distance;
      const methodLabel = method === '2-opt' ? '2-opt' : 'Zigzag';

      // When optimization finds no improvements, create a step with
      // comparison to the true optimal distance (if available)
      if (newLeftOptSteps.length === 0) {
        const leftDist = calculateTotalDistance(leftTour, points);
        let description;
        if (optimalDistance && Math.abs(leftDist - optimalDistance) < 0.001) {
          description = `${methodLabel}: Tour is already optimal (verified)`;
        } else if (optimalDistance) {
          const ratio = calculateOptimalityRatio(leftDist, optimalDistance);
          description = `${methodLabel}: No improvements found (${((ratio - 1) * 100).toFixed(1)}% above optimal)`;
        } else {
          // Use lower-bound verification for larger instances
          const verification = verifyOptimality(leftDist, points);
          if (verification.isOptimal) {
            description = `${methodLabel}: Tour is already optimal (verified by ${verification.method} bound)`;
          } else {
            description = `${methodLabel}: No improvements found (${verification.gapPercent.toFixed(1)}% above lower bound)`;
          }
        }
        newLeftOptSteps = [
          {
            type: 'optimize',
            tour: [...leftTour],
            improvement: 0,
            description,
          },
        ];
      }
      if (newRightOptSteps.length === 0) {
        const rightDist = calculateTotalDistance(rightTour, points);
        let description;
        if (optimalDistance && Math.abs(rightDist - optimalDistance) < 0.001) {
          description = `${methodLabel}: Tour is already optimal (verified)`;
        } else if (optimalDistance) {
          const ratio = calculateOptimalityRatio(rightDist, optimalDistance);
          description = `${methodLabel}: No improvements found (${((ratio - 1) * 100).toFixed(1)}% above optimal)`;
        } else {
          const verification = verifyOptimality(rightDist, points);
          if (verification.isOptimal) {
            description = `${methodLabel}: Tour is already optimal (verified by ${verification.method} bound)`;
          } else {
            description = `${methodLabel}: No improvements found (${verification.gapPercent.toFixed(1)}% above lower bound)`;
          }
        }
        newRightOptSteps = [
          {
            type: 'optimize',
            tour: [...rightTour],
            improvement: 0,
            description,
          },
        ];
      }

      setLeftOptSteps(newLeftOptSteps);
      setRightOptSteps(newRightOptSteps);
      setLeftCurrentStep(0);
      setRightCurrentStep(0);
      setShowOptimization(true);
      setActiveOptimization(method);
      setIsRunning(true);
    },
    [points, leftSteps, rightSteps, optimalResult]
  );

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;

    const currentLeftSteps = showOptimization ? leftOptSteps : leftSteps;
    const currentRightSteps = showOptimization ? rightOptSteps : rightSteps;

    const leftDone = leftCurrentStep >= currentLeftSteps.length - 1;
    const rightDone = rightCurrentStep >= currentRightSteps.length - 1;

    if (leftDone && rightDone) {
      setIsRunning(false);
      return;
    }

    animationRef.current = setTimeout(() => {
      if (!leftDone) {
        setLeftCurrentStep((prev) =>
          Math.min(prev + 1, currentLeftSteps.length - 1)
        );
      }
      if (!rightDone) {
        setRightCurrentStep((prev) =>
          Math.min(prev + 1, currentRightSteps.length - 1)
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
    leftCurrentStep,
    rightCurrentStep,
    speed,
    showOptimization,
    leftSteps,
    rightSteps,
    leftOptSteps,
    rightOptSteps,
  ]);

  const getLeftStep = () => {
    const steps = showOptimization ? leftOptSteps : leftSteps;
    return steps[leftCurrentStep];
  };

  const getRightStep = () => {
    const steps = showOptimization ? rightOptSteps : rightSteps;
    return steps[rightCurrentStep];
  };

  const calculateLeftDistance = () => {
    const step = getLeftStep();
    if (!step?.tour || step.tour.length < 2) return 0;
    return calculateTotalDistance(step.tour, points);
  };

  const calculateRightDistance = () => {
    const step = getRightStep();
    if (!step?.tour || step.tour.length < 2) return 0;
    return calculateTotalDistance(step.tour, points);
  };

  const canOptimize =
    leftSteps.length > 0 &&
    rightSteps.length > 0 &&
    !isRunning &&
    leftCurrentStep === leftSteps.length - 1;

  const formatDistanceInfo = (dist) => {
    if (!optimalResult || dist === 0) {
      return `Distance: ${dist.toFixed(2)}`;
    }
    const ratio = calculateOptimalityRatio(dist, optimalResult.distance);
    const pct = (ratio * 100).toFixed(1);
    return `Distance: ${dist.toFixed(2)} (${pct}% of optimal ${optimalResult.distance.toFixed(2)})`;
  };

  const leftMeta = ALGORITHM_META[leftAlgorithm];
  const rightMeta = ALGORITHM_META[rightAlgorithm];

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
        leftAlgorithm={leftAlgorithm}
        setLeftAlgorithm={setLeftAlgorithm}
        rightAlgorithm={rightAlgorithm}
        setRightAlgorithm={setRightAlgorithm}
      />

      <div className="visualization-container">
        <VisualizationPanel
          title={leftMeta.title}
          aliases={leftMeta.aliases}
          distanceInfo={formatDistanceInfo(calculateLeftDistance())}
          visualization={
            <TSPVisualization
              points={points}
              steps={showOptimization ? leftOptSteps : leftSteps}
              currentStep={leftCurrentStep}
              algorithm={leftMeta.vizType}
              mooreGridSize={mooreGridSize}
              showOptimization={showOptimization}
            />
          }
          stepDescription={getLeftStep()?.description}
          legend={
            <Legend
              algorithm={leftMeta.vizType}
              showOptimization={showOptimization}
            />
          }
        />

        <VisualizationPanel
          title={rightMeta.title}
          aliases={rightMeta.aliases}
          distanceInfo={formatDistanceInfo(calculateRightDistance())}
          visualization={
            <TSPVisualization
              points={points}
              steps={showOptimization ? rightOptSteps : rightSteps}
              currentStep={rightCurrentStep}
              algorithm={rightMeta.vizType}
              mooreGridSize={mooreGridSize}
              showOptimization={showOptimization}
            />
          }
          stepDescription={getRightStep()?.description}
          legend={
            <Legend
              algorithm={rightMeta.vizType}
              showOptimization={showOptimization}
            />
          }
        />
      </div>
    </div>
  );
};

export { App };
export default App;
