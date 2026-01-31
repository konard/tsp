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

import { LANGUAGES, detectLanguage, t } from './i18n.js';

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
 * Get algorithm metadata using i18n translations
 */
const getAlgorithmMeta = (lang) => ({
  sonar: {
    title: t(lang, 'sonarTitle'),
    aliases: t(lang, 'sonarAliases'),
    vizType: 'sonar',
  },
  moore: {
    title: t(lang, 'mooreTitle'),
    aliases: t(lang, 'mooreAliases'),
    vizType: 'moore',
  },
  'brute-force': {
    title: t(lang, 'bruteForceTitle'),
    aliases: t(lang, 'bruteForceAliases'),
    vizType: 'brute-force',
  },
});

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
 * Check if an algorithm is execution-limited for the given number of points.
 */
const isAlgorithmLimited = (algorithmId, numPoints) =>
  algorithmId === 'brute-force' && numPoints > BRUTE_FORCE_MAX_POINTS;

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
  const maxPoints = mooreGridSize * mooreGridSize;

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

  // Enforce points limit when grid size changes (Issue #5)
  useEffect(() => {
    if (numPoints > maxPoints) {
      setNumPoints(Math.max(3, maxPoints));
    }
  }, [maxPoints, numPoints]);

  const generatePoints = useCallback(() => {
    const actualNumPoints = Math.min(numPoints, maxPoints);
    const newPoints = generateRandomPoints(mooreGridSize, actualNumPoints);
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
  }, [mooreGridSize, numPoints, maxPoints]);

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

  // Compute lower-bound verification when points change
  useEffect(() => {
    if (points.length >= 2) {
      // We use a dummy distance of 0 — we just need the lower bound value
      const result = verifyOptimality(0, points);
      setVerificationResult(result);
    } else {
      setVerificationResult(null);
    }
  }, [points]);

  // Issue #8: Check if either algorithm is limited
  const startDisabled =
    isAlgorithmLimited(leftAlgorithm, points.length) ||
    isAlgorithmLimited(rightAlgorithm, points.length);

  const startDisabledReason = startDisabled
    ? `Brute-Force limited to ${BRUTE_FORCE_MAX_POINTS} points (current: ${points.length})`
    : '';

  const startSolution = useCallback(() => {
    if (points.length === 0 || startDisabled) return;

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
    setLeftOptSteps([]);
    setRightOptSteps([]);
    setIsRunning(true);
  }, [points, mooreGridSize, leftAlgorithm, rightAlgorithm, startDisabled]);

  const stopAnimation = useCallback(() => {
    setIsRunning(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  }, []);

  // Issue #6: Get the current tour for a side (considering optimization)
  const getCurrentTour = useCallback(
    (side) => {
      if (side === 'left') {
        if (showOptimization && leftOptSteps.length > 0) {
          return leftOptSteps[leftOptSteps.length - 1]?.tour || [];
        }
        return leftSteps.length > 0
          ? leftSteps[leftSteps.length - 1]?.tour || []
          : [];
      }
      if (showOptimization && rightOptSteps.length > 0) {
        return rightOptSteps[rightOptSteps.length - 1]?.tour || [];
      }
      return rightSteps.length > 0
        ? rightSteps[rightSteps.length - 1]?.tour || []
        : [];
    },
    [showOptimization, leftOptSteps, rightOptSteps, leftSteps, rightSteps]
  );

  const startOptimization = useCallback(
    (method) => {
      // Issue #6: Use current tour (possibly already optimized)
      const leftTour = getCurrentTour('left');
      const rightTour = getCurrentTour('right');
      if (leftTour.length === 0 || rightTour.length === 0) return;

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
    [points, getCurrentTour, optimalResult]
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

  // Issue #6: canOptimize when solution is done (not running) and we have steps
  const solutionComplete =
    leftSteps.length > 0 &&
    rightSteps.length > 0 &&
    !isRunning &&
    (showOptimization
      ? leftCurrentStep >= leftOptSteps.length - 1
      : leftCurrentStep >= leftSteps.length - 1);

  const canOptimize = solutionComplete;

  // Issue #1: Format distance info with % of optimal and exact length
  const formatDistanceInfo = (dist) => {
    const distLabel = t(lang, 'distance');
    if (dist === 0) {
      return `${distLabel}: \u2014`;
    }
    if (optimalResult) {
      const pct = ((dist / optimalResult.distance) * 100).toFixed(1);
      return `${distLabel}: ${dist.toFixed(2)} (${pct}% ${t(lang, 'ofOptimal')} ${optimalResult.distance.toFixed(2)})`;
    }
    if (verificationResult) {
      const lb = verificationResult.lowerBound;
      if (lb > 0) {
        const pct = ((dist / lb) * 100).toFixed(1);
        return `${distLabel}: ${dist.toFixed(2)} (${pct}% ${t(lang, 'ofLowerBound')} ${lb.toFixed(2)})`;
      }
    }
    return `${distLabel}: ${dist.toFixed(2)}`;
  };

  // Dark/light theme state - default to system preference
  const [theme, setTheme] = useState(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  });
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Language state - default to browser preference
  const [lang, setLang] = useState(detectLanguage);

  // Apply theme to document root for CSS custom properties
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const algorithmMeta = getAlgorithmMeta(lang);
  const leftMeta = algorithmMeta[leftAlgorithm];
  const rightMeta = algorithmMeta[rightAlgorithm];

  // Map algorithm ids to i18n keys
  const algorithmLabelKeys = {
    sonar: 'sonarVisit',
    moore: 'mooreCurve',
    'brute-force': 'bruteForce',
  };

  // Translated algorithm options
  const translatedAlgorithmOptions = ALGORITHM_OPTIONS.map((opt) => ({
    ...opt,
    label: t(lang, algorithmLabelKeys[opt.id]),
  }));

  // Filtered options for algorithm selects (exclude the other side's selection)
  const leftAlgorithmOptions = translatedAlgorithmOptions.filter(
    (opt) => opt.id !== rightAlgorithm
  );
  const rightAlgorithmOptions = translatedAlgorithmOptions.filter(
    (opt) => opt.id !== leftAlgorithm
  );

  return (
    <div className="app">
      <div className="app-header">
        <div className="language-selector">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label="Language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>
        <h1>{t(lang, 'title')}</h1>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? '\u{263E}' : '\u{2600}'}
        </button>
      </div>

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
        startDisabled={startDisabled}
        startDisabledReason={startDisabledReason}
        lang={lang}
      />

      <div className="visualization-container">
        <VisualizationPanel
          selectedAlgorithm={leftAlgorithm}
          onAlgorithmChange={setLeftAlgorithm}
          algorithmOptions={leftAlgorithmOptions}
          isRunning={isRunning}
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
          defaultStepText={t(lang, 'clickStart')}
          legend={
            <Legend
              algorithm={leftMeta.vizType}
              showOptimization={showOptimization}
              lang={lang}
            />
          }
        />

        <VisualizationPanel
          selectedAlgorithm={rightAlgorithm}
          onAlgorithmChange={setRightAlgorithm}
          algorithmOptions={rightAlgorithmOptions}
          isRunning={isRunning}
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
          defaultStepText={t(lang, 'clickStart')}
          legend={
            <Legend
              algorithm={rightMeta.vizType}
              showOptimization={showOptimization}
              lang={lang}
            />
          }
        />
      </div>
    </div>
  );
};

export { App };
export default App;
